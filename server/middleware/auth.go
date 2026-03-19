package middleware

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"net/http"
	"strings"

	"snapinvoice-go/config"

	"github.com/golang-jwt/jwt/v5"
)

type contextKey string

const (
	UserIDKey    contextKey = "user_id"
	UserEmailKey contextKey = "user_email"
)

func JWTRequired(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Let OPTIONS preflight requests through
		if r.Method == http.MethodOptions {
			next.ServeHTTP(w, r)
			return
		}

		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			jsonError(w, "Authentication required", http.StatusUnauthorized)
			return
		}

		if !strings.HasPrefix(authHeader, "Bearer ") {
			jsonError(w, "Authentication required", http.StatusUnauthorized)
			return
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")

		var userID, userEmail string

		if len(tokenStr) >= 500 {
			// Google OAuth token
			parts := strings.Split(tokenStr, ".")
			if len(parts) != 3 {
				jsonError(w, "Invalid or expired token", http.StatusUnauthorized)
				return
			}
			payload := parts[1]
			// Add padding if needed
			switch len(payload) % 4 {
			case 2:
				payload += "=="
			case 3:
				payload += "="
			}
			decoded, err := base64.URLEncoding.DecodeString(payload)
			if err != nil {
				jsonError(w, "Invalid or expired token", http.StatusUnauthorized)
				return
			}
			var claims map[string]interface{}
			if err := json.Unmarshal(decoded, &claims); err != nil {
				jsonError(w, "Invalid or expired token", http.StatusUnauthorized)
				return
			}
			if sub, ok := claims["sub"].(string); ok {
				userID = sub
			}
			if email, ok := claims["email"].(string); ok {
				userEmail = email
			}
		} else {
			// Custom JWT
			token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
				return []byte(config.AppConfig.JWTSecret), nil
			})
			if err != nil || !token.Valid {
				jsonError(w, "Invalid or expired token", http.StatusUnauthorized)
				return
			}
			claims, ok := token.Claims.(jwt.MapClaims)
			if !ok {
				jsonError(w, "Invalid or expired token", http.StatusUnauthorized)
				return
			}
			if id, ok := claims["id"].(string); ok {
				userID = id
			}
			if email, ok := claims["email"].(string); ok {
				userEmail = email
			}
		}

		if userID == "" {
			jsonError(w, "Invalid or expired token", http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), UserIDKey, userID)
		ctx = context.WithValue(ctx, UserEmailKey, userEmail)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func GetUserID(r *http.Request) string {
	if v, ok := r.Context().Value(UserIDKey).(string); ok {
		return v
	}
	return ""
}

func jsonError(w http.ResponseWriter, msg string, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{"message": msg})
}
