import axios from 'axios';
import { API_URL } from '@/config';

export type SettingGroupType = 'general' | 'api' | 'email' | 'payment' | 'driver' | 'security';

export type GroupedSettings = {
  [key in SettingGroupType]?: Record<string, string | number | boolean>;
};

export interface SettingValue {
  key: string;
  value: string | number | boolean;
  type: SettingGroupType;
}

export interface SettingsUpdatePayload {
  [key: string]: string | number | boolean;
}

interface ApiResponse<T> {
  data: T;
  message: string;
}

// Create axios instance
const api = axios.create({
  baseURL: API_URL
});

// Add request interceptor to add bearer token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      if (!config.headers) {
        config.headers = {};
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const settingsApi = {
  // Get all settings grouped by type
  getAllSettings: async (): Promise<GroupedSettings> => {
    const response = await api.get<ApiResponse<{data: GroupedSettings}>>('/api/v1/admin/settings');
    return response.data.data.data;
  },

  // Get a specific setting
  getSetting: async (key: string): Promise<SettingValue> => {
    const response = await api.get<ApiResponse<SettingValue>>(`/api/v1/admin/settings/${key}`);
    return response.data.data;
  },

  // Create new setting
  createSetting: async (setting: SettingValue): Promise<SettingValue> => {
    const response = await api.post<ApiResponse<SettingValue>>('/api/v1/admin/settings', setting);
    return response.data.data;
  },

  // Update a single setting
  updateSetting: async (key: string, value: string | number | boolean, type?: SettingGroupType): Promise<SettingValue> => {
    const response = await api.put<ApiResponse<SettingValue>>(`/api/v1/admin/settings/${key}`, { value, type });
    return response.data.data;
  },

  // Update multiple settings at once
  updateMultipleSettings: async (settings: SettingsUpdatePayload): Promise<SettingValue[]> => {
    const response = await api.put<ApiResponse<SettingValue[]>>('/api/v1/admin/settings/bulk', settings);
    return response.data.data;
  },

  // Delete a setting
  deleteSetting: async (key: string): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/api/v1/admin/settings/${key}`);
  }
};
