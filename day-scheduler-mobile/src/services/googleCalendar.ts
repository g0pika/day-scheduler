import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

// Google OAuth configuration
const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

// You'll need to set up these in Google Cloud Console
const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
const REDIRECT_URI = AuthSession.makeRedirectUri({
  scheme: 'com.yourcompany.dayscheduler',
});

export interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime: string };
  end: { dateTime: string };
  description?: string;
  location?: string;
}

export const GoogleCalendarService = {
  // Get authorization
  async authenticate() {
    const request = new AuthSession.AuthRequest({
      clientId: CLIENT_ID,
      scopes: [
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/calendar.events.readonly',
      ],
      redirectUri: REDIRECT_URI,
      responseType: AuthSession.ResponseType.Token,
      ...discovery,
    });

    const result = await request.promptAsync(discovery);
    
    if (result.type === 'success') {
      return result.authentication?.accessToken;
    }
    return null;
  },

  // Fetch events for a specific date
  async getEventsForDate(accessToken: string, date: Date): Promise<CalendarEvent[]> {
    const timeMin = new Date(date);
    timeMin.setHours(0, 0, 0, 0);
    
    const timeMax = new Date(date);
    timeMax.setHours(23, 59, 59, 999);

    const params = new URLSearchParams({
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: 'true',
      orderBy: 'startTime',
    });

    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch calendar events');
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      return [];
    }
  },

  // Convert Google Calendar events to our Activity format
  convertToActivities(events: CalendarEvent[]): any[] {
    return events.map((event, index) => ({
      id: `gcal-${event.id}`,
      name: event.summary || 'Calendar Event',
      category: 'class' as const, // Meetings/appointments
      duration: this.calculateDuration(event.start.dateTime, event.end.dateTime),
      startTime: this.extractTime(event.start.dateTime),
      completed: false,
      icon: '📅',
      color: '#FFB6C1',
      isFromCalendar: true,
      calendarData: {
        location: event.location,
        description: event.description,
      },
    }));
  },

  calculateDuration(start: string, end: string): number {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));
  },

  extractTime(dateTime: string): string {
    const date = new Date(dateTime);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  },
};