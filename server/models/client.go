package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Client struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	Name      string             `bson:"name" json:"name"`
	Email     string             `bson:"email" json:"email"`
	Phone     string             `bson:"phone" json:"phone"`
	Address   string             `bson:"address" json:"address"`
	UserID    string             `bson:"userId" json:"userId"`
	CreatedAt string             `bson:"createdAt" json:"createdAt"`
}
