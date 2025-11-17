package main

import (
	"day-scheduler/handlers"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/joho/godotenv"
)

// CORS middleware for chi
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Create chi router
	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(corsMiddleware)

	// API routes
	r.Route("/api", func(r chi.Router) {
		// Schedule generation
		r.Post("/generate-schedule", handlers.GenerateSchedule)
		r.Post("/auto-generate-schedule", handlers.AutoGenerateSchedule)
		r.Get("/tomorrow-info", handlers.GetTomorrowInfo)

		// Weekly config routes
		r.Route("/weekly-config", func(r chi.Router) {
			r.Get("/", handlers.GetWeeklyConfig)
			r.Put("/", handlers.UpdateWeeklyConfig)
			r.Post("/", handlers.UpdateWeeklyConfig)

			// Activities routes
			r.Get("/activities", handlers.GetActivitiesList)
			r.Post("/activities", handlers.AddActivity)
			r.Put("/activities", handlers.UpdateActivitiesList)
			r.Delete("/activities/{id}", handlers.RemoveActivity)

			// Day-specific config routes
			r.Get("/{day}", handlers.GetDayConfig)
			r.Put("/{day}", handlers.UpdateDayConfig)
			r.Post("/{day}", handlers.UpdateDayConfig)
		})
	})

	// Health check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"healthy"}`))
	})

	// Serve React frontend build files
	frontendBuild := "./frontend/build/"
	if _, err := os.Stat(frontendBuild); err == nil {
		// Serve static files from build folder
		fileServer := http.FileServer(http.Dir(frontendBuild))
		r.Handle("/static/*", fileServer)

		// Serve index.html for root and any non-API routes (SPA fallback)
		r.Get("/*", func(w http.ResponseWriter, r *http.Request) {
			indexPath := filepath.Join(frontendBuild, "index.html")
			http.ServeFile(w, r, indexPath)
		})
	} else {
		// Fallback if build doesn't exist
		r.Get("/", func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "text/html")
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`
<!DOCTYPE html>
<html>
<head><title>Day Scheduler</title></head>
<body>
	<h1>Day Scheduler Backend</h1>
	<p>Frontend not built yet. Please run:</p>
	<pre>cd frontend && npm install && npm run build</pre>
	<h2>Available API Endpoints:</h2>
	<ul>
		<li>GET /health</li>
		<li>POST /api/generate-schedule</li>
		<li>POST /api/auto-generate-schedule</li>
		<li>GET /api/tomorrow-info</li>
		<li>GET /api/weekly-config</li>
	</ul>
</body>
</html>
			`))
		})
	}

	// Get port from environment or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	log.Printf("Open http://localhost:%s in your browser", port)

	// Start server with chi router
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
