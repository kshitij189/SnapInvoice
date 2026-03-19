package middleware

import (
	"log"
	"net/http"
)

type responseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.statusCode = code
	rw.ResponseWriter.WriteHeader(code)
}

func Logger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		rw := &responseWriter{ResponseWriter: w, statusCode: http.StatusOK}

		log.Printf(">>> %s %s", r.Method, r.URL.String())

		defer func() {
			if err := recover(); err != nil {
				log.Printf("!!! EXCEPTION: %v", err)
				http.Error(w, `{"message":"Internal server error"}`, http.StatusInternalServerError)
			}
		}()

		next.ServeHTTP(rw, r)
		log.Printf("<<< %d", rw.statusCode)
	})
}
