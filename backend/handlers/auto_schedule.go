package handlers

import (
	"day-scheduler/models"
	"encoding/json"
	"log"
	"net/http"
	"time"
)

// IST timezone location
var istLocation *time.Location

func init() {
	var err error
	istLocation, err = time.LoadLocation("Asia/Kolkata")
	if err != nil {
		log.Printf("Warning: Could not load IST timezone, using UTC: %v", err)
		istLocation = time.UTC
	}
}

// AutoGenerateScheduleRequest is the request for auto-generating tomorrow's schedule
type AutoGenerateScheduleRequest struct {
	UserProfile    models.UserProfile     `json:"user_profile"`    // Basic user info (cycle phase, energy level)
	CalendarEvents []models.CalendarEvent `json:"calendar_events"` // Google Calendar events
	EnergyLevel    string                 `json:"energy_level,omitempty"`
}

// AutoGenerateSchedule automatically generates a schedule for tomorrow
// It automatically:
// - Detects tomorrow's day in IST timezone
// - Retrieves the day config (work hours, study hours, chores)
// - Auto-injects special events based on day type (commute, GATE test, etc.)
// - Uses the provided calendar events
// - Generates the schedule using Gemini AI
func AutoGenerateSchedule(w http.ResponseWriter, r *http.Request) {
	log.Println("AutoGenerateSchedule called")
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		log.Printf("Invalid method: %s", r.Method)
		writeErrorResponse(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	var req AutoGenerateScheduleRequest

	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&req); err != nil {
		log.Printf("Failed to decode request: %v", err)
		writeErrorResponse(w, http.StatusBadRequest, "Invalid request data: "+err.Error())
		return
	}
	defer r.Body.Close()
	log.Printf("Request decoded: UserProfile=%+v, CalendarEvents=%d", req.UserProfile, len(req.CalendarEvents))

	// Get tomorrow's date in IST
	nowIST := time.Now().In(istLocation)
	tomorrowIST := nowIST.Add(24 * time.Hour)
	tomorrowDayOfWeek := tomorrowIST.Weekday()

	log.Printf("Current IST time: %s", nowIST.Format("2006-01-02 15:04:05 MST"))
	log.Printf("Tomorrow IST date: %s, Day: %s", tomorrowIST.Format("2006-01-02"), tomorrowDayOfWeek.String())

	// Build the schedule request using weekly config (thread-safe read)
	weeklyConfigMutex.RLock()
	scheduleRequest := weeklyConfig.BuildScheduleRequestForDay(tomorrowIST, req.UserProfile, req.CalendarEvents)
	weeklyConfigMutex.RUnlock()

	scheduleRequest.EnergyLevel = req.EnergyLevel
	scheduleRequest.ScheduleDate = tomorrowIST.Format("2006-01-02")
	scheduleRequest.DayOfWeek = tomorrowDayOfWeek.String()

	log.Printf("Schedule request built for %s: Work=%d hrs, Study=%d hrs, Chores=%d, Special Events=%d",
		tomorrowDayOfWeek.String(),
		scheduleRequest.UserProfile.WorkHours,
		scheduleRequest.UserProfile.StudyHours,
		scheduleRequest.UserProfile.HouseholdChores,
		len(scheduleRequest.SpecialEvents))

	// Build prompt for Gemini AI
	prompt := buildGeminiPrompt(scheduleRequest)
	log.Printf("Prompt built (length: %d chars)", len(prompt))

	// Call Gemini API
	schedule, err := callGeminiAPI(prompt)
	if err != nil {
		log.Printf("Gemini API error: %v", err)
		writeErrorResponse(w, http.StatusInternalServerError, "Failed to generate schedule: "+err.Error())
		return
	}
	log.Printf("Schedule generated successfully")

	response := struct {
		Schedule      string `json:"schedule"`
		Success       bool   `json:"success"`
		Message       string `json:"message"`
		ScheduledDate string `json:"scheduled_date"` // Tomorrow's date
		DayOfWeek     string `json:"day_of_week"`    // Tomorrow's day name
		DayType       string `json:"day_type"`       // Day type (regular, office_day, etc.)
		Prompt        string `json:"prompt"`         // The AI prompt used
	}{
		Schedule:      schedule,
		Success:       true,
		Message:       "Schedule generated successfully for " + tomorrowDayOfWeek.String(),
		ScheduledDate: tomorrowIST.Format("2006-01-02"),
		DayOfWeek:     tomorrowDayOfWeek.String(),
		DayType:       scheduleRequest.DayType,
		Prompt:        prompt,
	}

	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Failed to encode response: %v", err)
	}
}

// GetTomorrowInfo returns information about tomorrow (for debugging/testing)
func GetTomorrowInfo(w http.ResponseWriter, r *http.Request) {
	log.Println("GetTomorrowInfo called")
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodGet {
		writeErrorResponse(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	// Get tomorrow's date in IST
	nowIST := time.Now().In(istLocation)
	tomorrowIST := nowIST.Add(24 * time.Hour)
	tomorrowDayOfWeek := tomorrowIST.Weekday()
	dayType := models.GetDayType(tomorrowDayOfWeek)

	// Thread-safe read of weekly config
	weeklyConfigMutex.RLock()
	dayConfig := weeklyConfig.GetConfigForDay(tomorrowDayOfWeek)
	weeklyConfigMutex.RUnlock()

	specialEvents := models.GetSpecialEventsForDay(dayType)

	response := struct {
		CurrentTimeIST string              `json:"current_time_ist"`
		TomorrowDate   string              `json:"tomorrow_date"`
		DayOfWeek      string              `json:"day_of_week"`
		DayType        string              `json:"day_type"`
		DayConfig      models.DayConfig    `json:"day_config"`
		SpecialEvents  []models.SpecialEvent `json:"special_events"`
	}{
		CurrentTimeIST: nowIST.Format("2006-01-02 15:04:05 MST"),
		TomorrowDate:   tomorrowIST.Format("2006-01-02"),
		DayOfWeek:      tomorrowDayOfWeek.String(),
		DayType:        string(dayType),
		DayConfig:      dayConfig,
		SpecialEvents:  specialEvents,
	}

	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Failed to encode response: %v", err)
	}
}
