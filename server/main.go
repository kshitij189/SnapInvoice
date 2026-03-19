package main

import (
	"log"
	"net/http"

	"snapinvoice-go/config"
	"snapinvoice-go/db"
	"snapinvoice-go/handlers"
	"snapinvoice-go/middleware"

	"github.com/gorilla/mux"
)

func main() {
	config.Load()
	db.Connect()
	defer db.Disconnect()
	handlers.InitTemplates()

	r := mux.NewRouter()

	// Apply global middleware
	r.Use(middleware.Logger)
	r.Use(middleware.CORS)

	// User routes
	r.HandleFunc("/users/signin", handlers.SignIn).Methods("POST", "OPTIONS")
	r.HandleFunc("/users/signup", handlers.SignUp).Methods("POST", "OPTIONS")
	r.HandleFunc("/users/forgot", handlers.ForgotPassword).Methods("POST", "OPTIONS")
	r.HandleFunc("/users/reset", handlers.ResetPassword).Methods("POST", "OPTIONS")

	// Client routes (authenticated)
	clientRouter := r.PathPrefix("/clients").Subrouter()
	clientRouter.Use(middleware.JWTRequired)
	clientRouter.HandleFunc("/user", handlers.GetClientsByUser).Methods("GET", "OPTIONS")
	clientRouter.HandleFunc("/all", handlers.GetAllClients).Methods("GET", "OPTIONS")
	clientRouter.HandleFunc("", handlers.CreateClient).Methods("POST", "OPTIONS")
	clientRouter.HandleFunc("/{id}", handlers.GetClient).Methods("GET", "OPTIONS")
	clientRouter.HandleFunc("/{id}", handlers.UpdateClient).Methods("PATCH", "OPTIONS")
	clientRouter.HandleFunc("/{id}", handlers.DeleteClient).Methods("DELETE", "OPTIONS")

	// Invoice routes (authenticated)
	invoiceRouter := r.PathPrefix("/invoices").Subrouter()
	invoiceRouter.Use(middleware.JWTRequired)
	invoiceRouter.HandleFunc("", handlers.GetInvoices).Methods("GET", "OPTIONS")
	invoiceRouter.HandleFunc("", handlers.CreateInvoice).Methods("POST", "OPTIONS")
	invoiceRouter.HandleFunc("/count", handlers.GetInvoiceCount).Methods("GET", "OPTIONS")
	invoiceRouter.HandleFunc("/{id}", handlers.GetInvoice).Methods("GET", "OPTIONS")
	invoiceRouter.HandleFunc("/{id}", handlers.UpdateInvoice).Methods("PATCH", "OPTIONS")
	invoiceRouter.HandleFunc("/{id}", handlers.DeleteInvoice).Methods("DELETE", "OPTIONS")

	// Profile routes (authenticated)
	profileRouter := r.PathPrefix("/profiles").Subrouter()
	profileRouter.Use(middleware.JWTRequired)
	profileRouter.HandleFunc("", handlers.GetProfiles).Methods("GET", "OPTIONS")
	profileRouter.HandleFunc("", handlers.CreateProfile).Methods("POST", "OPTIONS")
	profileRouter.HandleFunc("/{id}", handlers.GetProfile).Methods("GET", "OPTIONS")
	profileRouter.HandleFunc("/{id}", handlers.UpdateProfile).Methods("PATCH", "OPTIONS")
	profileRouter.HandleFunc("/{id}", handlers.DeleteProfile).Methods("DELETE", "OPTIONS")

	// PDF routes (unauthenticated)
	r.HandleFunc("/send-pdf", handlers.SendPDF).Methods("POST", "OPTIONS")
	r.HandleFunc("/create-pdf", handlers.CreatePDF).Methods("POST", "OPTIONS")
	r.HandleFunc("/fetch-pdf", handlers.FetchPDF).Methods("GET", "OPTIONS")
	r.HandleFunc("/public/pdf/{id}", handlers.PublicPDF).Methods("GET", "OPTIONS")

	port := config.AppConfig.Port
	log.Printf("Server running on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}
