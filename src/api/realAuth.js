// Real API implementation using the backend
import apiClient from './client';

export const realAuth = {
  me: async () => {
    try {
      const response = await apiClient.getMe();
      if (response.success && response.user) {
        // Transform to match frontend expectations
        return {
          id: response.user.id,
          email: response.user.email,
          full_name: response.user.fullName,
          company: response.user.company,
          onboarding_completed: response.user.onboardingCompleted,
          role: response.user.role,
          subscription: response.user.subscription,
          settings: response.user.settings
        };
      }
      throw new Error('Failed to get user');
    } catch (error) {
      throw error;
    }
  },

  login: async (email, password) => {
    try {
      const response = await apiClient.login(email, password);
      if (response.success && response.user) {
        return {
          id: response.user.id,
          email: response.user.email,
          full_name: response.user.fullName,
          company: response.user.company,
          onboarding_completed: response.user.onboardingCompleted
        };
      }
      throw new Error('Login failed');
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  register: async (userData) => {
    try {
      const response = await apiClient.register(userData);
      if (response.success && response.user) {
        return {
          id: response.user.id,
          email: response.user.email,
          full_name: response.user.fullName,
          company: response.user.company,
          onboarding_completed: response.user.onboardingCompleted
        };
      }
      throw new Error('Registration failed');
    } catch (error) {
      throw error;
    }
  }
};

export const realChampionAPI = {
  filter: async (filters = {}, sort = '-createdAt') => {
    try {
      const params = { ...filters, sortBy: sort };
      const response = await apiClient.getChampions(params);
      
      if (response.success && response.champions) {
        // Transform to match frontend expectations
        return response.champions.map(c => ({
          id: c._id,
          name: c.name,
          linkedin_url: c.linkedinUrl,
          email: c.email,
          current_company: c.currentCompany,
          current_title: c.currentTitle,
          previous_company: c.previousCompany,
          previous_title: c.previousTitle,
          job_change_status: c.jobChangeStatus,
          change_detected_at: c.changeDetectedAt,
          is_recent_job_change: c.isRecentJobChange,
          created_by: c.user,
          created_at: c.createdAt,
          notes: c.notes,
          tags: c.tags,
          relationship: c.relationship
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching champions:', error);
      return [];
    }
  },

  create: async (data) => {
    try {
      const championData = {
        name: data.name,
        linkedinUrl: data.linkedin_url,
        email: data.email,
        currentCompany: data.current_company,
        currentTitle: data.current_title,
        notes: data.notes,
        tags: data.tags,
        relationship: data.relationship
      };

      const response = await apiClient.createChampion(championData);
      
      if (response.success && response.champion) {
        return {
          id: response.champion._id,
          ...data,
          created_at: response.champion.createdAt
        };
      }
      throw new Error('Failed to create champion');
    } catch (error) {
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const updates = {};
      
      // Map frontend fields to backend fields
      if (data.job_change_status) updates.jobChangeStatus = data.job_change_status;
      if (data.notes) updates.notes = data.notes;
      if (data.tags) updates.tags = data.tags;
      if (data.relationship) updates.relationship = data.relationship;
      
      const response = await apiClient.updateChampion(id, updates);
      
      if (response.success) {
        return response.champion;
      }
      throw new Error('Failed to update champion');
    } catch (error) {
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await apiClient.deleteChampion(id);
      return response;
    } catch (error) {
      throw error;
    }
  },

  get: async (id) => {
    try {
      const response = await apiClient.getChampion(id);
      
      if (response.success && response.champion) {
        const c = response.champion;
        return {
          id: c._id,
          name: c.name,
          linkedin_url: c.linkedinUrl,
          email: c.email,
          current_company: c.currentCompany,
          current_title: c.currentTitle,
          previous_company: c.previousCompany,
          previous_title: c.previousTitle,
          job_change_status: c.jobChangeStatus,
          change_detected_at: c.changeDetectedAt,
          is_recent_job_change: c.isRecentJobChange,
          created_by: c.user,
          created_at: c.createdAt,
          notes: c.notes,
          tags: c.tags,
          relationship: c.relationship
        };
      }
      throw new Error('Champion not found');
    } catch (error) {
      throw error;
    }
  }
};