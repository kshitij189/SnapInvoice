package handlers

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"html/template"
	"log"
	"math"
	"mime/multipart"
	"net/http"
	"net/smtp"
	"net/textproto"
	"net/url"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"snapinvoice-go/config"
	"snapinvoice-go/db"

	"github.com/chromedp/cdproto/page"
	"github.com/chromedp/chromedp"
	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

var (
	pdfCache  sync.Map
	pdfTmpl   *template.Template
	emailTmpl *template.Template
)

func InitTemplates() {
	funcMap := template.FuncMap{
		"isEven": func(i int) bool { return i%2 == 0 },
		"formatMoney": func(v interface{}) string {
			var f float64
			switch val := v.(type) {
			case float64:
				f = val
			case int:
				f = float64(val)
			case int64:
				f = float64(val)
			case float32:
				f = float64(val)
			default:
				return "0.00"
			}
			return formatWithCommas(f)
		},
		"mul": func(a, b float64) float64 { return a * b },
		"div": func(a, b float64) float64 {
			if b == 0 {
				return 0
			}
			return a / b
		},
		"sub":  func(a, b float64) float64 { return a - b },
		"add1": func(i int) int { return i + 1 },
		"calcItemAmount": func(qty, price, discount float64) float64 {
			amount := qty * price
			if discount > 0 {
				amount = amount * (1 - discount/100)
			}
			return amount
		},
	}

	var err error
	pdfTmpl, err = template.New("invoice-pdf.html").Funcs(funcMap).ParseFiles("templates/invoice-pdf.html")
	if err != nil {
		log.Fatalf("Failed to parse PDF template: %v", err)
	}

	emailTmpl, err = template.New("invoice-email.html").Funcs(funcMap).ParseFiles("templates/invoice-email.html")
	if err != nil {
		log.Fatalf("Failed to parse email template: %v", err)
	}
}

type PDFData struct {
	CompanyName         string
	CompanyEmail        string
	CompanyPhone        string
	CompanyAddress      string
	CompanyWebsite      string
	InvoiceNumber       string
	InvoiceType         string
	Status              string
	StatusColor         string
	Currency            string
	DueDate             string
	CreatedAt           string
	ClientName          string
	ClientEmail         string
	ClientPhone         string
	ClientAddress       string
	Items               []PDFItem
	SubTotal            string
	VAT                 float64
	VATAmount           string
	Total               string
	TotalAmountReceived string
	BalanceDue          string
	Notes               string
}

type PDFItem struct {
	ItemName  string
	Quantity  float64
	UnitPrice float64
	Discount  float64
	Amount    float64
}

func getStatusColor(status string) string {
	colors := map[string]string{
		"Paid":    "#4caf50",
		"Partial": "#ff9800",
		"Unpaid":  "#f44336",
		"Overdue": "#d32f2f",
	}
	if c, ok := colors[status]; ok {
		return c
	}
	return "#9e9e9e"
}

func formatDate(dateStr string) string {
	dateStr = strings.Replace(dateStr, "Z", "+00:00", 1)
	formats := []string{
		time.RFC3339,
		time.RFC3339Nano,
		"2006-01-02T15:04:05.000+00:00",
		"2006-01-02T15:04:05+00:00",
		"2006-01-02T15:04:05",
		"2006-01-02",
	}
	for _, f := range formats {
		if t, err := time.Parse(f, dateStr); err == nil {
			return t.Format("Jan 02, 2006")
		}
	}
	return dateStr
}

func formatWithCommas(f float64) string {
	negative := f < 0
	if negative {
		f = -f
	}
	intPart := int64(f)
	decPart := f - float64(intPart)

	s := fmt.Sprintf("%d", intPart)
	if len(s) > 3 {
		var result []byte
		for i, c := range s {
			if i > 0 && (len(s)-i)%3 == 0 {
				result = append(result, ',')
			}
			result = append(result, byte(c))
		}
		s = string(result)
	}

	decStr := fmt.Sprintf("%.2f", decPart)
	if negative {
		return "-" + s + decStr[1:]
	}
	return s + decStr[1:]
}

func toFloat64(v interface{}) float64 {
	if v == nil {
		return 0
	}
	switch val := v.(type) {
	case float64:
		return val
	case float32:
		return float64(val)
	case int:
		return float64(val)
	case int32:
		return float64(val)
	case int64:
		return float64(val)
	case uint:
		return float64(val)
	case uint32:
		return float64(val)
	case uint64:
		return float64(val)
	case json.Number:
		f, _ := val.Float64()
		return f
	case primitive.Decimal128:
		f, _ := strconv.ParseFloat(val.String(), 64)
		return f
	case string:
		f, _ := strconv.ParseFloat(strings.TrimSpace(val), 64)
		return f
	default:
		s := strings.TrimSpace(fmt.Sprintf("%v", v))
		f, _ := strconv.ParseFloat(s, 64)
		return f
	}
}

func toString(v interface{}) string {
	if v == nil {
		return ""
	}
	if s, ok := v.(string); ok {
		return s
	}
	// Handle primitive.DateTime
	if dt, ok := v.(primitive.DateTime); ok {
		return dt.Time().UTC().Format(time.RFC3339)
	}
	return fmt.Sprintf("%v", v)
}

func buildPDFData(data map[string]interface{}) PDFData {
	var clientName, clientEmail, clientPhone, clientAddress string
	clientMap := make(map[string]interface{})
	if rawClient := data["client"]; rawClient != nil {
		switch v := rawClient.(type) {
		case map[string]interface{}:
			clientMap = v
		case primitive.M:
			clientMap = v
		case primitive.D:
			clientMap = v.Map()
		}
	}

	if len(clientMap) > 0 {
		clientName = toString(clientMap["name"])
		clientEmail = toString(clientMap["email"])
		clientPhone = toString(clientMap["phone"])
		clientAddress = toString(clientMap["address"])
	}

	var items []PDFItem
	var rawItems []interface{}
	
	switch v := data["items"].(type) {
	case []interface{}:
		rawItems = v
	case primitive.A:
		rawItems = v
	default:
		log.Printf("DEBUG: data['items'] is unknown type: %T", data["items"])
	}

	if rawItems != nil {
		for _, ri := range rawItems {
			itemMap := make(map[string]interface{})
			
			switch v := ri.(type) {
			case map[string]interface{}:
				itemMap = v
			case primitive.M:
				itemMap = v
			case primitive.D:
				itemMap = v.Map()
			case *primitive.D:
				if v != nil {
					itemMap = v.Map()
				}
			case *primitive.M:
				if v != nil {
					itemMap = *v
				}
			}

			if len(itemMap) == 0 {
				// Try a final brute force approach if it's some other map type
				if m, ok := ri.(bson.M); ok {
					itemMap = m
				}
			}

			if len(itemMap) > 0 {
				qty := toFloat64(itemMap["quantity"])
				price := toFloat64(itemMap["unitPrice"])
				disc := toFloat64(itemMap["discount"])
				itemName := toString(itemMap["itemName"])
				
				items = append(items, PDFItem{
					ItemName:  itemName,
					Quantity:  qty,
					UnitPrice: price,
					Discount:  disc,
					Amount:    qty * price * (1 - disc/100),
				})
			} else {
			}
		}
	}

	subTotal := toFloat64(data["subTotal"])
	vat := toFloat64(data["vat"])
	total := toFloat64(data["total"])
	totalReceived := toFloat64(data["totalAmountReceived"])
	vatAmount := subTotal * vat / 100
	balanceDue := total - totalReceived

	companyName := toString(data["companyName"])
	if companyName == "" {
		companyName = "SnapInvoice"
	}

	invoiceType := toString(data["type"])
	if invoiceType == "" {
		invoiceType = "Invoice"
	}

	status := toString(data["status"])

	return PDFData{
		CompanyName:         companyName,
		CompanyEmail:        toString(data["companyEmail"]),
		CompanyPhone:        toString(data["companyPhone"]),
		CompanyAddress:      toString(data["companyAddress"]),
		CompanyWebsite:      toString(data["companyWebsite"]),
		InvoiceNumber:       toString(data["invoiceNumber"]),
		InvoiceType:         invoiceType,
		Status:              status,
		StatusColor:         getStatusColor(status),
		Currency:            toString(data["currency"]),
		DueDate:             formatDate(toString(data["dueDate"])),
		CreatedAt:           formatDate(toString(data["createdAt"])),
		ClientName:          clientName,
		ClientEmail:         clientEmail,
		ClientPhone:         clientPhone,
		ClientAddress:       clientAddress,
		Items:               items,
		SubTotal:            formatWithCommas(subTotal),
		VAT:                 vat,
		VATAmount:           formatWithCommas(vatAmount),
		Total:               formatWithCommas(total),
		TotalAmountReceived: formatWithCommas(totalReceived),
		BalanceDue:          formatWithCommas(math.Max(balanceDue, 0)),
		Notes:               toString(data["notes"]),
	}
}

func generatePDFBytes(data map[string]interface{}) ([]byte, error) {
	pdfData := buildPDFData(data)
	
	// Create context
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	var allocCtx context.Context
	var allocCancel context.CancelFunc

	remoteURL := os.Getenv("CHROME_REMOTE_URL")
	if remoteURL != "" {
		// Auto-fix common URL mistakes
		u, err := url.Parse(remoteURL)
		if err == nil {
			// 1. Fix scheme
			if u.Scheme == "http" {
				u.Scheme = "ws"
			} else if u.Scheme == "https" {
				u.Scheme = "wss"
			}
			
			// 2. Fix Browserless specific missing port
			if strings.Contains(u.Host, "chrome.browserless.io") && !strings.Contains(u.Host, ":") {
				if u.Scheme == "wss" {
					u.Host += ":443"
				} else {
					u.Host += ":80"
				}
			}
			
			remoteURL = u.String()
		}

		log.Printf("Using remote browser: %s", remoteURL)
		allocCtx, allocCancel = chromedp.NewRemoteAllocator(ctx, remoteURL)
	} else {
		opts := append(chromedp.DefaultExecAllocatorOptions[:],
			chromedp.NoSandbox,
			chromedp.Headless,
			chromedp.DisableGPU,
		)
		allocCtx, allocCancel = chromedp.NewExecAllocator(ctx, opts...)
	}
	defer allocCancel()

	// Create chromedp context
	taskCtx, taskCancel := chromedp.NewContext(allocCtx)
	defer taskCancel()

	var buf bytes.Buffer
	if err := pdfTmpl.Execute(&buf, pdfData); err != nil {
		return nil, fmt.Errorf("template render error: %w", err)
	}
	html := buf.String()

	var pdfBuffer []byte
	if err := chromedp.Run(taskCtx,
		chromedp.Navigate("about:blank"),
		chromedp.ActionFunc(func(ctx context.Context) error {
			return page.SetDocumentContent("", html).Do(ctx)
		}),
		chromedp.WaitReady("body"),
		chromedp.ActionFunc(func(ctx context.Context) error {
			var err error
			pdfBuffer, _, err = page.PrintToPDF().
				WithPrintBackground(true).
				WithPaperWidth(8.27). // A4 width
				WithPaperHeight(11.69). // A4 height
				Do(ctx)
			return err
		}),
	); err != nil {
		log.Printf("PDF generation failed: %v", err)
		return nil, fmt.Errorf("pdf generation error: %w", err)
	}

	log.Printf("PDF generated successfully, size: %d bytes", len(pdfBuffer))
	return pdfBuffer, nil
}

func flattenData(body map[string]interface{}) map[string]interface{} {
	data := make(map[string]interface{})

	if inv, ok := body["invoiceData"].(map[string]interface{}); ok {
		for k, v := range inv {
			data[k] = v
		}
	}

	if prof, ok := body["profileData"].(map[string]interface{}); ok {
		data["companyName"] = prof["businessName"]
		data["companyEmail"] = prof["email"]
		data["companyPhone"] = prof["phoneNumber"]
		data["companyAddress"] = prof["contactAddress"]
		data["companyWebsite"] = prof["website"]
	}

	for _, key := range []string{"email", "company", "balance", "link"} {
		if v, ok := body[key]; ok {
			data[key] = v
		}
	}

	return data
}

func SendPDF(w http.ResponseWriter, r *http.Request) {
	var body map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"message": "Invalid request body"})
		return
	}

	email := toString(body["email"])
	if email == "" {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"message": "Recipient email is required"})
		return
	}

	data := flattenData(body)

	pdfBytes, err := generatePDFBytes(data)
	if err != nil {
		log.Printf("SendPDF: generatePDFBytes failed: %v", err)
		jsonResponse(w, http.StatusInternalServerError, map[string]string{"message": fmt.Sprintf("Failed to generate PDF: %s", err.Error())})
		return
	}

	companyName := toString(data["companyName"])
	if companyName == "" {
		companyName = "SnapInvoice"
	}

	emailData := map[string]interface{}{
		"CompanyName":   companyName,
		"InvoiceNumber": toString(data["invoiceNumber"]),
		"Balance":       formatWithCommas(toFloat64(data["balance"])),
		"Currency":      toString(data["currency"]),
		"Link":          toString(data["link"]),
	}

	var emailBuf bytes.Buffer
	if err := emailTmpl.Execute(&emailBuf, emailData); err != nil {
		log.Printf("SendPDF: Email template execution failed: %v", err)
		jsonResponse(w, http.StatusInternalServerError, map[string]string{"message": fmt.Sprintf("Failed to prepare email: %s", err.Error())})
		return
	}

	invoiceNumber := toString(data["invoiceNumber"])
	subject := fmt.Sprintf("Invoice from %s", companyName)
	filename := fmt.Sprintf("invoice-%s.pdf", invoiceNumber)

	if err := sendEmailWithAttachment(email, subject, emailBuf.String(), filename, pdfBytes); err != nil {
		log.Printf("Failed to send email: %v", err)
		jsonResponse(w, http.StatusInternalServerError, map[string]string{"message": fmt.Sprintf("Failed to send PDF: %s", err.Error())})
		return
	}

	jsonResponse(w, http.StatusOK, map[string]string{"message": "Invoice sent successfully"})
}

func sendEmailWithAttachment(to, subject, htmlBody, filename string, attachment []byte) error {
	cfg := config.AppConfig
	from := cfg.EmailFrom

	var buf bytes.Buffer
	writer := multipart.NewWriter(&buf)

	htmlHeader := textproto.MIMEHeader{}
	htmlHeader.Set("Content-Type", "text/html; charset=UTF-8")
	htmlPart, err := writer.CreatePart(htmlHeader)
	if err != nil {
		return err
	}
	htmlPart.Write([]byte(htmlBody))

	attachHeader := textproto.MIMEHeader{}
	attachHeader.Set("Content-Type", "application/pdf")
	attachHeader.Set("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, filename))
	attachHeader.Set("Content-Transfer-Encoding", "base64")
	attachPart, err := writer.CreatePart(attachHeader)
	if err != nil {
		return err
	}
	attachPart.Write([]byte(base64.StdEncoding.EncodeToString(attachment)))

	writer.Close()

	headers := fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\nMIME-Version: 1.0\r\nContent-Type: multipart/mixed; boundary=%s\r\n\r\n",
		from, to, subject, writer.Boundary())

	msg := []byte(headers + buf.String())

	addr := fmt.Sprintf("%s:%d", cfg.EmailHost, cfg.EmailPort)
	auth := smtp.PlainAuth("", cfg.EmailUser, cfg.EmailPass, cfg.EmailHost)

	return smtp.SendMail(addr, auth, from, []string{to}, msg)
}

func CreatePDF(w http.ResponseWriter, r *http.Request) {
	var body map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"message": "Invalid request body"})
		return
	}

	data := flattenData(body)
	pdfBytes, err := generatePDFBytes(data)
	if err != nil {
		jsonResponse(w, http.StatusInternalServerError, map[string]string{"message": fmt.Sprintf("Failed to create PDF: %s", err.Error())})
		return
	}

	pdfCache.Store("latest", pdfBytes)

	jsonResponse(w, http.StatusOK, map[string]interface{}{
		"message": "PDF created successfully",
		"key":     "latest",
	})
}

func FetchPDF(w http.ResponseWriter, r *http.Request) {
	val, ok := pdfCache.Load("latest")
	if !ok {
		jsonResponse(w, http.StatusNotFound, map[string]string{"message": "No PDF found. Create one first."})
		return
	}

	pdfBytes := val.([]byte)
	w.Header().Set("Content-Type", "application/pdf")
	w.Header().Set("Content-Disposition", `attachment; filename="invoice.pdf"`)
	w.Write(pdfBytes)
}

func PublicPDF(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	objID, err := parseObjectID(id)
	if err != nil {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"message": fmt.Sprintf("Invalid id: %s", id)})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var invoice bson.M
	err = db.Invoices().FindOne(ctx, bson.M{"_id": objID}).Decode(&invoice)
	if err != nil {
		jsonResponse(w, http.StatusNotFound, map[string]string{"message": "Invoice not found"})
		return
	}

	creatorID := toString(invoice["creator"])

	var profile bson.M
	db.Profiles().FindOne(ctx, bson.M{"userId": creatorID}).Decode(&profile)

	data := make(map[string]interface{})
	for k, v := range invoice {
		data[k] = v
	}

	if profile != nil {
		data["companyName"] = toString(profile["businessName"])
		data["companyEmail"] = toString(profile["email"])
		data["companyPhone"] = toString(profile["phoneNumber"])
		data["companyAddress"] = toString(profile["contactAddress"])
		data["companyWebsite"] = toString(profile["website"])
	}

	pdfBytes, err := generatePDFBytes(data)
	if err != nil {
		jsonResponse(w, http.StatusInternalServerError, map[string]string{"message": fmt.Sprintf("Failed to generate PDF: %s", err.Error())})
		return
	}

	invoiceNumber := toString(data["invoiceNumber"])
	w.Header().Set("Content-Type", "application/pdf")
	w.Header().Set("Content-Disposition", fmt.Sprintf(`inline; filename="invoice-%s.pdf"`, invoiceNumber))
	w.Write(pdfBytes)
}

func getKeys(m map[string]interface{}) []string {
	keys := make([]string, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	return keys
}
