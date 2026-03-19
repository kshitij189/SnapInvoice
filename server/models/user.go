package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type User struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	Name        string             `bson:"name" json:"name"`
	Email       string             `bson:"email" json:"email"`
	Password    string             `bson:"password" json:"password,omitempty"`
	ResetToken  *string            `bson:"resetToken" json:"resetToken,omitempty"`
	ExpireToken *primitive.DateTime `bson:"expireToken" json:"expireToken,omitempty"`
}

type UserResult struct {
	ID    string `json:"_id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}
