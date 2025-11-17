package handlers

import (
	"context"
	"day-scheduler/models"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

func GenerateSchedule(w http.ResponseWriter, r *http.Request) {
	log.Println("GenerateSchedule called")
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		log.Printf("Invalid method: %s", r.Method)
		writeErrorResponse(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	var req models.ScheduleRequest

	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&req); err != nil {
		log.Printf("Failed to decode request: %v", err)
		writeErrorResponse(w, http.StatusBadRequest, "Invalid request data: "+err.Error())
		return
	}
	defer r.Body.Close()

	prompt := buildGeminiPrompt(req)
	schedule, err := callGeminiAPI(prompt)
	if err != nil {
		log.Printf("Gemini API error: %v", err)
		writeErrorResponse(w, http.StatusInternalServerError, "Failed to generate schedule: "+err.Error())
		return
	}

	response := models.ScheduleResponse{
		Schedule: schedule,
		Success:  true,
		Message:  "Schedule generated successfully",
		Prompt:   prompt,
	}

	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Failed to encode response: %v", err)
	}
}

func writeErrorResponse(w http.ResponseWriter, statusCode int, message string) {
	log.Printf("Error response: %d - %s", statusCode, message)
	w.WriteHeader(statusCode)
	response := models.ScheduleResponse{
		Success: false,
		Message: message,
	}
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Failed to encode error response: %v", err)
	}
}

func buildGeminiPrompt(req models.ScheduleRequest) string {
	log.Println("Building Gemini prompt")
	var prompt strings.Builder

	config := req.PromptConfig
	if config == nil {
		defaultConfig := models.GetDefaultPromptConfig()
		config = &defaultConfig
	}

	if req.ScheduleDate != "" && req.DayOfWeek != "" {
		prompt.WriteString(fmt.Sprintf("📅 SCHEDULE FOR: %s (%s)\n\n", req.DayOfWeek, req.ScheduleDate))
	}
	switch config.FormatSettings.StyleTheme {
	case "professional":
		prompt.WriteString("Generate a structured, professional daily schedule with precise time allocation and productivity optimization.\n\n")
	case "minimal":
		prompt.WriteString("Create a simple, clean daily schedule.\n\n")
	case "detailed":
		prompt.WriteString("Create a comprehensive, detailed daily schedule with explanations and context for each activity.\n\n")
	default:
		prompt.WriteString("Create a personalized daily schedule in checklist format with specific times.\n\n")
	}
	prompt.WriteString("CONSTRAINTS:\n")
	prompt.WriteString(fmt.Sprintf("- Work: %d hours (remote work, range: %d-%d hours)\n", 
		req.UserProfile.WorkHours, config.WorkHoursRange.Min, config.WorkHoursRange.Max))
	prompt.WriteString(fmt.Sprintf("- Study: %d hours (personal study/exam prep, range: %d-%d hours)\n",
		req.UserProfile.StudyHours, config.StudyHoursRange.Min, config.StudyHoursRange.Max))
	prompt.WriteString("  ⚠️ EXAM URGENCY: GATE exam in 1 month - MAXIMUM PRIORITY to study time!\n")
	prompt.WriteString("  ⭐ BEST STUDY TIME: 6:00 AM - 9:00 AM (peak productivity window - prioritize study here)\n")
	if req.StudyPlan != "" {
		prompt.WriteString("\n📖 TODAY'S STUDY TOPICS:\n")
		prompt.WriteString(req.StudyPlan + "\n")
	}
	prompt.WriteString(fmt.Sprintf("- Sleep: %d hours (%s, range: %d-%d hours)\n", 
		req.UserProfile.SleepHours, 
		func() string {
			if config.Rules.SleepNonNegotiable {
				if config.Rules.SleepCanSplit {
					return "mandatory, can split if needed"
				}
				return "mandatory, continuous"
			}
			return "flexible"
		}(),
		config.SleepHoursRange.Min, config.SleepHoursRange.Max))
	prompt.WriteString(fmt.Sprintf("- Household chores: %d tasks throughout day (range: %d-%d tasks)\n",
		req.UserProfile.HouseholdChores, config.ChoresRange.Min, config.ChoresRange.Max))

	prompt.WriteString("\nFIXED TIME SLOTS:\n")
	prompt.WriteString(fmt.Sprintf("- Breakfast: %s-%s\n",
		config.MealTimes.BreakfastWindow.Start, config.MealTimes.BreakfastWindow.End))
	prompt.WriteString(fmt.Sprintf("- Lunch: %s-%s (%s)\n",
		config.MealTimes.LunchWindow.Start, config.MealTimes.LunchWindow.End,
		config.MealTimes.PostLunchBreak.Description))
	prompt.WriteString(fmt.Sprintf("- Snacks: %s-%s (if time allows)\n",
		config.MealTimes.SnacksWindow.Start, config.MealTimes.SnacksWindow.End))
	prompt.WriteString(fmt.Sprintf("- Dinner: %s-%s\n",
		config.MealTimes.DinnerWindow.Start, config.MealTimes.DinnerWindow.End))
	prompt.WriteString(fmt.Sprintf("- Skincare: %d minutes total (%s)\n",
		config.PersonalCareTime.SkincareTotal.Minutes, config.PersonalCareTime.SkincareTotal.Description))
	prompt.WriteString(fmt.Sprintf("- Shower: %s\n", config.PersonalCareTime.ShowerWindow))
	prompt.WriteString(fmt.Sprintf("- Personal call/video chat: %s time\n", config.PersonalCareTime.CallTime))
	if config.Rules.MustIncludeLeisure {
		prompt.WriteString(fmt.Sprintf("- %s\n", config.PersonalCareTime.LeisureTime.Description))
	}

	if len(req.Activities) > 0 {
		prompt.WriteString("\nLEISURE ACTIVITIES (select " + fmt.Sprintf("%d", req.SelectedCount) + "):\n")
		for _, activity := range req.Activities {
			prompt.WriteString(fmt.Sprintf("- %s (%d minutes, preferred: %s)\n",
				activity.Name, activity.Duration, activity.PreferredTime))
		}
	}

	if len(req.SpecialEvents) > 0 {
		prompt.WriteString("\nSPECIAL EVENTS TODAY:\n")
		for _, event := range req.SpecialEvents {
			if event.Name != "" {
				prompt.WriteString(fmt.Sprintf("- %s: %s", event.Type, event.Name))
			} else {
				prompt.WriteString(fmt.Sprintf("- %s", event.Type))
			}
			if event.StartTime != "" {
				prompt.WriteString(fmt.Sprintf(" at %s", event.StartTime))
			}
			prompt.WriteString(fmt.Sprintf(" (%d minutes", event.Duration))
			if event.PrepTime > 0 {
				prompt.WriteString(fmt.Sprintf(", %d min prep time", event.PrepTime))
			}
			prompt.WriteString(")\n")
		}
	}

	if len(req.CalendarEvents) > 0 {
		prompt.WriteString("\nEXISTING CALENDAR EVENTS (DO NOT SCHEDULE OVER THESE):\n")
		for _, event := range req.CalendarEvents {
			startTime := ""
			endTime := ""

			if event.Start.DateTime != "" {
				startTime = event.Start.DateTime
			} else if event.Start.Date != "" {
				startTime = "All day"
			}

			if event.End.DateTime != "" {
				endTime = event.End.DateTime
			}
			
			prompt.WriteString(fmt.Sprintf("- %s", event.Summary))
			if startTime != "" && endTime != "" && startTime != "All day" {
				prompt.WriteString(fmt.Sprintf(" (%s to %s)", startTime, endTime))
			} else if startTime != "" {
				prompt.WriteString(fmt.Sprintf(" (%s)", startTime))
			}
			if event.Location != "" {
				prompt.WriteString(fmt.Sprintf(" @ %s", event.Location))
			}
			prompt.WriteString("\n")
		}
		prompt.WriteString("IMPORTANT: Work around these existing events!\n")
	}

	prompt.WriteString(fmt.Sprintf("\nDAY TYPE: %s\n", req.DayType))

	if config.CycleSettings.EnableCycleConsiderations && req.UserProfile.IsFemale && req.UserProfile.CyclePhase != "" {
		phase := req.UserProfile.CyclePhase
		
		if phaseRec, exists := config.CycleSettings.PhaseRecommendations[phase]; exists {
			prompt.WriteString(fmt.Sprintf("\nCYCLE CONSIDERATIONS:\n"))
			prompt.WriteString(fmt.Sprintf("- Phase: %s\n", phase))
			prompt.WriteString(fmt.Sprintf("- Energy Level: %s\n", phaseRec.EnergyLevel))
			prompt.WriteString(fmt.Sprintf("- Recommendations: %s\n", phaseRec.Recommendations))
			
			if len(phaseRec.PreferredTypes) > 0 {
				prompt.WriteString(fmt.Sprintf("- Preferred activities: %v\n", phaseRec.PreferredTypes))
			}
			if len(phaseRec.AvoidTypes) > 0 {
				prompt.WriteString(fmt.Sprintf("- Avoid activities: %v\n", phaseRec.AvoidTypes))
			}

			if req.EnergyLevel != "" {
				prompt.WriteString(fmt.Sprintf("- Today's reported energy level: %s\n", req.EnergyLevel))
			}
		}
	}

	prompt.WriteString("\nFORMAT REQUIREMENTS:\n")
	if config.FormatSettings.IncludeTimestamps {
		prompt.WriteString("- Provide specific times for each activity (e.g., 7:00 AM, 2:30 PM)\n")
	}
	if config.FormatSettings.CheckboxFormat {
		prompt.WriteString("- Use checkbox format: - [ ] Task name\n")
	}
	if config.FormatSettings.IncludeEmojis {
		prompt.WriteString("- Include relevant emojis for visual appeal\n")
	}
	if config.FormatSettings.IncludeDescriptions {
		prompt.WriteString("- Include brief task descriptions\n")
	}
	prompt.WriteString("- Make it realistic and achievable\n")
	prompt.WriteString("- Balance work, study, personal care, and leisure\n")
	prompt.WriteString("- Account for travel/prep time when needed\n")
	prompt.WriteString("- Ensure no time conflicts\n")
	prompt.WriteString("- CRITICAL: Prioritize study blocks during 6:00-9:00 AM when possible (best productivity)\n")
	prompt.WriteString("- Study sessions should be focused and uninterrupted\n")
	prompt.WriteString("- Given exam urgency, protect study time from other activities\n")
	if len(config.Rules.TimeShortagePreference) > 0 {
		prompt.WriteString(fmt.Sprintf("- If time runs short, reduce in this order: %v (never reduce sleep)\n",
			config.Rules.TimeShortagePreference))
	}
	if config.FormatSettings.IncludeMotivation {
		prompt.WriteString("- End with a brief motivational note\n")
	}

	return prompt.String()
}

func callGeminiAPI(prompt string) (string, error) {
	ctx := context.Background()
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		return "", fmt.Errorf("GEMINI_API_KEY environment variable not set")
	}

	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		return "", fmt.Errorf("failed to create Gemini client: %v", err)
	}
	defer client.Close()

	modelName := os.Getenv("GEMINI_MODEL")
	if modelName == "" {
		modelName = "gemini-2.0-flash"
	}

	model := client.GenerativeModel(modelName)
	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		return "", fmt.Errorf("failed to generate content: %v", err)
	}

	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		return "", fmt.Errorf("no content generated")
	}

	return fmt.Sprintf("%v", resp.Candidates[0].Content.Parts[0]), nil
}
