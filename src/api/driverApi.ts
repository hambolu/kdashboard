import { API_URL } from '@/config';

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = async (
  url: string,
  options: RequestInit,
  retryCount = 0
): Promise<Response> => {
  try {
    const response = await fetch(url, options);
    
    if (response.status === 429) {
      if (retryCount < MAX_RETRIES) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
        await wait(delay);
        return fetchWithRetry(url, options, retryCount + 1);
      }
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    return response;
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
      await wait(delay);
      return fetchWithRetry(url, options, retryCount + 1);
    }
    throw error;
  }
};

export interface Driver {
  id: number;
  user_id: number;
  is_available: boolean;
  is_approved: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  rejection_reason?: string;
  suspension_reason?: string;
  driver_category_id?: number;
  rating?: number;
  user: {
    id: number;
    name: string;
    email: string;
    phone_number: string;
    avatar_url?: string;
  };
  category?: {
    id: number;
    name: string;
    description: string;
  };
  created_at: string;
  updated_at: string;
}

export interface DriverStats {
  total_drivers: number;
  active_drivers: number;
  approved_drivers: number;
  pending_drivers: number;
  suspended_drivers: number;
}

export interface DriverCategory {
  id: number;
  name: string;
  description: string;
  base_fare: number;
  price_per_km: number;
  price_per_minute: number;
  icon?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const driverApi = {
  // Get all drivers with pagination and filters
  async getAllDrivers(params?: {
    per_page?: number;
    page?: number;
    search?: string;
    order_by?: string;
    order?: 'asc' | 'desc';
    status?: 'pending' | 'approved' | 'rejected' | 'suspended';
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });
    }

    const response = await fetchWithRetry(
      `${API_URL}/api/v1/admin/drivers?${queryParams.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      throw new Error('Failed to fetch drivers');
    }

    return response.json();
  },

  // Get a specific driver
  async getDriver(id: number) {
    const response = await fetchWithRetry(
      `${API_URL}/api/v1/admin/drivers/${id}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      throw new Error('Failed to fetch driver details');
    }

    return response.json();
  },

  // Update a driver
  async updateDriver(id: number, data: Partial<Driver>) {
    const response = await fetchWithRetry(
      `${API_URL}/api/v1/admin/drivers/${id}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      throw new Error('Failed to update driver');
    }

    return response.json();
  },

  // Approve a driver
  async approveDriver(id: number) {
    const response = await fetchWithRetry(
      `${API_URL}/api/v1/admin/drivers/${id}/approve`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      throw new Error('Failed to approve driver');
    }

    return response.json();
  },

  // Reject a driver
  async rejectDriver(id: number, reason: string) {
    const response = await fetchWithRetry(
      `${API_URL}/api/v1/admin/drivers/${id}/reject`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ reason }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      throw new Error('Failed to reject driver');
    }

    return response.json();
  },

  // Suspend a driver
  async suspendDriver(id: number, reason: string) {
    const response = await fetchWithRetry(
      `${API_URL}/api/v1/admin/drivers/${id}/suspend`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ reason }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      throw new Error('Failed to suspend driver');
    }

    return response.json();
  },

  // Get driver statistics
  async getDriverStatistics() {
    const response = await fetchWithRetry(
      `${API_URL}/api/v1/admin/drivers-statistics`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      throw new Error('Failed to fetch driver statistics');
    }

    return response.json();
  },

  // Get all driver categories
  async getAllCategories() {
    const response = await fetchWithRetry(
      `${API_URL}/api/v1/admin/driver-categories`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      throw new Error('Failed to fetch driver categories');
    }

    return response.json();
  },

  // Update driver category
  async updateDriverCategory(driverId: number, categoryId: number) {
    const response = await fetchWithRetry(
      `${API_URL}/api/v1/admin/drivers/${driverId}/category`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ category_id: categoryId }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      throw new Error('Failed to update driver category');
    }

    return response.json();
  },
};
