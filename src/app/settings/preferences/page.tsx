import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Preferences - Dashboard',
  description: 'Manage your user preferences',
};

export default function PreferencesPage() {
  return (
    <div className="space-y-6">
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Preferences</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="language">
              Language
            </label>
            <select
              id="language"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="en">English</option>
              <option value="fr">French</option>
              <option value="es">Spanish</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="timezone">
              Timezone
            </label>
            <select
              id="timezone"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="UTC">UTC</option>
              <option value="EST">Eastern Time</option>
              <option value="PST">Pacific Time</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="darkMode"
              className="rounded focus:ring-2 focus:ring-blue-500"
            />
            <label className="text-sm font-medium" htmlFor="darkMode">
              Enable Dark Mode
            </label>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Preferences
          </button>
        </form>
      </div>
    </div>
  );
}
