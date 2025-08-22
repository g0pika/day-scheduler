package models

import "time"

type DateDivisionRequest struct {
	StartDate    string `json:"start_date"`    // Format: "2006-01-02"
	DaysToAdd    int    `json:"days_to_add"`   // Number of days to add to start date
	NumDivisions int    `json:"num_divisions"` // Number of equal divisions
}

type DateDivisionPoint struct {
	Label     string    `json:"label"`      // "Start Date", "Division 1", "Final Date", etc.
	Date      time.Time `json:"date"`       // The actual date
	DateStr   string    `json:"date_str"`   // Formatted date string
	DayNumber int       `json:"day_number"` // Days from start date
}

type DateDivisionResponse struct {
	Success         bool                `json:"success"`
	Message         string              `json:"message,omitempty"`
	StartDate       time.Time           `json:"start_date"`
	FinalDate       time.Time           `json:"final_date"`
	TotalDays       int                 `json:"total_days"`
	DaysPerDivision float64             `json:"days_per_division"`
	DivisionPoints  []DateDivisionPoint `json:"division_points"`
}
