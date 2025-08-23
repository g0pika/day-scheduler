const API_BASE_URL = 'http://localhost:8080'; // Change to your server URL

export const ApiService = {
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  async getSchedule(date: string, token: string) {
    const response = await fetch(`${API_BASE_URL}/api/schedule/${date}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  async updateActivity(activityId: string, completed: boolean, token: string) {
    const response = await fetch(`${API_BASE_URL}/api/activity/${activityId}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ completed }),
    });
    return response.json();
  },

  async savePeriodData(data: any, token: string) {
    const response = await fetch(`${API_BASE_URL}/api/period`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};