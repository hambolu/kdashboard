import { API_URL } from '@/config';
import { fetchWithRetry } from '@/utils/api';

export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  duration_days: number;
  features?: string;
  is_active: boolean;
  plan_code?: string;
  is_commission_plan?: boolean;
  created_at: string;
  updated_at: string;
}

export const subscriptionApi = {
  // Get all subscription plans
  async getAllPlans() {
    const response = await fetchWithRetry(
      `${API_URL}/api/v1/admin/subscription-plans`,
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
      throw new Error('Failed to fetch subscription plans');
    }

    return response.json();
  },

  // Get a specific subscription plan
  async getPlan(id: number) {
    const response = await fetchWithRetry(
      `${API_URL}/api/v1/admin/subscription-plans/${id}`,
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
      throw new Error('Failed to fetch subscription plan');
    }

    return response.json();
  },

  // Create a new subscription plan
  async createPlan(data: Omit<SubscriptionPlan, 'id' | 'created_at' | 'updated_at'>) {
    const response = await fetchWithRetry(
      `${API_URL}/api/v1/admin/subscription-plans`,
      {
        method: 'POST',
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
      throw new Error('Failed to create subscription plan');
    }

    return response.json();
  },

  // Update a subscription plan
  async updatePlan(id: number, data: Partial<Omit<SubscriptionPlan, 'id' | 'created_at' | 'updated_at'>>) {
    const response = await fetchWithRetry(
      `${API_URL}/api/v1/admin/subscription-plans/${id}`,
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
      throw new Error('Failed to update subscription plan');
    }

    return response.json();
  },

  // Delete a subscription plan
  async deletePlan(id: number) {
    const response = await fetchWithRetry(
      `${API_URL}/api/v1/admin/subscription-plans/${id}`,
      {
        method: 'DELETE',
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
      throw new Error('Failed to delete subscription plan');
    }

    return response.json();
  },

  // Toggle subscription plan status
  async togglePlanStatus(id: number) {
    const response = await fetchWithRetry(
      `${API_URL}/api/v1/admin/subscription-plans/${id}/toggle`,
      {
        method: 'PATCH',
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
      throw new Error('Failed to toggle subscription plan status');
    }

    return response.json();
  },
};
