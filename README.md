# 🗓️ Smart Day Scheduler

An AI-powered personalized daily scheduling application that creates optimized daily schedules based on user preferences, work/study requirements, and personal activities.

## 📋 Overview

Smart Day Scheduler is a Go-based web application that leverages Google's Gemini AI to generate personalized daily schedules. It takes into account work hours, study time, household chores, leisure activities, special events, and even female cycle phases to create an optimal daily plan with interactive checkboxes for task tracking.

## ✨ Features

- **AI-Powered Schedule Generation**: Uses Google Gemini AI to create intelligent, personalized schedules
- **Interactive Task Management**: Generated schedules include checkboxes for tracking task completion
- **Progress Tracking**: Real-time progress bar showing percentage of completed tasks
- **Customizable Constraints**:
  - Work hours (remote work)
  - Study hours (personal study/exam preparation)
  - Household chores
  - Sleep requirements
- **Leisure Activity Planning**: Add custom activities with duration and preferred timing
- **Special Events Support**:
  - Travel/commute planning
  - Gym sessions
  - Classes/appointments
- **Female Cycle Optimization**: Optional cycle-aware scheduling for optimized energy management
- **Fixed Time Slots**: Respects meal times, breaks, and personal care routines
- **Date Division Calculator**: Additional utility for planning long-term goals across time periods

## 🛠️ Technology Stack

- **Backend**: Go 1.23.0
- **AI Integration**: Google Gemini AI (gemini-1.5-flash model)
- **Frontend**: React 18 with TypeScript
- **Dependencies**:
  - `github.com/google/generative-ai-go` - Gemini AI SDK
  - `github.com/joho/godotenv` - Environment variable management
  - `google.golang.org/api` - Google API client
  - React, TypeScript, Create React App

## 📦 Installation

### Prerequisites

- Go 1.23.0 or higher
- Google Gemini API key

### Setup Instructions

1. **Clone the repository**:
```bash
git clone https://github.com/yourusername/day-scheduler.git
cd day-scheduler
```

2. **Install backend dependencies**:
```bash
go mod download
```

3. **Install frontend dependencies**:
```bash
cd frontend
npm install
cd ..
```

4. **Set up environment variables**:
Create a `.env` file in the project root:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=8080  # Optional, defaults to 8080
```

5. **Run the application**:

For development (two separate terminals):
```bash
# Terminal 1: Start Go backend
go run main.go

# Terminal 2: Start React frontend
cd frontend
npm start
```

For production:
```bash
# Build React app
cd frontend
npm run build
cd ..

# Run Go backend (serves built React app)
go run main.go
```

6. **Access the application**:
- Development: http://localhost:3000 (React dev server)
- Production: http://localhost:8080 (Go server)

## 🏗️ Architecture

### Project Structure

```
day-scheduler/
│
├── main.go                 # Entry point, HTTP server setup
├── go.mod                  # Go module definition
├── go.sum                  # Dependency checksums
├── .env                    # Environment variables (not in repo)
│
├── handlers/               # HTTP request handlers
│   ├── schedule.go         # Schedule generation logic
│   └── date_divider.go    # Date division calculator
│
├── models/                 # Data structures
│   ├── types.go            # Core data models
│   └── date_divider.go    # Date division models
│
├── static/                 # Legacy frontend (kept for backup)
│   └── index.html          # Original single-page app
│
└── frontend/               # React TypeScript frontend
    ├── public/             # Static assets
    ├── src/
    │   ├── components/     # React components
    │   │   ├── StepIndicator.tsx
    │   │   ├── ProfileSetup.tsx
    │   │   ├── ActivitiesSetup.tsx
    │   │   ├── SpecialEventsSetup.tsx
    │   │   ├── CycleInfo.tsx
    │   │   └── ScheduleDisplay.tsx
    │   ├── types.ts        # TypeScript interfaces
    │   ├── App.tsx         # Main app component
    │   └── App.css         # Styles
    ├── package.json
    └── tsconfig.json
```

### Component Overview

#### Backend Components

1. **Main Server** (`main.go`):
   - Initializes HTTP server
   - Sets up routing for static files and API endpoints
   - Handles environment configuration

2. **Schedule Handler** (`handlers/schedule.go`):
   - Processes schedule generation requests
   - Builds prompts for Gemini AI
   - Manages AI API communication
   - Returns formatted schedules

3. **Date Divider Handler** (`handlers/date_divider.go`):
   - Calculates date divisions for long-term planning
   - Provides milestone tracking functionality

4. **Data Models** (`models/types.go`):
   - `UserProfile`: User preferences and constraints
   - `Activity`: Leisure activity definitions
   - `SpecialEvent`: One-time events and appointments
   - `ScheduleRequest/Response`: API communication structures

#### Frontend Components

The React TypeScript application features:
- **StepIndicator**: Progress indicator showing current step
- **ProfileSetup**: Basic user profile configuration
- **ActivitiesSetup**: Activity list input with markdown checkbox parsing
- **SpecialEventsSetup**: One-time events and appointments
- **CycleInfo**: Female cycle-aware scheduling options
- **ScheduleDisplay**: Interactive schedule with checkboxes and progress tracking
- **Responsive Design**: Mobile-friendly interface with modern UI

### API Endpoints

1. **GET `/`** - Serves the main application
2. **GET `/health`** - Health check endpoint
3. **POST `/api/generate-schedule`** - Generate AI-powered schedule
4. **POST `/api/calculate-date-divisions`** - Calculate date divisions

### Request Flow

1. User fills out multi-step form with preferences
2. Frontend sends POST request to `/api/generate-schedule`
3. Backend constructs detailed prompt based on:
   - Work/study hours
   - Fixed meal times
   - Selected leisure activities
   - Special events
   - Energy levels (cycle-aware if applicable)
4. Gemini AI processes prompt and generates schedule
5. Backend returns formatted schedule
6. Frontend renders interactive checklist with progress tracking

## 🔧 Configuration

### Environment Variables

- `GEMINI_API_KEY` (required): Your Google Gemini API key
- `PORT` (optional): Server port (default: 8080)

### Customization Options

The application can be customized by modifying:
- Fixed time slots in `handlers/schedule.go`
- Default values in `static/index.html`
- Styling in the embedded CSS
- AI prompt structure in `buildGeminiPrompt()` function

## 📝 Usage

1. **Basic Profile**: Set work hours, study hours, household chores, and sleep requirements
2. **Activities**: Paste your activity list in checkbox format:
   ```
   - [ ] Try a Piña Colada
   - [ ] Opt for White Sneakers
   - [ ] Experiment with Basil Hummus
   - [ ] Try a new coffee blend
   ```
   Or just list them plainly:
   ```
   painting
   build dioramas
   start a new book series
   ```
3. **Special Events**: Include one-time events like gym, classes, or travel
4. **Cycle Information** (optional): For female users, specify cycle phase and energy level
5. **Generate**: Click generate to receive your personalized schedule
6. **Track Progress**: Check off tasks as you complete them and monitor progress

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Google Gemini AI for intelligent schedule generation
- Go community for excellent libraries and tools