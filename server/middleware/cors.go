package middleware

import (
	"net/http"
	"strings"

	"snapinvoice-go/config"
)

func CORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")

		allowed := false
		if config.AppConfig.Debug {
			allowed = true
		} else {
			allowedOrigins := []string{
				config.AppConfig.FrontendURL,
				"http://localhost:3000",
			}
			for _, o := range allowedOrigins {
				if strings.EqualFold(origin, o) {
					allowed = true
					break
				}
			}
		}

		if allowed && origin != "" {
			w.Header().Set("Access-Control-Allow-Origin", origin)
		}
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}
