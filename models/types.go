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
	UserProfile   UserProfile    `json:"user_profile"`
	Activities    []Activity     `json:"activities"`
	SelectedCount int            `json:"selected_activity_count"`
	SpecialEvents []SpecialEvent `json:"special_events"`
	DayType       string         `json:"day_type"`
	EnergyLevel   string         `json:"energy_level,omitempty"`
}

type ScheduleResponse struct {
	Schedule string `json:"schedule"`
	Success  bool   `json:"success"`
	Message  string `json:"message,omitempty"`
}
