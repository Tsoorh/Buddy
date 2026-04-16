export interface UserLocation {
  lat: number;
  lng: number;
  name: string;
}

const LOCATION_KEY = 'sff_base_location';

export const UserSettingsService = {
  getLocalLocation: (): UserLocation | null => {
    const stored = localStorage.getItem(LOCATION_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch (err) {
      console.error('Failed to parse base location from localStorage', err);
      return null;
    }
  },

  setLocalLocation: (location: UserLocation) => {
    localStorage.setItem(LOCATION_KEY, JSON.stringify(location));
  },

  clearLocalLocation: () => {
    localStorage.removeItem(LOCATION_KEY);
  }
};
