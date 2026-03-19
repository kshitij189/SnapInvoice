package db

import (
	"context"
	"log"
	"net/url"
	"strings"
	"time"

	"snapinvoice-go/config"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	Client   *mongo.Client
	Database *mongo.Database
)

func Connect() {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOpts := options.Client().ApplyURI(config.AppConfig.MongoDBURI)
	client, err := mongo.Connect(ctx, clientOpts)
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}

	if err := client.Ping(ctx, nil); err != nil {
		log.Fatalf("Failed to ping MongoDB: %v", err)
	}

	Client = client

	// Extract database name from URI
	dbName := extractDBName(config.AppConfig.MongoDBURI)
	Database = client.Database(dbName)

	log.Printf("Connected to MongoDB (database: %s)", dbName)
}

func extractDBName(uri string) string {
	parsed, err := url.Parse(uri)
	if err != nil {
		return "snapinvoice"
	}
	path := strings.TrimPrefix(parsed.Path, "/")
	if idx := strings.Index(path, "?"); idx != -1 {
		path = path[:idx]
	}
	if path == "" {
		return "snapinvoice"
	}
	return path
}

func Users() *mongo.Collection {
	return Database.Collection("users")
}

func Clients() *mongo.Collection {
	return Database.Collection("clients")
}

func Invoices() *mongo.Collection {
	return Database.Collection("invoices")
}

func Profiles() *mongo.Collection {
	return Database.Collection("profiles")
}

func Disconnect() {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := Client.Disconnect(ctx); err != nil {
		log.Printf("Error disconnecting MongoDB: %v", err)
	}
}
