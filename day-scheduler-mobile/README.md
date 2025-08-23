# Day Scheduler Mobile App

A React Native mobile app for daily schedule management with period tracking and Google Calendar integration.

## Features

✅ **First Launch Setup**
- All activity categories available from day one
- Configure wake/sleep times
- Optional period tracking setup

✅ **Smart Scheduling**
- Auto-generates daily schedules
- Adjusts activities based on menstrual cycle phase
- Integrates with Google Calendar events

✅ **Period Tracking**
- Simple average-based prediction (no ML needed)
- Tracks cycle phases (menstrual, follicular, ovulation, luteal)
- Adjusts activity intensity based on energy levels

✅ **Auto-Save**
- All configurations saved automatically
- Progress tracked in real-time
- Offline support with AsyncStorage

## Running the App

### Prerequisites
- Node.js 16+
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation
```bash
npm install
```

### Start Development Server
```bash
npm start
```

### Run on Simulators
After starting the server:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code with Expo Go app on physical device

## App Flow

1. **First Launch**: User sets up profile with name, schedule times, activities, and optional period data
2. **Daily Use**: Opens directly to today's schedule with activities to check off
3. **Schedule Generation**: Each night, tomorrow's schedule is auto-generated based on:
   - User's template
   - Current cycle phase
   - Google Calendar events

## Configuration

### Google Calendar Setup
1. Create project in Google Cloud Console
2. Enable Calendar API
3. Get OAuth 2.0 credentials
4. Update `CLIENT_ID` in `src/services/googleCalendar.ts`

### Backend Integration
Update API endpoint in `src/services/api.ts`:
```typescript
const API_BASE_URL = 'http://your-backend-url:8080';
```

## Project Structure
```
src/
├── screens/          # Main app screens
├── services/         # API and external services
├── utils/            # Helper functions
├── types/            # TypeScript definitions
└── components/       # Reusable components (to be added)
```

## Next Steps

- [ ] Connect to Go backend API
- [ ] Add push notifications for activity reminders
- [ ] Implement data export feature
- [ ] Add more customization options
- [ ] Create settings screen
- [ ] Add data visualization/charts

## Technologies

- React Native with TypeScript
- Expo for development
- AsyncStorage for local data
- Google Calendar API
- Period tracking with simple averaging