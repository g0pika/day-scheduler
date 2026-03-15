# Smart Day Scheduler

AI-powered daily scheduling app built with React and Go. Uses Google Gemini AI to generate personalized schedules based on your work hours, study time, activities, Google Calendar events, and more.

## Features

- AI schedule generation via Google Gemini
- Google Calendar integration
- Customizable work hours, study hours, chores, and sleep
- Leisure activity and special event planning
- Custom daily study topics
- Cycle-aware scheduling (optional)
- Interactive task checkboxes

## Tech Stack

- **Backend**: Go (Chi router, Gemini AI SDK)
- **Frontend**: React + TypeScript

## Setup

### Prerequisites

- Go 1.23+
- Node.js + npm
- [Google Gemini API key](https://ai.google.dev/)

### Run

```bash
# Clone
git clone https://github.com/g0pika/day-scheduler.git
cd day-scheduler

# Backend
cd backend
go mod download
cp .env.example .env  # Add your GEMINI_API_KEY
go run main.go

# Frontend (in another terminal)
cd frontend
npm install
npm start
```

App runs at http://localhost:3000, backend API at http://localhost:8080.

### Environment Variables

**Backend** (`backend/.env`):
```env
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.0-flash
PORT=8080
```

**Frontend** (`frontend/.env`, optional for Google Calendar):
```env
REACT_APP_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
