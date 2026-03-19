package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"snapinvoice-go/db"
	"snapinvoice-go/middleware"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func GetInvoices(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	searchQuery := r.URL.Query().Get("searchQuery")
	if searchQuery == "" {
		searchQuery = userID
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{"creator": searchQuery}
	opts := options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}})

	cursor, err := db.Invoices().Find(ctx, filter, opts)
	if err != nil {
		jsonResponse(w, http.StatusInternalServerError, map[string]string{"message": err.Error()})
		return
	}
	defer cursor.Close(ctx)

	var invoices []bson.M
	if err := cursor.All(ctx, &invoices); err != nil {
		jsonResponse(w, http.StatusInternalServerError, map[string]string{"message": err.Error()})
		return
	}

	result := convertIDsInList(invoices)
	jsonResponse(w, http.StatusOK, result)
}

func CreateInvoice(w http.ResponseWriter, r *http.Request) {
	var body map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"message": "Invalid request body"})
		return
	}

	userID := middleware.GetUserID(r)
	if body["creator"] == nil || body["creator"] == "" {
		body["creator"] = userID
	}

	// Server-generated createdAt
	body["createdAt"] = time.Now().UTC().Format(time.RFC3339)

	// Defaults
	if body["type"] == nil || body["type"] == "" {
		body["type"] = "Invoice"
	}
	if body["status"] == nil || body["status"] == "" {
		body["status"] = "Unpaid"
	}
	if body["totalAmountReceived"] == nil {
		body["totalAmountReceived"] = 0.0
	}
	if body["paymentRecords"] == nil {
		body["paymentRecords"] = []interface{}{}
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := db.Invoices().InsertOne(ctx, body)
	if err != nil {
		jsonResponse(w, http.StatusInternalServerError, map[string]string{"message": err.Error()})
		return
	}

	body["_id"] = result.InsertedID.(primitive.ObjectID).Hex()
	jsonResponse(w, http.StatusCreated, body)
}

func GetInvoiceCount(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	searchQuery := r.URL.Query().Get("searchQuery")
	if searchQuery == "" {
		searchQuery = userID
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	count, err := db.Invoices().CountDocuments(ctx, bson.M{"creator": searchQuery})
	if err != nil {
		jsonResponse(w, http.StatusInternalServerError, map[string]string{"message": err.Error()})
		return
	}

	jsonResponse(w, http.StatusOK, map[string]interface{}{"totalCount": count})
}

func GetInvoice(w http.ResponseWriter, r *http.Request) {
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
		jsonResponse(w, http.StatusNotFound, map[string]string{"message": fmt.Sprintf("Invoice not found with id: %s", id)})
		return
	}

	convertID(invoice)
	jsonResponse(w, http.StatusOK, invoice)
}

func UpdateInvoice(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	objID, err := parseObjectID(id)
	if err != nil {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"message": fmt.Sprintf("Invalid id: %s", id)})
		return
	}

	var body map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"message": "Invalid request body"})
		return
	}

	updatableFields := []string{
		"dueDate", "currency", "items", "rates", "vat", "total", "subTotal",
		"notes", "status", "invoiceNumber", "type", "creator",
		"totalAmountReceived", "client", "paymentRecords",
	}
	updateDoc := bson.M{}
	for _, field := range updatableFields {
		if v, ok := body[field]; ok && v != nil {
			updateDoc[field] = v
		}
	}

	if len(updateDoc) == 0 {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"message": "No fields to update"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	opts := options.FindOneAndUpdate().SetReturnDocument(options.After)
	var updated bson.M
	err = db.Invoices().FindOneAndUpdate(ctx, bson.M{"_id": objID}, bson.M{"$set": updateDoc}, opts).Decode(&updated)
	if err != nil {
		jsonResponse(w, http.StatusNotFound, map[string]string{"message": fmt.Sprintf("Invoice not found with id: %s", id)})
		return
	}

	convertID(updated)
	jsonResponse(w, http.StatusOK, updated)
}

func DeleteInvoice(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	objID, err := parseObjectID(id)
	if err != nil {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"message": fmt.Sprintf("Invalid id: %s", id)})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := db.Invoices().DeleteOne(ctx, bson.M{"_id": objID})
	if err != nil || result.DeletedCount == 0 {
		jsonResponse(w, http.StatusNotFound, map[string]string{"message": fmt.Sprintf("Invoice not found with id: %s", id)})
		return
	}

	jsonResponse(w, http.StatusOK, map[string]string{"message": "Invoice deleted successfully"})
}
