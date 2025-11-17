import { CalendarEvent } from '../types';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';
const CALENDAR_API_DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

let gapiInited = false;
let gisInited = false;
let tokenClient: any;

export const initializeGoogleAPI = async (): Promise<void> => {
  // Skip initialization if no client ID is configured
  if (!GOOGLE_CLIENT_ID) {
    console.warn('Google Calendar integration skipped: REACT_APP_GOOGLE_CLIENT_ID not configured');
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    // Load the Google API client
    if (!window.gapi) {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => loadGapi(resolve, reject);
      script.onerror = reject;
      document.body.appendChild(script);
    } else {
      loadGapi(resolve, reject);
    }
  });
};

const loadGapi = (resolve: () => void, reject: (error: any) => void) => {
  if (!GOOGLE_CLIENT_ID) {
    resolve();
    return;
  }

  window.gapi.load('client', async () => {
    try {
      await window.gapi.client.init({
        apiKey: '',
        discoveryDocs: [CALENDAR_API_DISCOVERY_DOC],
      });
      gapiInited = true;
      maybeEnableButtons(resolve);
    } catch (error) {
      console.error('Failed to initialize Google API client:', error);
      reject(error);
    }
  });

  // Load GIS (Google Identity Services)
  if (!window.google) {
    const gisScript = document.createElement('script');
    gisScript.src = 'https://accounts.google.com/gsi/client';
    gisScript.onload = () => initializeGIS(resolve);
    gisScript.onerror = (error) => {
      console.error('Failed to load Google Identity Services:', error);
      reject(error);
    };
    document.body.appendChild(gisScript);
  } else {
    initializeGIS(resolve);
  }
};

const initializeGIS = (resolve: () => void) => {
  if (!GOOGLE_CLIENT_ID) {
    resolve();
    return;
  }

  try {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPES,
      callback: '', // Will be set per request
    });
    gisInited = true;
    maybeEnableButtons(resolve);
  } catch (error) {
    console.error('Failed to initialize Google Identity Services:', error);
    resolve(); // Resolve anyway to not block the app
  }
};

const maybeEnableButtons = (resolve: () => void) => {
  if (gapiInited && gisInited) {
    resolve();
  }
};

export const signInAndFetchEvents = async (date: string): Promise<CalendarEvent[]> => {
  return new Promise((resolve, reject) => {
    if (!GOOGLE_CLIENT_ID) {
      reject(new Error('Google Client ID not configured. Please add REACT_APP_GOOGLE_CLIENT_ID to your .env file'));
      return;
    }

    tokenClient.callback = async (response: any) => {
      if (response.error) {
        reject(response);
        return;
      }

      try {
        const events = await fetchCalendarEvents(date);
        resolve(events);
      } catch (error) {
        reject(error);
      }
    };

    if (window.gapi.client.getToken() === null) {
      // Prompt the user to select an account
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      // Skip display of account chooser if already signed in
      tokenClient.requestAccessToken({ prompt: '' });
    }
  });
};

export const fetchCalendarEvents = async (date: string): Promise<CalendarEvent[]> => {
  try {
    const selectedDate = new Date(date);
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const response = await window.gapi.client.calendar.events.list({
      calendarId: 'primary',
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      showDeleted: false,
      singleEvents: true,
      maxResults: 50,
      orderBy: 'startTime',
    });

    const items = response.result.items || [];

    return items.map((event: any) => ({
      id: event.id,
      summary: event.summary || 'Untitled Event',
      description: event.description || '',
      location: event.location || '',
      start: {
        dateTime: event.start.dateTime,
        date: event.start.date,
      },
      end: {
        dateTime: event.end.dateTime,
        date: event.end.date,
      },
    }));
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    throw error;
  }
};

export const signOut = () => {
  const token = window.gapi.client.getToken();
  if (token !== null) {
    window.google.accounts.oauth2.revoke(token.access_token, () => {
      window.gapi.client.setToken(null);
    });
  }
};

// Type declarations for global window objects
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}
