# Build stage
FROM golang:1.24.1-bookworm AS builder
WORKDIR /app
COPY . .
RUN ls -la && ls -la vendor/
RUN CGO_ENABLED=0 go build -mod=vendor -v -o main .

# Run stage
FROM debian:bookworm-slim

# Install Chromium (required for PDF generation)
RUN apt-get update && apt-get install -y \
    chromium \
    ca-certificates \
    fonts-liberation \
    fonts-noto-color-emoji \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /app/main .
COPY templates ./templates

EXPOSE 5000
CMD ["./main"]
