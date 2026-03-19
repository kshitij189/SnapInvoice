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

func GetProfiles(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	searchQuery := r.URL.Query().Get("searchQuery")
	if searchQuery == "" {
		searchQuery = userID
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := db.Profiles().Find(ctx, bson.M{"userId": searchQuery})
	if err != nil {
		jsonResponse(w, http.StatusInternalServerError, map[string]string{"message": err.Error()})
		return
	}
	defer cursor.Close(ctx)

	var profiles []bson.M
	if err := cursor.All(ctx, &profiles); err != nil {
		jsonResponse(w, http.StatusInternalServerError, map[string]string{"message": err.Error()})
		return
	}

	result := convertIDsInList(profiles)
	jsonResponse(w, http.StatusOK, result)
}

func CreateProfile(w http.ResponseWriter, r *http.Request) {
	var body map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"message": "Invalid request body"})
		return
	}

	userID := middleware.GetUserID(r)
	if body["userId"] == nil || body["userId"] == "" {
		body["userId"] = userID
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := db.Profiles().InsertOne(ctx, body)
	if err != nil {
		jsonResponse(w, http.StatusInternalServerError, map[string]string{"message": err.Error()})
		return
	}

	body["_id"] = result.InsertedID.(primitive.ObjectID).Hex()
	jsonResponse(w, http.StatusCreated, body)
}

func GetProfile(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	objID, err := parseObjectID(id)
	if err != nil {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"message": fmt.Sprintf("Invalid id: %s", id)})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var profile bson.M
	err = db.Profiles().FindOne(ctx, bson.M{"_id": objID}).Decode(&profile)
	if err != nil {
		jsonResponse(w, http.StatusNotFound, map[string]string{"message": fmt.Sprintf("Profile not found with id: %s", id)})
		return
	}

	convertID(profile)
	jsonResponse(w, http.StatusOK, profile)
}

func UpdateProfile(w http.ResponseWriter, r *http.Request) {
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

	updatableFields := []string{"name", "email", "phoneNumber", "businessName", "contactAddress", "paymentDetails", "logo", "website"}
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
	err = db.Profiles().FindOneAndUpdate(ctx, bson.M{"_id": objID}, bson.M{"$set": updateDoc}, opts).Decode(&updated)
	if err != nil {
		jsonResponse(w, http.StatusNotFound, map[string]string{"message": fmt.Sprintf("Profile not found with id: %s", id)})
		return
	}

	convertID(updated)
	jsonResponse(w, http.StatusOK, updated)
}

func DeleteProfile(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	objID, err := parseObjectID(id)
	if err != nil {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"message": fmt.Sprintf("Invalid id: %s", id)})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := db.Profiles().DeleteOne(ctx, bson.M{"_id": objID})
	if err != nil || result.DeletedCount == 0 {
		jsonResponse(w, http.StatusNotFound, map[string]string{"message": fmt.Sprintf("Profile not found with id: %s", id)})
		return
	}

	jsonResponse(w, http.StatusOK, map[string]string{"message": "Profile deleted successfully"})
}
