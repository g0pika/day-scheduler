# 🗓️ Smart Day Scheduler

An AI-powered personalized daily scheduling application with React web frontend and Go backend API.

## 📋 Overview

Smart Day Scheduler is a React web app with a Go backend that leverages Google's Gemini AI to generate personalized daily schedules. It integrates with Google Calendar to fetch existing events and takes into account work hours, study time, household chores, leisure activities, special events, and even female cycle phases to create an optimal daily plan.

## ✨ Features

- **AI-Powered Schedule Generation**: Uses Google Gemini AI to create intelligent, personalized schedules
- **Google Calendar Integration**: Syncs with Google Calendar to fetch existing events and work around them
- **Exam/Goal Urgency Support**: Prioritizes study time for GATE exam with best productivity hours (6-9 AM)
- **Custom Study Plans**: Daily customizable study topics via side drawer
- **Customizable Constraints**:
  - Work hours (remote work)
  - Study hours (personal study/exam preparation)
  - Household chores (unlimited)
  - Sleep requirements
- **Leisure Activity Planning**: Add custom activities with duration and preferred timing
- **Special Events Support**:
  - Travel/commute planning
  - Gym sessions
  - Classes/appointments
- **Female Cycle Optimization**: Optional cycle-aware scheduling for optimized energy management
- **Configurable Preferences**: Customize meal times, personal care routines, and schedule formatting
- **Schedule History**: View AI prompts used to generate schedules

## 🛠️ Technology Stack

- **Backend**: Go 1.23.0
  - `github.com/google/generative-ai-go` - Gemini AI SDK
  - `github.com/joho/godotenv` - Environment variable management
  - `github.com/go-chi/chi/v5` - HTTP router
  - `google.golang.org/api` - Google API client
- **Frontend**: React with TypeScript
  - Google Calendar API integration
  - Material-UI inspired components
- **AI Integration**: Google Gemini AI (gemini-2.0-flash model)

## 📦 Installation

### Prerequisites

- Go 1.23.0 or higher
- Node.js and npm
- Google Gemini API key
- Google Cloud project with Calendar API enabled (optional)

### Setup Instructions

1. **Clone the repository**:
```bash
git clone https://github.com/g0pika/day-scheduler.git
cd day-scheduler
```

2. **Install backend dependencies**:
```bash
cd backend
go mod download
```

3. **Set up backend environment variables**:
Create a `.env` file in the `backend/` directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash
PORT=8080
```

4. **Set up frontend**:
```bash
cd ../frontend
npm install
```

5. **Configure frontend** (optional for Google Calendar):
Create `.env` file in `frontend/`:
```env
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

6. **Run the application**:

In two separate terminals:
```bash
# Terminal 1: Start Go backend
cd backend
go run main.go

# Terminal 2: Start React frontend
cd frontend
npm start
```

7. **Access the application**:
- Open your browser to `http://localhost:3000`
- The backend API runs on `http://localhost:8080`

## 🏗️ Architecture

### Project Structure

```
day-scheduler/
│
├── backend/                   # Go backend
│   ├── main.go                # Entry point, HTTP server setup
│   ├── go.mod                 # Go module definition
│   ├── go.sum                 # Dependency checksums
│   ├── .env                   # Backend environment variables
│   │
│   ├── handlers/              # HTTP request handlers
│   │   ├── schedule.go        # Schedule generation logic
│   │   ├── auto_schedule.go   # Auto-schedule with day detection
│   │   └── weekly_config.go   # Weekly configuration management
│   │
│   └── models/                # Data structures
│       ├── types.go           # Core data models
│       ├── prompt_config.go   # Prompt configuration models
│       └── weekly_config.go   # Weekly schedule config
│
└── frontend/                  # React web app
    ├── package.json
    ├── tsconfig.json
    ├── .env                   # Frontend environment variables
    │
    ├── public/                # Static assets
    │
    └── src/
        ├── App.tsx            # Main app component
        ├── App.css            # Styling
        ├── types.ts           # TypeScript types
        │
        ├── components/        # React components
        │   ├── ProfileSetup.tsx
        │   ├── ActivitiesSetup.tsx
        │   ├── SpecialEventsSetup.tsx
        │   ├── CycleInfo.tsx
        │   ├── ScheduleDisplay.tsx
        │   ├── StudyPlanDrawer.tsx
        │   └── StepIndicator.tsx
        │
        └── services/          # API services
            └── googleCalendar.ts
```

### Component Overview

#### Backend Components

1. **Main Server** (`backend/main.go`):
   - Initializes HTTP server with Chi router
   - Sets up CORS middleware
   - Routes API requests to handlers
   - Loads environment variables

2. **Schedule Handlers** (`backend/handlers/`):
   - `schedule.go`: Processes schedule generation requests
   - `auto_schedule.go`: Auto-detects tomorrow's day and generates schedule
   - `weekly_config.go`: Manages weekly configuration

3. **Data Models** (`backend/models/`):
   - `types.go`: Core data structures (UserProfile, Activity, SpecialEvent, CalendarEvent)
   - `prompt_config.go`: Configurable prompt settings for AI generation
   - `weekly_config.go`: Day-specific scheduling configurations

#### Frontend Components

The React web application features:
- **ProfileSetup**: User profile and preferences configuration
- **ActivitiesSetup**: Leisure activity selection
- **SpecialEventsSetup**: Special events and Google Calendar integration
- **CycleInfo**: Female cycle phase and energy level input
- **ScheduleDisplay**: AI-generated schedule display with progress tracking
- **StudyPlanDrawer**: Side drawer for customizing daily study topics
- **StepIndicator**: Progress indicator across setup steps

### API Endpoints

1. **GET `/health`** - Health check endpoint
2. **POST `/api/generate-schedule`** - Generate AI-powered schedule with full configuration
3. **POST `/api/auto-generate-schedule`** - Auto-generate tomorrow's schedule with day detection
4. **GET `/api/tomorrow-info`** - Get information for tomorrow's schedule
5. **GET `/api/weekly-config`** - Get weekly configuration
6. **PUT `/api/weekly-config`** - Update weekly configuration

### Request Flow

1. User configures profile (work hours, study hours, chores, sleep)
2. User selects leisure activities
3. User optionally adds special events and fetches Google Calendar events
4. Female users optionally specify cycle phase and energy level
5. Frontend sends POST request to backend `/api/generate-schedule` with:
   - User profile and constraints
   - Selected leisure activities
   - Special events
   - Google Calendar events
   - Study plan topics
   - Cycle phase and energy level (if applicable)
6. Backend constructs detailed prompt using `PromptConfig`
7. Gemini AI processes prompt and generates personalized schedule
8. Backend returns formatted schedule and prompt to frontend
9. Frontend displays the schedule with interactive checkboxes

## 🔧 Configuration

### Environment Variables

**Backend** (`.env` in `backend/`):
- `GEMINI_API_KEY` (required): Your Google Gemini API key
- `GEMINI_MODEL` (optional): Gemini model to use (default: gemini-2.0-flash)
- `PORT` (optional): Server port (default: 8080)

**Frontend** (`.env` in `frontend/`):
- `REACT_APP_GOOGLE_CLIENT_ID` (optional): Your Google OAuth Client ID for Calendar integration

### Customization Options

The application can be customized through:
- `backend/models/prompt_config.go`: AI prompt configuration (meal times, sleep rules, cycle settings, exam urgency, etc.)
- Backend environment variables for API keys and model selection
- Frontend date selection for scheduling different days

## 📝 Usage

1. **Profile Setup**: Configure work hours, study hours, household chores, and sleep requirements
2. **Activities**: Add leisure activities with durations and preferred times
3. **Special Events**: Include special events like gym sessions, classes, or travel plans
4. **Google Calendar** (optional): Fetch existing calendar events to work around
5. **Cycle Information** (optional): For female users, specify cycle phase and energy level
6. **Study Plan**: Click the 📚 button to add specific study topics for the day
7. **Generate Schedule**: The app generates a personalized AI schedule
8. **View Prompt**: Click "View AI Prompt" to see the exact prompt sent to Gemini
9. **Track Progress**: Check off tasks as you complete them

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Google Gemini AI for intelligent schedule generation
- Go community for excellent libraries and tools
- React community for frontend tools and best practices
