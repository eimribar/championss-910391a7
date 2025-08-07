// Mock authentication for development
export const mockUser = {
  id: 'mock-user-123',
  email: 'user@example.com',
  full_name: 'John Doe',
  onboarding_completed: true,
  created_at: new Date().toISOString()
};

export const mockAuth = {
  me: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Check if user is "logged in" (using localStorage for mock)
    const isLoggedIn = localStorage.getItem('mock_logged_in') === 'true';
    
    if (!isLoggedIn) {
      throw new Error('Not authenticated');
    }
    
    return mockUser;
  },
  
  login: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Set mock login state
    localStorage.setItem('mock_logged_in', 'true');
    
    return mockUser;
  },
  
  logout: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Clear mock login state
    localStorage.removeItem('mock_logged_in');
    localStorage.removeItem('mock_champions');
  }
};

// Mock Champions data
export const mockChampions = [
  {
    id: 'champ-1',
    name: 'Sarah Johnson',
    linkedin_url: 'https://linkedin.com/in/sarahjohnson',
    current_company: 'TechCorp',
    current_title: 'VP of Sales',
    previous_company: 'StartupXYZ',
    previous_title: 'Director of Sales',
    job_change_status: 'new_change_detected',
    change_detected_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    is_recent_job_change: true,
    created_by: mockUser.email,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'champ-2',
    name: 'Michael Chen',
    linkedin_url: 'https://linkedin.com/in/michaelchen',
    current_company: 'CloudBase Inc',
    current_title: 'Engineering Manager',
    previous_company: 'DataFlow Systems',
    previous_title: 'Senior Engineer',
    job_change_status: 'changed',
    change_detected_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    is_recent_job_change: true,
    created_by: mockUser.email,
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'champ-3',
    name: 'Emily Rodriguez',
    linkedin_url: 'https://linkedin.com/in/emilyrodriguez',
    current_company: 'MarketPro',
    current_title: 'CMO',
    job_change_status: 'monitoring',
    is_recent_job_change: false,
    created_by: mockUser.email,
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const mockChampionAPI = {
  filter: async (filters, sort) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Get champions from localStorage or use defaults
    const stored = localStorage.getItem('mock_champions');
    const champions = stored ? JSON.parse(stored) : mockChampions;
    
    // Simple filter implementation
    let filtered = champions;
    if (filters.created_by) {
      filtered = filtered.filter(c => c.created_by === filters.created_by);
    }
    
    return filtered;
  },
  
  create: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newChampion = {
      id: `champ-${Date.now()}`,
      ...data,
      job_change_status: 'monitoring',
      is_recent_job_change: false,
      created_by: mockUser.email,
      created_at: new Date().toISOString()
    };
    
    // Get existing champions
    const stored = localStorage.getItem('mock_champions');
    const champions = stored ? JSON.parse(stored) : mockChampions;
    
    // Add new champion
    champions.push(newChampion);
    localStorage.setItem('mock_champions', JSON.stringify(champions));
    
    return newChampion;
  },
  
  update: async (id, data) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Get existing champions
    const stored = localStorage.getItem('mock_champions');
    const champions = stored ? JSON.parse(stored) : mockChampions;
    
    // Update champion
    const index = champions.findIndex(c => c.id === id);
    if (index !== -1) {
      champions[index] = { ...champions[index], ...data };
      localStorage.setItem('mock_champions', JSON.stringify(champions));
      return champions[index];
    }
    
    throw new Error('Champion not found');
  },
  
  delete: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Get existing champions
    const stored = localStorage.getItem('mock_champions');
    const champions = stored ? JSON.parse(stored) : mockChampions;
    
    // Remove champion
    const filtered = champions.filter(c => c.id !== id);
    localStorage.setItem('mock_champions', JSON.stringify(filtered));
    
    return { success: true };
  },
  
  get: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Get existing champions
    const stored = localStorage.getItem('mock_champions');
    const champions = stored ? JSON.parse(stored) : mockChampions;
    
    const champion = champions.find(c => c.id === id);
    if (champion) {
      return champion;
    }
    
    throw new Error('Champion not found');
  }
};