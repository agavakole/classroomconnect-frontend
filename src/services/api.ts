// src/services/api.ts

const API_BASE_URL = 'http://localhost:8000';

export const publicApi = {
  
  // Get session by join token
  getSession: async (joinToken: string) => {
    const response = await fetch(`${API_BASE_URL}/join/${joinToken}`);
    if (!response.ok) throw new Error('Invalid join token');
    return response.json();
  },

  // Get survey questions for a session
  getSurvey: async (sessionId: string) => {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/survey`);
    if (!response.ok) throw new Error('Could not fetch survey');
    return response.json();
  },

  // Submit survey answers (guest mode)
  submitSurvey: async (
    sessionId: string, 
    data: {
      student_name: string;
      answers: Record<string, string>;  // ← THIS is the key change!
      is_guest: boolean;
    }
  ) => {
    const response = await fetch(
      `${API_BASE_URL}/sessions/${sessionId}/submit`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }
    );
    if (!response.ok) throw new Error('Could not submit survey');
    return response.json();
  }
};