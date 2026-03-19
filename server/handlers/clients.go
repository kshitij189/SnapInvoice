package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"math"
	"net/http"
	"strconv"
	"time"

	"snapinvoice-go/db"
	"snapinvoice-go/middleware"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func GetClientsByUser(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	searchQuery := r.URL.Query().Get("searchQuery")
	if searchQuery == "" {
		searchQuery = userID
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{"userId": searchQuery}
	opts := options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}})

	cursor, err := db.Clients().Find(ctx, filter, opts)
	if err != nil {
		jsonResponse(w, http.StatusInternalServerError, map[string]string{"message": err.Error()})
		return
	}
	defer cursor.Close(ctx)

	var clients []bson.M
	if err := cursor.All(ctx, &clients); err != nil {
		jsonResponse(w, http.StatusInternalServerError, map[string]string{"message": err.Error()})
		return
	}

	// Convert ObjectId to string in response
	result := convertIDsInList(clients)
	jsonResponse(w, http.StatusOK, result)
}

func GetAllClients(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	pageStr := r.URL.Query().Get("page")
	searchQuery := r.URL.Query().Get("searchQuery")

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{"userId": userID}
	if searchQuery != "" {
		filter["name"] = bson.M{"$regex": searchQuery, "$options": "i"}
	}

	totalCount, err := db.Clients().CountDocuments(ctx, filter)
	if err != nil {
		jsonResponse(w, http.StatusInternalServerError, map[string]string{"message": err.Error()})
		return
	}

	pageSize := int64(8)
	numberOfPages := int(math.Ceil(float64(totalCount) / float64(pageSize)))
	if numberOfPages < 1 {
		numberOfPages = 1
	}

	skip := int64((page - 1)) * pageSize
	opts := options.Find().
		SetSort(bson.D{{Key: "createdAt", Value: -1}}).
		SetSkip(skip).
		SetLimit(pageSize)

	cursor, err := db.Clients().Find(ctx, filter, opts)
	if err != nil {
		jsonResponse(w, http.StatusInternalServerError, map[string]string{"message": err.Error()})
		return
	}
	defer cursor.Close(ctx)

	var clients []bson.M
	if err := cursor.All(ctx, &clients); err != nil {
		jsonResponse(w, http.StatusInternalServerError, map[string]string{"message": err.Error()})
		return
	}

	result := convertIDsInList(clients)

	jsonResponse(w, http.StatusOK, map[string]interface{}{
		"data":          result,
		"currentPage":   page,
		"numberOfPages": numberOfPages,
		"totalCount":    totalCount,
	})
}

func CreateClient(w http.ResponseWriter, r *http.Request) {
	var body map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"message": "Invalid request body"})
		return
	}

	userID := middleware.GetUserID(r)
	if body["userId"] == nil || body["userId"] == "" {
		body["userId"] = userID
	}
	body["createdAt"] = time.Now().UTC().Format(time.RFC3339)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := db.Clients().InsertOne(ctx, body)
	if err != nil {
		jsonResponse(w, http.StatusInternalServerError, map[string]string{"message": err.Error()})
		return
	}

	body["_id"] = result.InsertedID.(primitive.ObjectID).Hex()
	jsonResponse(w, http.StatusCreated, body)
}

func GetClient(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	objID, err := parseObjectID(id)
	if err != nil {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"message": fmt.Sprintf("Invalid id: %s", id)})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var client bson.M
	err = db.Clients().FindOne(ctx, bson.M{"_id": objID}).Decode(&client)
	if err != nil {
		jsonResponse(w, http.StatusNotFound, map[string]string{"message": fmt.Sprintf("Client not found with id: %s", id)})
		return
	}

	convertID(client)
	jsonResponse(w, http.StatusOK, client)
}

func UpdateClient(w http.ResponseWriter, r *http.Request) {
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

	updatableFields := []string{"name", "email", "phone", "address"}
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
	err = db.Clients().FindOneAndUpdate(ctx, bson.M{"_id": objID}, bson.M{"$set": updateDoc}, opts).Decode(&updated)
	if err != nil {
		jsonResponse(w, http.StatusNotFound, map[string]string{"message": fmt.Sprintf("Client not found with id: %s", id)})
		return
	}

	convertID(updated)
	jsonResponse(w, http.StatusOK, updated)
}

func DeleteClient(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	objID, err := parseObjectID(id)
	if err != nil {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"message": fmt.Sprintf("Invalid id: %s", id)})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := db.Clients().DeleteOne(ctx, bson.M{"_id": objID})
	if err != nil || result.DeletedCount == 0 {
		jsonResponse(w, http.StatusNotFound, map[string]string{"message": fmt.Sprintf("Client not found with id: %s", id)})
		return
	}

	jsonResponse(w, http.StatusOK, map[string]string{"message": "Client deleted successfully"})
}

// Helper to convert ObjectId fields to string in a bson.M document
func convertID(doc bson.M) {
	if id, ok := doc["_id"].(primitive.ObjectID); ok {
		doc["_id"] = id.Hex()
	}
}

func convertIDsInList(docs []bson.M) []bson.M {
	if docs == nil {
		return []bson.M{}
	}
	for _, doc := range docs {
		convertID(doc)
	}
	return docs
}
