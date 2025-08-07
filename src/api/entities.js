// Clean API implementation without Base44
import { mockAuth, mockChampionAPI } from './mockAuth';
import { realAuth, realChampionAPI } from './realAuth';

// Use environment variable to switch between mock and real API
// Set VITE_USE_MOCK_API=false in .env to use real backend
const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false';

export const Champion = USE_MOCK ? mockChampionAPI : realChampionAPI;
export const User = USE_MOCK ? mockAuth : realAuth;

// Placeholder for future UserICP implementation
export const UserICP = {
  create: async (data) => {
    console.log('UserICP.create', data);
    return { id: 'mock-icp', ...data };
  },
  get: async (id) => {
    console.log('UserICP.get', id);
    return { id, title: 'Mock ICP' };
  }
};