# Build stage
FROM golang:1.22-alpine AS builder
ENV GOTOOLCHAIN=auto
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -v -o server ./cmd/server

# Final runtime stage
FROM alpine:3.19
WORKDIR /app
COPY --from=builder /app/server /app/server
COPY --from=builder /app/data /app/data

EXPOSE 8080
CMD ["/app/server"]
