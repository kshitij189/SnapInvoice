# Build stage
FROM golang:1.24-bookworm AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o main .

# Run stage
FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y \
    chromium \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Set environment variable for Chromedp if needed, 
# although chromium should be in the PATH.
ENV CHROME_BIN=/usr/bin/chromium

WORKDIR /app
COPY --from=builder /app/main .
COPY templates ./templates

# Ensure the app can find the templates
ENV PORT=5000
EXPOSE 5000

CMD ["./main"]
