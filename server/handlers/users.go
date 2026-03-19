package handlers

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/smtp"
	"strings"
	"time"

	"snapinvoice-go/config"
	"snapinvoice-go/db"
	"snapinvoice-go/models"

	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

func generateToken(email, id string) (string, error) {
	expMs := config.AppConfig.JWTExpMs
	expDuration := time.Duration(expMs) * time.Millisecond

	claims := jwt.MapClaims{
		"email": email,
		"id":    id,
		"iat":   time.Now().Unix(),
		"exp":   time.Now().Add(expDuration).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(config.AppConfig.JWTSecret))
}

func SignIn(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"message": "Invalid request body"})
		return
	}

	if body.Email == "" || body.Password == "" {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"message": "Email and password are required"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var user models.User
	err := db.Users().FindOne(ctx, bson.M{"email": body.Email}).Decode(&user)
	if err != nil {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"message": "User not found"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(body.Password)); err != nil {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"message": "Invalid credentials"})
		return
	}

	token, err := generateToken(user.Email, user.ID.Hex())
	if err != nil {
		jsonResponse(w, http.StatusInternalServerError, map[string]string{"message": "Failed to generate token"})
		return
	}

	jsonResponse(w, http.StatusOK, map[string]interface{}{
		"result": models.UserResult{
			ID:    user.ID.Hex(),
			Name:  user.Name,
			Email: user.Email,
		},
		"token":       token,
		"userProfile": nil,
	})
}

func SignUp(w http.ResponseWriter, r *http.Request) {
	var body struct {
		FirstName       string `json:"firstName"`
		LastName        string `json:"lastName"`
		Email           string `json:"email"`
		Password        string `json:"password"`
		ConfirmPassword string `json:"confirmPassword"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"message": "Invalid request body"})
		return
	}

	if body.FirstName == "" || body.LastName == "" || body.Email == "" || body.Password == "" || body.ConfirmPassword == "" {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"message": "All fields are required"})
		return
	}
	if len(body.Password) < 6 {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"message": "Password must be at least 6 characters"})
		return
	}
	if body.Password != body.ConfirmPassword {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"message": "Passwords don't match"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	count, _ := db.Users().CountDocuments(ctx, bson.M{"email": body.Email})
	if count > 0 {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"message": "User already exists"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(body.Password), bcrypt.DefaultCost)
	if err != nil {
		jsonResponse(w, http.StatusInternalServerError, map[string]string{"message": "Failed to hash password"})
		return
	}

	fullName := strings.TrimSpace(body.FirstName + " " + body.LastName)

	userDoc := bson.M{
		"name":        fullName,
		"email":       body.Email,
		"password":    string(hashedPassword),
		"resetToken":  nil,
		"expireToken": nil,
	}
	result, err := db.Users().InsertOne(ctx, userDoc)
	if err != nil {
		jsonResponse(w, http.StatusInternalServerError, map[string]string{"message": "Failed to create user"})
		return
	}

	userID := result.InsertedID.(primitive.ObjectID)

	// Auto-create profile
	profileDoc := bson.M{
		"name":           fullName,
		"email":          body.Email,
		"phoneNumber":    "",
		"businessName":   "",
		"contactAddress": "",
		"paymentDetails": "",
		"logo":           "",
		"website":        "",
		"userId":         userID.Hex(),
	}
	profileResult, err := db.Profiles().InsertOne(ctx, profileDoc)
	if err != nil {
		log.Printf("Failed to create profile: %v", err)
	}

	token, err := generateToken(body.Email, userID.Hex())
	if err != nil {
		jsonResponse(w, http.StatusInternalServerError, map[string]string{"message": "Failed to generate token"})
		return
	}

	var profileResponse interface{}
	if err == nil && profileResult != nil {
		profileID := profileResult.InsertedID.(primitive.ObjectID)
		profileResponse = map[string]interface{}{
			"_id":    profileID.Hex(),
			"name":   fullName,
			"email":  body.Email,
			"userId": userID.Hex(),
		}
	}

	jsonResponse(w, http.StatusCreated, map[string]interface{}{
		"result": models.UserResult{
			ID:    userID.Hex(),
			Name:  fullName,
			Email: body.Email,
		},
		"token":       token,
		"userProfile": profileResponse,
	})
}

func ForgotPassword(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Email string `json:"email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"message": "Invalid request body"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var user models.User
	err := db.Users().FindOne(ctx, bson.M{"email": body.Email}).Decode(&user)
	if err != nil {
		jsonResponse(w, http.StatusNotFound, map[string]string{"message": "User with this email does not exist"})
		return
	}

	// Generate 64-char hex token
	tokenBytes := make([]byte, 32)
	if _, err := rand.Read(tokenBytes); err != nil {
		jsonResponse(w, http.StatusInternalServerError, map[string]string{"message": "Failed to generate reset token"})
		return
	}
	resetToken := hex.EncodeToString(tokenBytes)
	expireTime := primitive.NewDateTimeFromTime(time.Now().UTC().Add(1 * time.Hour))

	_, err = db.Users().UpdateOne(ctx, bson.M{"_id": user.ID}, bson.M{
		"$set": bson.M{
			"resetToken":  resetToken,
			"expireToken": expireTime,
		},
	})
	if err != nil {
		jsonResponse(w, http.StatusInternalServerError, map[string]string{"message": "Failed to update reset token"})
		return
	}

	// Send email (non-blocking, errors only logged)
	go sendResetEmail(body.Email, resetToken)

	jsonResponse(w, http.StatusOK, map[string]string{"message": "Check your email for the reset link"})
}

func sendResetEmail(email, token string) {
	cfg := config.AppConfig
	resetLink := fmt.Sprintf("%s/reset/%s", cfg.FrontendURL, token)

	htmlBody := fmt.Sprintf(`<html>
<body style="font-family: Arial, sans-serif; padding: 20px;">
    <h2>Password Reset Request</h2>
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <p><a href="%s" style="background-color: #6366f1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request this, please ignore this email.</p>
</body>
</html>`, resetLink)

	subject := "Password Reset - SnapInvoice"
	msg := buildEmail(cfg.EmailFrom, email, subject, htmlBody)

	addr := fmt.Sprintf("%s:%d", cfg.EmailHost, cfg.EmailPort)
	auth := smtp.PlainAuth("", cfg.EmailUser, cfg.EmailPass, cfg.EmailHost)

	if err := smtp.SendMail(addr, auth, cfg.EmailFrom, []string{email}, msg); err != nil {
		log.Printf("Failed to send reset email: %v", err)
	}
}

func buildEmail(from, to, subject, htmlBody string) []byte {
	headers := fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n", from, to, subject)
	return []byte(headers + htmlBody)
}

func ResetPassword(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Token    string `json:"token"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"message": "Invalid request body"})
		return
	}

	if body.Token == "" || body.Password == "" {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"message": "Token and password are required"})
		return
	}
	if len(body.Password) < 6 {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"message": "Password must be at least 6 characters"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var user models.User
	err := db.Users().FindOne(ctx, bson.M{"resetToken": body.Token}).Decode(&user)
	if err != nil {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"message": "Invalid or expired token"})
		return
	}

	if user.ExpireToken != nil {
		expireTime := (*user.ExpireToken).Time()
		if time.Now().UTC().After(expireTime) {
			jsonResponse(w, http.StatusBadRequest, map[string]string{"message": "Token has expired. Try again."})
			return
		}
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(body.Password), bcrypt.DefaultCost)
	if err != nil {
		jsonResponse(w, http.StatusInternalServerError, map[string]string{"message": "Failed to hash password"})
		return
	}

	_, err = db.Users().UpdateOne(ctx, bson.M{"_id": user.ID}, bson.M{
		"$set": bson.M{
			"password":    string(hashedPassword),
			"resetToken":  nil,
			"expireToken": nil,
		},
	})
	if err != nil {
		jsonResponse(w, http.StatusInternalServerError, map[string]string{"message": "Failed to update password"})
		return
	}

	jsonResponse(w, http.StatusOK, map[string]string{"message": "Password successfully updated"})
}
