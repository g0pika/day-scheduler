package models

type UserProfile struct {
	WorkHours       int    `json:"work_hours"`
	StudyHours      int    `json:"study_hours"`
	HouseholdChores int    `json:"household_chores"`
	SleepHours      int    `json:"sleep_hours"`
	IsFemale        bool   `json:"is_female"`
	CyclePhase      string `json:"cycle_phase,omitempty"`
}

type Activity struct {
	ID            int    `json:"id"`
	Name          string `json:"name"`
	Duration      int    `json:"duration_minutes"`
	PreferredTime string `json:"preferred_time"`
	Category      string `json:"category"`
}

type SpecialEvent struct {
	Type      string                 `json:"type"`
	Name      string                 `json:"name,omitempty"`
	StartTime string                 `json:"start_time,omitempty"`
	Duration  int                    `json:"duration_minutes"`
	PrepTime  int                    `json:"prep_time_minutes,omitempty"`
	Details   map[string]interface{} `json:"details,omitempty"`
}

type ScheduleRequest struct {
	UserProfile    UserProfile     `json:"user_profile"`
	Activities     []Activity      `json:"activities"`
	SelectedCount  int             `json:"selected_activity_count"`
	SpecialEvents  []SpecialEvent  `json:"special_events"`
	DayType        string          `json:"day_type"`
	EnergyLevel    string          `json:"energy_level,omitempty"`
	CalendarEvents []CalendarEvent `json:"calendar_events,omitempty"`
	PromptConfig   *PromptConfig   `json:"prompt_config,omitempty"`
	StudyPlan      string          `json:"study_plan,omitempty"`
	ScheduleDate   string          `json:"schedule_date,omitempty"`
	DayOfWeek      string          `json:"day_of_week,omitempty"`
}

type CalendarEvent struct {
	ID          string    `json:"id"`
	Summary     string    `json:"summary"`
	Description string    `json:"description,omitempty"`
	Location    string    `json:"location,omitempty"`
	Start       EventTime `json:"start"`
	End         EventTime `json:"end"`
}

type EventTime struct {
	DateTime string `json:"dateTime,omitempty"`
	Date     string `json:"date,omitempty"`
}

type ScheduleResponse struct {
	Schedule string `json:"schedule"`
	Success  bool   `json:"success"`
	Message  string `json:"message,omitempty"`
	Prompt   string `json:"prompt,omitempty"`
}
