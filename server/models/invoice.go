package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type InvoiceClient struct {
	Name    string `bson:"name" json:"name"`
	Email   string `bson:"email" json:"email"`
	Phone   string `bson:"phone" json:"phone"`
	Address string `bson:"address" json:"address"`
}

type InvoiceItem struct {
	ItemName  string  `bson:"itemName" json:"itemName"`
	Quantity  float64 `bson:"quantity" json:"quantity"`
	UnitPrice float64 `bson:"unitPrice" json:"unitPrice"`
	Discount  float64 `bson:"discount" json:"discount"`
}

type PaymentRecord struct {
	AmountPaid    float64 `bson:"amountPaid" json:"amountPaid"`
	DatePaid      string  `bson:"datePaid" json:"datePaid"`
	PaymentMethod string  `bson:"paymentMethod" json:"paymentMethod"`
	Note          string  `bson:"note" json:"note"`
	PaidBy        string  `bson:"paidBy" json:"paidBy"`
}

type Invoice struct {
	ID                  primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	InvoiceNumber       string             `bson:"invoiceNumber" json:"invoiceNumber"`
	Type                string             `bson:"type" json:"type"`
	Status              string             `bson:"status" json:"status"`
	Currency            string             `bson:"currency" json:"currency"`
	DueDate             string             `bson:"dueDate" json:"dueDate"`
	CreatedAt           string             `bson:"createdAt" json:"createdAt"`
	Client              InvoiceClient      `bson:"client" json:"client"`
	Items               []InvoiceItem      `bson:"items" json:"items"`
	SubTotal            float64            `bson:"subTotal" json:"subTotal"`
	VAT                 float64            `bson:"vat" json:"vat"`
	Total               float64            `bson:"total" json:"total"`
	TotalAmountReceived float64            `bson:"totalAmountReceived" json:"totalAmountReceived"`
	Rates               string             `bson:"rates" json:"rates"`
	Notes               string             `bson:"notes" json:"notes"`
	Creator             string             `bson:"creator" json:"creator"`
	PaymentRecords      []PaymentRecord    `bson:"paymentRecords" json:"paymentRecords"`
}
