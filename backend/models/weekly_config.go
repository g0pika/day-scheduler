package models

import "time"

// DayConfig represents configuration for a specific day of the week
type DayConfig struct {
	WorkHours   float64 `json:"work_hours"`   // e.g., 3.0, 8.0
	StudyHours  float64 `json:"study_hours"`  // e.g., 10.5, 2.0
	ChoresCount int     `json:"chores_count"` // e.g., 50, 20
}

// WeeklyConfig stores configuration for all days of the week
type WeeklyConfig struct {
	Monday    DayConfig `json:"monday"`
	Tuesday   DayConfig `json:"tuesday"`
	Wednesday DayConfig `json:"wednesday"`
	Thursday  DayConfig `json:"thursday"`
	Friday    DayConfig `json:"friday"`
	Saturday  DayConfig `json:"saturday"`
	Sunday    DayConfig `json:"sunday"`

	// Shared configuration across all days
	BasePromptConfig PromptConfig `json:"base_prompt_config"`
	ActivitiesList   []Activity   `json:"activities_list"`
	SelectedActivityCount int     `json:"selected_activity_count"`
}

// DayType represents special characteristics of a day
type DayType string

const (
	DayTypeRegular     DayType = "regular"      // Monday
	DayTypeOfficeDay   DayType = "office_day"   // Tuesday, Wednesday (with commute)
	DayTypeGateExam    DayType = "gate_exam"    // Sunday (with GATE mock test)
	DayTypeWeekend     DayType = "weekend"      // Saturday
	DayTypeFlexible    DayType = "flexible"     // Thursday, Friday
)

// GetDayType returns the day type based on the day of week
func GetDayType(dayOfWeek time.Weekday) DayType {
	switch dayOfWeek {
	case time.Monday:
		return DayTypeRegular
	case time.Tuesday, time.Wednesday:
		return DayTypeOfficeDay
	case time.Sunday:
		return DayTypeGateExam
	case time.Saturday:
		return DayTypeWeekend
	case time.Thursday, time.Friday:
		return DayTypeFlexible
	default:
		return DayTypeRegular
	}
}

// GetSpecialEventsForDay returns the special events that should be auto-added for a day type
func GetSpecialEventsForDay(dayType DayType) []SpecialEvent {
	switch dayType {
	case DayTypeOfficeDay:
		// Tuesday & Wednesday: Add commute to/from office
		return []SpecialEvent{
			{
				Type:     "Commute to Office",
				Name:     "Travel to office + getting ready",
				Duration: 120, // 2 hours travel
				PrepTime: 30,  // 30 min to get ready
				Details: map[string]interface{}{
					"direction": "to_office",
					"mode":      "public_transport",
					"note":      "Cannot study/read during public transport",
				},
			},
			{
				Type:     "Commute from Office",
				Name:     "Travel from office + unwind time",
				Duration: 120, // 2 hours travel
				PrepTime: 20,  // 20 min to unwind and change clothes
				Details: map[string]interface{}{
					"direction": "from_office",
					"mode":      "public_transport",
					"note":      "Cannot study during travel. Need time to unwind after reaching home.",
				},
			},
		}

	case DayTypeGateExam:
		// Sunday: Add GATE mock test
		return []SpecialEvent{
			{
				Type:      "GATE Mock Test",
				Name:      "Full-length GATE practice exam",
				StartTime: "14:00", // 2:00 PM
				Duration:  180,     // 3 hours (2 PM to 5 PM)
				PrepTime:  15,      // 15 min to prepare (gather materials, etc.)
				Details: map[string]interface{}{
					"exam_type": "mock_test",
					"important": true,
					"note":      "Critical for exam preparation, cannot be rescheduled",
				},
			},
		}

	default:
		// No special events for regular days
		return []SpecialEvent{}
	}
}

// GetConfigForDay returns the day configuration for a specific day of the week
func (wc *WeeklyConfig) GetConfigForDay(dayOfWeek time.Weekday) DayConfig {
	switch dayOfWeek {
	case time.Monday:
		return wc.Monday
	case time.Tuesday:
		return wc.Tuesday
	case time.Wednesday:
		return wc.Wednesday
	case time.Thursday:
		return wc.Thursday
	case time.Friday:
		return wc.Friday
	case time.Saturday:
		return wc.Saturday
	case time.Sunday:
		return wc.Sunday
	default:
		return wc.Monday // Fallback
	}
}

// SetConfigForDay updates the day configuration for a specific day of the week
func (wc *WeeklyConfig) SetConfigForDay(dayOfWeek time.Weekday, config DayConfig) {
	switch dayOfWeek {
	case time.Monday:
		wc.Monday = config
	case time.Tuesday:
		wc.Tuesday = config
	case time.Wednesday:
		wc.Wednesday = config
	case time.Thursday:
		wc.Thursday = config
	case time.Friday:
		wc.Friday = config
	case time.Saturday:
		wc.Saturday = config
	case time.Sunday:
		wc.Sunday = config
	}
}

// GetDefaultWeeklyConfig returns a default weekly configuration
func GetDefaultWeeklyConfig() WeeklyConfig {
	return WeeklyConfig{
		Monday: DayConfig{
			WorkHours:   3.0,
			StudyHours:  10.5,
			ChoresCount: 50,
		},
		Tuesday: DayConfig{
			WorkHours:   8.0,
			StudyHours:  2.0,
			ChoresCount: 20,
		},
		Wednesday: DayConfig{
			WorkHours:   8.0,
			StudyHours:  2.0,
			ChoresCount: 20,
		},
		Thursday: DayConfig{
			WorkHours:   4.0,
			StudyHours:  6.0,
			ChoresCount: 30,
		},
		Friday: DayConfig{
			WorkHours:   4.0,
			StudyHours:  6.0,
			ChoresCount: 30,
		},
		Saturday: DayConfig{
			WorkHours:   0.0,
			StudyHours:  8.0,
			ChoresCount: 40,
		},
		Sunday: DayConfig{
			WorkHours:   0.0,
			StudyHours:  5.0, // Less study due to GATE mock test
			ChoresCount: 30,
		},
		BasePromptConfig: GetDefaultPromptConfig(),
		ActivitiesList: []Activity{
			{ID: 1, Name: "Visit a coffee shop", Duration: 120, PreferredTime: "morning", Category: "leisure"},
			{ID: 2, Name: "Cook a new recipe", Duration: 60, PreferredTime: "evening", Category: "meal"},
			{ID: 3, Name: "Plant flowers", Duration: 90, PreferredTime: "afternoon", Category: "outdoor"},
			{ID: 4, Name: "Take autumn pictures", Duration: 45, PreferredTime: "afternoon", Category: "outdoor"},
			{ID: 5, Name: "Make fruit jam", Duration: 120, PreferredTime: "afternoon", Category: "cooking"},
			{ID: 6, Name: "People watch", Duration: 60, PreferredTime: "any", Category: "leisure"},
			{ID: 7, Name: "Buy a new scent", Duration: 60, PreferredTime: "afternoon", Category: "shopping"},
		},
		SelectedActivityCount: 1, // Pick 1 leisure activity per day
	}
}

// BuildScheduleRequestForDay builds a complete ScheduleRequest for a specific date
// This automatically handles:
// - Day detection
// - Config retrieval
// - Special events injection
func (wc *WeeklyConfig) BuildScheduleRequestForDay(targetDate time.Time, userProfile UserProfile, calendarEvents []CalendarEvent) ScheduleRequest {
	dayOfWeek := targetDate.Weekday()
	dayConfig := wc.GetConfigForDay(dayOfWeek)
	dayType := GetDayType(dayOfWeek)
	specialEvents := GetSpecialEventsForDay(dayType)

	// Update user profile with day-specific hours
	userProfile.WorkHours = int(dayConfig.WorkHours)
	userProfile.StudyHours = int(dayConfig.StudyHours)
	userProfile.HouseholdChores = dayConfig.ChoresCount

	// Build the schedule request
	return ScheduleRequest{
		UserProfile:    userProfile,
		Activities:     wc.ActivitiesList,
		SelectedCount:  wc.SelectedActivityCount,
		SpecialEvents:  specialEvents,
		DayType:        string(dayType),
		CalendarEvents: calendarEvents,
		PromptConfig:   &wc.BasePromptConfig,
	}
}
