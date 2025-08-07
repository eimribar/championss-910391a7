// API Client for backend communication

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

class APIClient {
  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  // Set auth token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  // Get headers
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const config = {
      ...options,
      headers: this.getHeaders(options.includeAuth !== false),
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Auth methods
  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
      includeAuth: false,
    });

    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      includeAuth: false,
    });

    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  async logout() {
    await this.request('/auth/logout', {
      method: 'POST',
    });
    this.setToken(null);
  }

  async getMe() {
    return await this.request('/auth/me');
  }

  // Champion methods
  async getChampions(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/champions${queryString ? `?${queryString}` : ''}`);
  }

  async getChampionStats() {
    return await this.request('/champions/stats');
  }

  async getChampion(id) {
    return await this.request(`/champions/${id}`);
  }

  async createChampion(championData) {
    return await this.request('/champions', {
      method: 'POST',
      body: JSON.stringify(championData),
    });
  }

  async updateChampion(id, updates) {
    return await this.request(`/champions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteChampion(id) {
    return await this.request(`/champions/${id}`, {
      method: 'DELETE',
    });
  }

  async bulkCreateChampions(champions) {
    return await this.request('/champions/bulk', {
      method: 'POST',
      body: JSON.stringify({ champions }),
    });
  }

  // User methods
  async getUserProfile() {
    return await this.request('/users/profile');
  }

  async updateUserProfile(updates) {
    return await this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async completeOnboarding() {
    return await this.request('/users/onboarding', {
      method: 'PUT',
    });
  }

  // Scraping methods
  async scrapeLinkedIn(linkedinUrl) {
    return await this.request('/scraping/linkedin', {
      method: 'POST',
      body: JSON.stringify({ linkedinUrl }),
    });
  }

  async checkChanges() {
    return await this.request('/scraping/check-changes', {
      method: 'POST',
    });
  }

  async enrichChampion(championId) {
    return await this.request(`/scraping/enrich/${championId}`, {
      method: 'POST',
    });
  }
}

// Create and export singleton instance
const apiClient = new APIClient();
export default apiClient;