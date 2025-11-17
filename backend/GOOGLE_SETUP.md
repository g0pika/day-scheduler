# Google Calendar Integration Setup Guide

## Prerequisites
- Google Account
- Google Cloud Console access

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project" or select an existing project
3. Name your project (e.g., "Day Scheduler")

## Step 2: Enable APIs

1. In your project, go to "APIs & Services" > "Enable APIs and Services"
2. Search for and enable:
   - **Google Calendar API**
   - **Google Identity Platform** (for OAuth)

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen first:
   - Choose "External" for user type
   - Fill in app name: "Smart Day Scheduler"
   - Add your email for support
   - Add authorized domains (if any)
   - Add scopes:
     - `openid`
     - `email`
     - `profile`
     - `https://www.googleapis.com/auth/calendar.readonly`
     - `https://www.googleapis.com/auth/calendar.events.readonly`

4. For OAuth client ID:
   - Application type: "Web application"
   - Name: "Day Scheduler Mobile"
   - Authorized redirect URIs:
     ```
     https://auth.expo.io
     ```

   **IMPORTANT**: The app uses Expo's authentication proxy for OAuth.
   Just add `https://auth.expo.io` as the redirect URI - no Expo account needed.

## Step 4: Get Your Client ID

1. After creating, you'll see your Client ID
2. Copy the Client ID (looks like: `123456789-abcdef.apps.googleusercontent.com`)

## Step 5: Configure the Mobile App

1. Create a `.env` file in `day-scheduler-mobile/`:
   ```env
   GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
   API_BASE_URL=http://localhost:8080
   ```

2. Update `src/config/config.ts` with your client ID if not using env variables

## Step 6: Test the Integration

1. Start the backend:
   ```bash
   cd day-scheduler
   go run main.go
   ```

2. Start the mobile app:
   ```bash
   cd day-scheduler-mobile
   npx expo start
   ```

3. In the app:
   - Sign in with Google
   - Grant calendar permissions
   - Your calendar events will now be fetched
   - Generated schedules will work around your meetings!

## Troubleshooting

### "Invalid Client" Error
- Make sure your Client ID is correctly copied
- Verify redirect URIs match exactly
- Check that APIs are enabled

### "Access Blocked" Error
- Make sure OAuth consent screen is configured
- For testing, add test users in Console

### Calendar Events Not Showing
- Verify calendar permissions were granted
- Check that events exist for today
- Look at console logs for API errors

## Security Notes

- **Never commit** your `.env` files to git
- Keep your API keys secret
- Use environment variables for all sensitive data
- The Gemini API key should only be on the backend, never in the mobile app

## Production Deployment

When deploying to production:

1. Update redirect URIs in Google Console
2. Change API_BASE_URL to your production backend
3. Consider implementing token refresh for long sessions
4. Add proper error handling for expired tokens