package handlers

import (
	"context"
	"day-scheduler/models"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

func GenerateSchedule(w http.ResponseWriter, r *http.Request) {
	// Set CORS headers
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Content-Type", "application/json")

	// Handle preflight OPTIONS request
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		writeErrorResponse(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	var req models.ScheduleRequest

	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&req); err != nil {
		writeErrorResponse(w, http.StatusBadRequest, "Invalid request data: "+err.Error())
		return
	}
	defer r.Body.Close()

	// Build prompt for Gemini AI
	prompt := buildGeminiPrompt(req)

	// Call Gemini API
	schedule, err := callGeminiAPI(prompt)
	if err != nil {
		writeErrorResponse(w, http.StatusInternalServerError, "Failed to generate schedule: "+err.Error())
		return
	}

	response := models.ScheduleResponse{
		Schedule: schedule,
		Success:  true,
		Message:  "Schedule generated successfully",
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

func writeErrorResponse(w http.ResponseWriter, statusCode int, message string) {
	w.WriteHeader(statusCode)
	response := models.ScheduleResponse{
		Success: false,
		Message: message,
	}
	json.NewEncoder(w).Encode(response)
}

func buildGeminiPrompt(req models.ScheduleRequest) string {
	var prompt strings.Builder

	prompt.WriteString("Create a personalized daily schedule in checklist format with specific times.\n\n")

	// Add constraints
	prompt.WriteString("CONSTRAINTS:\n")
	prompt.WriteString(fmt.Sprintf("- Work: %d hours (remote work)\n", req.UserProfile.WorkHours))
	prompt.WriteString(fmt.Sprintf("- Study: %d hours (personal study/exam prep)\n", req.UserProfile.StudyHours))
	prompt.WriteString(fmt.Sprintf("- Sleep: %d hours (mandatory, can split if needed)\n", req.UserProfile.SleepHours))
	prompt.WriteString(fmt.Sprintf("- Household chores: %d tasks throughout day\n", req.UserProfile.HouseholdChores))

	// Add fixed time slots
	prompt.WriteString("\nFIXED TIME SLOTS:\n")
	prompt.WriteString("- Breakfast: 7:00-9:00 AM\n")
	prompt.WriteString("- Lunch: 12:30-2:00 PM (include 30min break after lunch, no work/study immediately after)\n")
	prompt.WriteString("- Snacks: 4:30-7:00 PM (if time allows)\n")
	prompt.WriteString("- Dinner: 7:30-8:50 PM\n")
	prompt.WriteString("- Skincare: 1.5 hours total (split throughout day)\n")
	prompt.WriteString("- Shower: morning or evening\n")
	prompt.WriteString("- Personal call/video chat: evening time\n")
	prompt.WriteString("- Some binge-watch/entertainment time\n")

	// Add activities
	if len(req.Activities) > 0 {
		prompt.WriteString("\nLEISURE ACTIVITIES (select " + fmt.Sprintf("%d", req.SelectedCount) + "):\n")
		for _, activity := range req.Activities {
			prompt.WriteString(fmt.Sprintf("- %s (%d minutes, preferred: %s)\n",
				activity.Name, activity.Duration, activity.PreferredTime))
		}
	}

	// Add special events
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

	// Add day type
	prompt.WriteString(fmt.Sprintf("\nDAY TYPE: %s\n", req.DayType))

	// Add female cycle considerations
	if req.UserProfile.IsFemale && req.UserProfile.CycleDay != nil {
		cycleDay := *req.UserProfile.CycleDay
		var phase, recommendations string

		if cycleDay >= 1 && cycleDay <= 5 {
			phase = "Menstrual"
			recommendations = "Lower energy - prioritize gentle activities, rest, self-care"
		} else if cycleDay >= 6 && cycleDay <= 14 {
			phase = "Follicular"
			recommendations = "Rising energy - good for learning, intense activities, creativity"
		} else if cycleDay >= 15 && cycleDay <= 17 {
			phase = "Ovulation"
			recommendations = "Peak energy - perfect for challenging tasks, social activities"
		} else {
			phase = "Luteal"
			recommendations = "Declining energy - focus on completion, organization, moderate activities"
		}

		prompt.WriteString(fmt.Sprintf("\nCYCLE CONSIDERATIONS:\n"))
		prompt.WriteString(fmt.Sprintf("- Phase: %s (Day %d)\n", phase, cycleDay))
		prompt.WriteString(fmt.Sprintf("- Recommendations: %s\n", recommendations))

		if req.EnergyLevel != "" {
			prompt.WriteString(fmt.Sprintf("- Today's energy level: %s\n", req.EnergyLevel))
		}
	}

	prompt.WriteString("\nFORMAT REQUIREMENTS:\n")
	prompt.WriteString("- Provide specific times for each activity (e.g., 7:00 AM, 2:30 PM)\n")
	prompt.WriteString("- Make it realistic and achievable\n")
	prompt.WriteString("- Include brief task descriptions\n")
	prompt.WriteString("- Balance work, study, personal care, and leisure\n")
	prompt.WriteString("- Account for travel/prep time when needed\n")
	prompt.WriteString("- Ensure no time conflicts\n")

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

	model := client.GenerativeModel("gemini-1.5-flash")

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		return "", fmt.Errorf("failed to generate content: %v", err)
	}

	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		return "", fmt.Errorf("no content generated")
	}

	return fmt.Sprintf("%v", resp.Candidates[0].Content.Parts[0]), nil
}
