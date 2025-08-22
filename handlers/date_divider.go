package handlers

import (
	"day-scheduler/models"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
)

func CalculateDateDivisions(w http.ResponseWriter, r *http.Request) {
	log.Println("CalculateDateDivisions called")
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		log.Printf("Invalid method: %s", r.Method)
		writeErrorResponse(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	var req models.DateDivisionRequest

	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&req); err != nil {
		log.Printf("Failed to decode request: %v", err)
		writeDateDivisionErrorResponse(w, http.StatusBadRequest, "Invalid request data: "+err.Error())
		return
	}
	defer r.Body.Close()
	log.Printf("Request decoded: %+v", req)

	// Validate input
	if req.StartDate == "" {
		writeDateDivisionErrorResponse(w, http.StatusBadRequest, "Start date is required")
		return
	}

	if req.DaysToAdd <= 0 {
		writeDateDivisionErrorResponse(w, http.StatusBadRequest, "Days to add must be positive")
		return
	}

	if req.NumDivisions < 2 {
		writeDateDivisionErrorResponse(w, http.StatusBadRequest, "Number of divisions must be at least 2")
		return
	}

	// Parse start date
	startDate, err := time.Parse("2006-01-02", req.StartDate)
	if err != nil {
		log.Printf("Failed to parse start date: %v", err)
		writeDateDivisionErrorResponse(w, http.StatusBadRequest, "Invalid start date format. Use YYYY-MM-DD")
		return
	}

	// Calculate final date
	finalDate := startDate.AddDate(0, 0, req.DaysToAdd)

	// Calculate total time difference
	totalDuration := finalDate.Sub(startDate)

	// Calculate interval between divisions
	interval := totalDuration / time.Duration(req.NumDivisions)

	// Generate division points
	divisionPoints := make([]models.DateDivisionPoint, 0, req.NumDivisions+1)

	for i := 0; i <= req.NumDivisions; i++ {
		divisionDate := startDate.Add(time.Duration(i) * interval)
		dayNumber := int(divisionDate.Sub(startDate).Hours() / 24)

		var label string
		if i == 0 {
			label = "🚀 Start Date"
		} else if i == req.NumDivisions {
			label = "🎯 Final Date"
		} else {
			label = fmt.Sprintf("📌 Division %d", i)
		}

		point := models.DateDivisionPoint{
			Label:     label,
			Date:      divisionDate,
			DateStr:   divisionDate.Format("Monday, January 2, 2006"),
			DayNumber: dayNumber,
		}

		divisionPoints = append(divisionPoints, point)
	}

	// Calculate days per division
	daysPerDivision := float64(req.DaysToAdd) / float64(req.NumDivisions)

	// Create response
	response := models.DateDivisionResponse{
		Success:         true,
		Message:         "Date divisions calculated successfully",
		StartDate:       startDate,
		FinalDate:       finalDate,
		TotalDays:       req.DaysToAdd,
		DaysPerDivision: daysPerDivision,
		DivisionPoints:  divisionPoints,
	}

	log.Printf("Date divisions calculated successfully: %d points", len(divisionPoints))

	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Failed to encode response: %v", err)
	}
}

func writeDateDivisionErrorResponse(w http.ResponseWriter, statusCode int, message string) {
	log.Printf("Date division error response: %d - %s", statusCode, message)
	w.WriteHeader(statusCode)
	response := models.DateDivisionResponse{
		Success: false,
		Message: message,
	}
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Failed to encode error response: %v", err)
	}
}
