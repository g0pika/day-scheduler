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
	log.Printf("Request decoded: %+v", req)

	// Build prompt for Gemini AI
	prompt := buildGeminiPrompt(req)
	log.Printf("Prompt built: %s", prompt)

	// Call Gemini API
	schedule, err := callGeminiAPI(prompt)
	if err != nil {
		log.Printf("Gemini API error: %v", err)
		writeErrorResponse(w, http.StatusInternalServerError, "Failed to generate schedule: "+err.Error())
		return
	}
	log.Printf("Schedule generated: %s", schedule)

	response := models.ScheduleResponse{
		Schedule: schedule,
		Success:  true,
		Message:  "Schedule generated successfully",
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
		log.Printf("Leisure activities: %d selected", req.SelectedCount)
		prompt.WriteString("\nLEISURE ACTIVITIES (select " + fmt.Sprintf("%d", req.SelectedCount) + "):\n")
		for _, activity := range req.Activities {
			log.Printf("Activity: %+v", activity)
			prompt.WriteString(fmt.Sprintf("- %s (%d minutes, preferred: %s)\n",
				activity.Name, activity.Duration, activity.PreferredTime))
		}
	}

	// Add special events
	if len(req.SpecialEvents) > 0 {
		log.Printf("Special events: %d", len(req.SpecialEvents))
		prompt.WriteString("\nSPECIAL EVENTS TODAY:\n")
		for _, event := range req.SpecialEvents {
			log.Printf("Event: %+v", event)
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
	log.Printf("Day type: %s", req.DayType)
	prompt.WriteString(fmt.Sprintf("\nDAY TYPE: %s\n", req.DayType))

	// Add female cycle considerations
	if req.UserProfile.IsFemale && req.UserProfile.CyclePhase != "" {
		phase := req.UserProfile.CyclePhase
		log.Printf("Cycle phase: %s", phase)
		var recommendations string

		switch phase {
		case "menstrual":
			recommendations = "Lower energy - prioritize gentle activities, focus on rest and self-care."
		case "follicular":
			recommendations = "Rising energy - good for learning, intense activities, creativity."
		case "ovulatory":
			recommendations = "Peak energy - social activities, high productivity, physical challenges."
		case "luteal":
			recommendations = "Declining energy - focus on completion, organization, moderate activities."
		default:
			recommendations = "Unknown phase"
			log.Printf("Unknown cycle phase: %s", phase)
		}

		prompt.WriteString(fmt.Sprintf("\nCYCLE CONSIDERATIONS:\n"))
		prompt.WriteString(fmt.Sprintf("- Phase: %s\n", phase))
		prompt.WriteString(fmt.Sprintf("- Recommendations: %s\n", recommendations))

		if req.EnergyLevel != "" {
			log.Printf("Today's energy level: %s", req.EnergyLevel)
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
	log.Println("Calling Gemini API")
	ctx := context.Background()

	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		log.Println("GEMINI_API_KEY environment variable not set")
		return "", fmt.Errorf("GEMINI_API_KEY environment variable not set")
	}

	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		log.Printf("Failed to create Gemini client: %v", err)
		return "", fmt.Errorf("failed to create Gemini client: %v", err)
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-1.5-flash")
	log.Println("Generating content with Gemini model")

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		log.Printf("Failed to generate content: %v", err)
		return "", fmt.Errorf("failed to generate content: %v", err)
	}

	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		log.Println("No content generated by Gemini")
		return "", fmt.Errorf("no content generated")
	}

	log.Println("Content generated successfully")
	return fmt.Sprintf("%v", resp.Candidates[0].Content.Parts[0]), nil
}
