package main

import (
	"day-scheduler/handlers"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/joho/godotenv"
)

func corsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
		
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		
		next(w, r)
	}
}

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Create HTTP multiplexer
	mux := http.NewServeMux()

	// Serve static files
	staticDir := "./static/"
	mux.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir(staticDir))))

	// Serve the main page
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			http.NotFound(w, r)
			return
		}

		indexPath := filepath.Join(staticDir, "index.html")
		http.ServeFile(w, r, indexPath)
	})

	// API routes with CORS middleware
	mux.HandleFunc("/api/generate-schedule", corsMiddleware(handlers.GenerateSchedule))

	// NEW: Date division API endpoint
	mux.HandleFunc("/api/calculate-date-divisions", corsMiddleware(handlers.CalculateDateDivisions))

	// Health check endpoint
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"healthy"}`))
	})

	// Get port from environment or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	log.Printf("Open http://localhost:%s in your browser", port)

	// Create and configure server
	server := &http.Server{
		Addr:    ":" + port,
		Handler: mux,
	}

	// Start server
	if err := server.ListenAndServe(); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
