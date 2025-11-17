package models

// PromptConfig contains all configurable parameters for schedule generation
type PromptConfig struct {
	// Time constraints
	WorkHoursRange      Range  `json:"work_hours_range"`      // e.g., {Min: 0, Max: 12}
	StudyHoursRange     Range  `json:"study_hours_range"`     // e.g., {Min: 0, Max: 8}
	SleepHoursRange     Range  `json:"sleep_hours_range"`     // e.g., {Min: 6, Max: 10}
	ChoresRange         Range  `json:"chores_range"`          // e.g., {Min: 0, Max: 20}
	
	// Time slots
	MealTimes           MealTimesConfig `json:"meal_times"`
	PersonalCareTime    PersonalCareConfig `json:"personal_care"`
	
	// Behavior rules
	Rules               ScheduleRules `json:"rules"`
	
	// Activity configurations
	ActivityConstraints ActivityConstraints `json:"activity_constraints"`
	
	// Prompt format settings
	FormatSettings      FormatSettings `json:"format_settings"`
	
	// Cycle considerations (if applicable)
	CycleSettings       CycleSettings `json:"cycle_settings"`
}

type Range struct {
	Min int `json:"min"`
	Max int `json:"max"`
}

type MealTimesConfig struct {
	BreakfastWindow TimeWindow `json:"breakfast_window"`
	LunchWindow     TimeWindow `json:"lunch_window"`
	SnacksWindow    TimeWindow `json:"snacks_window"`
	DinnerWindow    TimeWindow `json:"dinner_window"`
	PostLunchBreak  Duration   `json:"post_lunch_break"`
}

type TimeWindow struct {
	Start string `json:"start"` // e.g., "7:00"
	End   string `json:"end"`   // e.g., "9:00"
}

type Duration struct {
	Minutes     int    `json:"minutes"`
	Description string `json:"description"`
}

type PersonalCareConfig struct {
	SkincareTotal Duration `json:"skincare_total"`
	ShowerWindow  string   `json:"shower_window"` // "morning", "evening", "flexible"
	CallTime      string   `json:"call_time"`     // "evening", "flexible"
	LeisureTime   Duration `json:"leisure_time"`
}

type ScheduleRules struct {
	WorkStudyBeforeBreakfast bool     `json:"work_study_before_breakfast"`
	NoWorkStudyAfterLunch   bool     `json:"no_work_study_after_lunch"`
	SleepNonNegotiable      bool     `json:"sleep_non_negotiable"`
	SleepCanSplit           bool     `json:"sleep_can_split"`
	MustIncludeLeisure      bool     `json:"must_include_leisure"`
	TimeShortagePreference  []string `json:"time_shortage_preference"` // Order of what to reduce first
}

type ActivityConstraints struct {
	MaxActivitiesPerDay int                    `json:"max_activities_per_day"`
	ActivitySettings    map[string]ActivitySetting `json:"activity_settings"`
}

type ActivitySetting struct {
	DefaultDuration int    `json:"default_duration"`
	PreferredTime   string `json:"preferred_time"`
	Category        string `json:"category"`
	Flexible        bool   `json:"flexible"`
	PrepTime        int    `json:"prep_time,omitempty"`
}

type FormatSettings struct {
	IncludeTimestamps   bool   `json:"include_timestamps"`
	CheckboxFormat      bool   `json:"checkbox_format"`
	IncludeEmojis       bool   `json:"include_emojis"`
	IncludeDescriptions bool   `json:"include_descriptions"`
	IncludeMotivation   bool   `json:"include_motivation"`
	StyleTheme          string `json:"style_theme"` // "casual", "professional", "detailed", "minimal"
}

type CycleSettings struct {
	EnableCycleConsiderations bool                          `json:"enable_cycle_considerations"`
	PhaseRecommendations     map[string]PhaseRecommendation `json:"phase_recommendations"`
}

type PhaseRecommendation struct {
	EnergyLevel     string   `json:"energy_level"`
	Recommendations string   `json:"recommendations"`
	PreferredTypes  []string `json:"preferred_types"`
	AvoidTypes      []string `json:"avoid_types"`
}

// Default configurations
func GetDefaultPromptConfig() PromptConfig {
	return PromptConfig{
		WorkHoursRange:  Range{Min: 0, Max: 12},
		StudyHoursRange: Range{Min: 0, Max: 8},
		SleepHoursRange: Range{Min: 6, Max: 10},
		ChoresRange:     Range{Min: 0, Max: 100},
		
		MealTimes: MealTimesConfig{
			BreakfastWindow: TimeWindow{Start: "7:00", End: "9:00"},
			LunchWindow:     TimeWindow{Start: "12:30", End: "14:00"},
			SnacksWindow:    TimeWindow{Start: "16:30", End: "19:00"},
			DinnerWindow:    TimeWindow{Start: "19:30", End: "20:50"},
			PostLunchBreak:  Duration{Minutes: 30, Description: "no work/study immediately after"},
		},
		
		PersonalCareTime: PersonalCareConfig{
			SkincareTotal: Duration{Minutes: 90, Description: "split throughout day"},
			ShowerWindow:  "flexible",
			CallTime:      "evening",
			LeisureTime:   Duration{Minutes: 60, Description: "some binge-watch/entertainment time"},
		},
		
		Rules: ScheduleRules{
			WorkStudyBeforeBreakfast: true,
			NoWorkStudyAfterLunch:   true,
			SleepNonNegotiable:      true,
			SleepCanSplit:           true,
			MustIncludeLeisure:      true,
			TimeShortagePreference:  []string{"work", "study", "chores", "skincare", "leisure"}, // Never sleep
		},
		
		ActivityConstraints: ActivityConstraints{
			MaxActivitiesPerDay: 3,
			ActivitySettings: map[string]ActivitySetting{
				"coffee_shop":     {DefaultDuration: 120, PreferredTime: "morning", Category: "leisure", Flexible: true},
				"cook_recipe":     {DefaultDuration: 60, PreferredTime: "evening", Category: "meal", Flexible: false, PrepTime: 15},
				"plant_flowers":   {DefaultDuration: 90, PreferredTime: "afternoon", Category: "outdoor", Flexible: true},
				"autumn_picture":  {DefaultDuration: 45, PreferredTime: "afternoon", Category: "outdoor", Flexible: true},
				"fruit_jam":       {DefaultDuration: 120, PreferredTime: "afternoon", Category: "cooking", Flexible: true, PrepTime: 30},
				"people_watch":    {DefaultDuration: 60, PreferredTime: "any", Category: "leisure", Flexible: true},
				"buy_scent":       {DefaultDuration: 60, PreferredTime: "afternoon", Category: "shopping", Flexible: true},
			},
		},
		
		FormatSettings: FormatSettings{
			IncludeTimestamps:   true,
			CheckboxFormat:      true,
			IncludeEmojis:       true,
			IncludeDescriptions: true,
			IncludeMotivation:   false,
			StyleTheme:          "casual",
		},
		
		CycleSettings: CycleSettings{
			EnableCycleConsiderations: true,
			PhaseRecommendations: map[string]PhaseRecommendation{
				"menstrual": {
					EnergyLevel:     "low",
					Recommendations: "Lower energy - prioritize gentle activities, focus on rest and self-care.",
					PreferredTypes:  []string{"leisure", "personal_care", "light_household"},
					AvoidTypes:      []string{"intense_physical", "social_heavy"},
				},
				"follicular": {
					EnergyLevel:     "medium",
					Recommendations: "Rising energy - good for learning, intense activities, creativity.",
					PreferredTypes:  []string{"study", "creative", "learning", "moderate_physical"},
					AvoidTypes:      []string{},
				},
				"ovulatory": {
					EnergyLevel:     "high",
					Recommendations: "Peak energy - social activities, high productivity, physical challenges.",
					PreferredTypes:  []string{"work", "social", "intense_physical", "challenging_tasks"},
					AvoidTypes:      []string{},
				},
				"luteal": {
					EnergyLevel:     "medium",
					Recommendations: "Declining energy - focus on completion, organization, moderate activities.",
					PreferredTypes:  []string{"organization", "completion_tasks", "moderate_activities"},
					AvoidTypes:      []string{"new_challenging_tasks"},
				},
			},
		},
	}
}