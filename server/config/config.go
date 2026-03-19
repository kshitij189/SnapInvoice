package config

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Debug       bool
	MongoDBURI  string
	JWTSecret   string
	JWTExpMs    int64
	EmailHost   string
	EmailPort   int
	EmailUser   string
	EmailPass   string
	EmailFrom   string
	FrontendURL string
	Port        string
}

var AppConfig Config

func Load() {
	godotenv.Load()

	AppConfig = Config{
		Debug:       os.Getenv("DEBUG") == "True",
		MongoDBURI:  getEnv("MONGODB_URI", "mongodb://localhost:27017/snapinvoice"),
		JWTSecret:   getEnv("JWT_SECRET", "default-secret-change-me"),
		JWTExpMs:    getEnvInt64("JWT_EXPIRATION", 43200000),
		EmailHost:   getEnv("EMAIL_HOST", "sandbox.smtp.mailtrap.io"),
		EmailPort:   getEnvInt("EMAIL_PORT", 2525),
		EmailUser:   getEnv("EMAIL_HOST_USER", ""),
		EmailPass:   getEnv("EMAIL_HOST_PASSWORD", ""),
		EmailFrom:   getEnv("EMAIL_FROM", "noreply@snapinvoice.com"),
		FrontendURL: getEnv("FRONTEND_URL", "http://localhost:5173"),
		Port:        getEnv("PORT", "5000"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	if v := os.Getenv(key); v != "" {
		if i, err := strconv.Atoi(v); err == nil {
			return i
		}
	}
	return fallback
}

func getEnvInt64(key string, fallback int64) int64 {
	if v := os.Getenv(key); v != "" {
		if i, err := strconv.ParseInt(v, 10, 64); err == nil {
			return i
		}
	}
	return fallback
}
