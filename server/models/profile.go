package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Profile struct {
	ID             primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	Name           string             `bson:"name" json:"name"`
	Email          string             `bson:"email" json:"email"`
	PhoneNumber    string             `bson:"phoneNumber" json:"phoneNumber"`
	BusinessName   string             `bson:"businessName" json:"businessName"`
	ContactAddress string             `bson:"contactAddress" json:"contactAddress"`
	PaymentDetails string             `bson:"paymentDetails" json:"paymentDetails"`
	Logo           string             `bson:"logo" json:"logo"`
	Website        string             `bson:"website" json:"website"`
	UserID         string             `bson:"userId" json:"userId"`
}
