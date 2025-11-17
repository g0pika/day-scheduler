package handlers

import (
	"day-scheduler/models"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/go-chi/chi/v5"
)

// In-memory storage for weekly config (for now, until user accounts are implemented)
// WARNING: This is NOT production-ready:
// - Data is lost on server restart
// - All users share the same configuration (no user isolation)
// - Consider using a database (SQLite, PostgreSQL) for production
var (
	weeklyConfig      models.WeeklyConfig
	weeklyConfigMutex sync.RWMutex // Protects concurrent access to weeklyConfig
)

func init() {
	// Initialize with default config
	weeklyConfig = models.GetDefaultWeeklyConfig()
	log.Println("Weekly config initialized with defaults")
	log.Println("WARNING: Using in-memory storage - data will be lost on restart")
}

// GetWeeklyConfig returns the entire weekly configuration
func GetWeeklyConfig(w http.ResponseWriter, r *http.Request) {
	log.Println("GetWeeklyConfig called")
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodGet {
		writeErrorResponse(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	weeklyConfigMutex.RLock()
	configCopy := weeklyConfig
	weeklyConfigMutex.RUnlock()

	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(configCopy); err != nil {
		log.Printf("Failed to encode weekly config: %v", err)
	}
}

// GetDayConfig returns the configuration for a specific day
func GetDayConfig(w http.ResponseWriter, r *http.Request) {
	log.Println("GetDayConfig called")
	w.Header().Set("Content-Type", "application/json")

	// Extract day from URL parameter
	dayStr := strings.ToLower(chi.URLParam(r, "day"))
	if dayStr == "" {
		writeErrorResponse(w, http.StatusBadRequest, "Day parameter required")
		return
	}

	dayOfWeek, err := parseDayString(dayStr)
	if err != nil {
		writeErrorResponse(w, http.StatusBadRequest, "Invalid day: "+dayStr)
		return
	}

	weeklyConfigMutex.RLock()
	dayConfig := weeklyConfig.GetConfigForDay(dayOfWeek)
	weeklyConfigMutex.RUnlock()

	response := struct {
		Day    string            `json:"day"`
		Config models.DayConfig  `json:"config"`
	}{
		Day:    dayStr,
		Config: dayConfig,
	}

	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Failed to encode day config: %v", err)
	}
}

// UpdateDayConfig updates the configuration for a specific day
func UpdateDayConfig(w http.ResponseWriter, r *http.Request) {
	log.Println("UpdateDayConfig called")
	w.Header().Set("Content-Type", "application/json")

	// Extract day from URL parameter
	dayStr := strings.ToLower(chi.URLParam(r, "day"))
	if dayStr == "" {
		writeErrorResponse(w, http.StatusBadRequest, "Day parameter required")
		return
	}

	dayOfWeek, err := parseDayString(dayStr)
	if err != nil {
		writeErrorResponse(w, http.StatusBadRequest, "Invalid day: "+dayStr)
		return
	}

	// Decode the new config
	var newConfig models.DayConfig
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&newConfig); err != nil {
		log.Printf("Failed to decode day config: %v", err)
		writeErrorResponse(w, http.StatusBadRequest, "Invalid request data: "+err.Error())
		return
	}
	defer r.Body.Close()

	// Validate the config
	if newConfig.WorkHours < 0 || newConfig.StudyHours < 0 || newConfig.ChoresCount < 0 {
		writeErrorResponse(w, http.StatusBadRequest, "Hours and chores count must be non-negative")
		return
	}

	// Update the config (thread-safe)
	weeklyConfigMutex.Lock()
	weeklyConfig.SetConfigForDay(dayOfWeek, newConfig)
	weeklyConfigMutex.Unlock()

	log.Printf("Updated %s config: Work=%v, Study=%v, Chores=%d",
		dayStr, newConfig.WorkHours, newConfig.StudyHours, newConfig.ChoresCount)

	response := struct {
		Success bool              `json:"success"`
		Message string            `json:"message"`
		Day     string            `json:"day"`
		Config  models.DayConfig  `json:"config"`
	}{
		Success: true,
		Message: "Day configuration updated successfully",
		Day:     dayStr,
		Config:  newConfig,
	}

	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Failed to encode response: %v", err)
	}
}

// UpdateWeeklyConfig updates the entire weekly configuration
func UpdateWeeklyConfig(w http.ResponseWriter, r *http.Request) {
	log.Println("UpdateWeeklyConfig called")
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPut && r.Method != http.MethodPost {
		writeErrorResponse(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	var newConfig models.WeeklyConfig
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&newConfig); err != nil {
		log.Printf("Failed to decode weekly config: %v", err)
		writeErrorResponse(w, http.StatusBadRequest, "Invalid request data: "+err.Error())
		return
	}
	defer r.Body.Close()

	// Update the global config (thread-safe)
	weeklyConfigMutex.Lock()
	weeklyConfig = newConfig
	weeklyConfigMutex.Unlock()

	log.Println("Weekly configuration updated successfully")

	response := struct {
		Success bool   `json:"success"`
		Message string `json:"message"`
	}{
		Success: true,
		Message: "Weekly configuration updated successfully",
	}

	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Failed to encode response: %v", err)
	}
}

// parseDayString converts a day string (e.g., "monday") to time.Weekday
func parseDayString(dayStr string) (time.Weekday, error) {
	switch strings.ToLower(dayStr) {
	case "sunday":
		return time.Sunday, nil
	case "monday":
		return time.Monday, nil
	case "tuesday":
		return time.Tuesday, nil
	case "wednesday":
		return time.Wednesday, nil
	case "thursday":
		return time.Thursday, nil
	case "friday":
		return time.Friday, nil
	case "saturday":
		return time.Saturday, nil
	default:
		return time.Sunday, &InvalidDayError{Day: dayStr}
	}
}

// GetActivitiesList returns the current activities list
func GetActivitiesList(w http.ResponseWriter, r *http.Request) {
	log.Println("GetActivitiesList called")
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodGet {
		writeErrorResponse(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	weeklyConfigMutex.RLock()
	activities := weeklyConfig.ActivitiesList
	selectedCount := weeklyConfig.SelectedActivityCount
	weeklyConfigMutex.RUnlock()

	response := struct {
		Activities            []models.Activity `json:"activities"`
		SelectedActivityCount int               `json:"selected_activity_count"`
	}{
		Activities:            activities,
		SelectedActivityCount: selectedCount,
	}

	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Failed to encode activities list: %v", err)
	}
}

// UpdateActivitiesList updates the entire activities list
func UpdateActivitiesList(w http.ResponseWriter, r *http.Request) {
	log.Println("UpdateActivitiesList called")
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPut && r.Method != http.MethodPost {
		writeErrorResponse(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	var req struct {
		Activities            []models.Activity `json:"activities"`
		SelectedActivityCount int               `json:"selected_activity_count"`
	}

	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&req); err != nil {
		log.Printf("Failed to decode activities list: %v", err)
		writeErrorResponse(w, http.StatusBadRequest, "Invalid request data: "+err.Error())
		return
	}
	defer r.Body.Close()

	// Update the activities list (thread-safe)
	weeklyConfigMutex.Lock()
	weeklyConfig.ActivitiesList = req.Activities
	if req.SelectedActivityCount > 0 {
		weeklyConfig.SelectedActivityCount = req.SelectedActivityCount
	}
	activities := weeklyConfig.ActivitiesList
	selectedCount := weeklyConfig.SelectedActivityCount
	weeklyConfigMutex.Unlock()

	log.Printf("Activities list updated: %d activities, select %d per day",
		len(activities), selectedCount)

	response := struct {
		Success               bool              `json:"success"`
		Message               string            `json:"message"`
		Activities            []models.Activity `json:"activities"`
		SelectedActivityCount int               `json:"selected_activity_count"`
	}{
		Success:               true,
		Message:               "Activities list updated successfully",
		Activities:            activities,
		SelectedActivityCount: selectedCount,
	}

	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Failed to encode response: %v", err)
	}
}

// AddActivity adds a new activity to the list
func AddActivity(w http.ResponseWriter, r *http.Request) {
	log.Println("AddActivity called")
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		writeErrorResponse(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	var newActivity models.Activity
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&newActivity); err != nil {
		log.Printf("Failed to decode activity: %v", err)
		writeErrorResponse(w, http.StatusBadRequest, "Invalid request data: "+err.Error())
		return
	}
	defer r.Body.Close()

	// Generate a new ID and add to list (thread-safe)
	weeklyConfigMutex.Lock()
	maxID := 0
	for _, activity := range weeklyConfig.ActivitiesList {
		if activity.ID > maxID {
			maxID = activity.ID
		}
	}
	newActivity.ID = maxID + 1
	weeklyConfig.ActivitiesList = append(weeklyConfig.ActivitiesList, newActivity)
	weeklyConfigMutex.Unlock()

	log.Printf("Activity added: ID=%d, Name=%s", newActivity.ID, newActivity.Name)

	response := struct {
		Success  bool             `json:"success"`
		Message  string           `json:"message"`
		Activity models.Activity  `json:"activity"`
	}{
		Success:  true,
		Message:  "Activity added successfully",
		Activity: newActivity,
	}

	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Failed to encode response: %v", err)
	}
}

// RemoveActivity removes an activity from the list
func RemoveActivity(w http.ResponseWriter, r *http.Request) {
	log.Println("RemoveActivity called")
	w.Header().Set("Content-Type", "application/json")

	// Extract activity ID from URL parameter
	idStr := chi.URLParam(r, "id")
	if idStr == "" {
		writeErrorResponse(w, http.StatusBadRequest, "Activity ID parameter required")
		return
	}

	activityID, err := strconv.Atoi(idStr)
	if err != nil {
		writeErrorResponse(w, http.StatusBadRequest, "Invalid activity ID: "+idStr)
		return
	}

	// Find and remove the activity (thread-safe)
	weeklyConfigMutex.Lock()
	found := false
	newActivitiesList := []models.Activity{}
	for _, activity := range weeklyConfig.ActivitiesList {
		if activity.ID == activityID {
			found = true
			log.Printf("Removing activity: ID=%d, Name=%s", activity.ID, activity.Name)
		} else {
			newActivitiesList = append(newActivitiesList, activity)
		}
	}

	if !found {
		weeklyConfigMutex.Unlock()
		writeErrorResponse(w, http.StatusNotFound, "Activity not found")
		return
	}

	weeklyConfig.ActivitiesList = newActivitiesList
	weeklyConfigMutex.Unlock()

	response := struct {
		Success bool   `json:"success"`
		Message string `json:"message"`
	}{
		Success: true,
		Message: "Activity removed successfully",
	}

	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Failed to encode response: %v", err)
	}
}

// InvalidDayError represents an error for invalid day strings
type InvalidDayError struct {
	Day string
}

func (e *InvalidDayError) Error() string {
	return "invalid day: " + e.Day
}
