import axios from 'axios';

export interface CurrentConditions {
  airTemp: number;
  waterTemp: number;
  windSpeed: number;
  windDirection: number;
  tideType: string;
  weatherCode: number;
  waveHeight: number;
}

export const WeatherService = {
  getCurrentConditions: async (lat: number, lng: number): Promise<CurrentConditions> => {
    // Current hour in ISO format: YYYY-MM-DDTHH:00
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const hourStr = `${dateStr}T${now.getHours().toString().padStart(2, '0')}:00`;

    try {
      // 1. Weather API (Air Temp, Wind)
      const weatherPromise = axios.get('https://api.open-meteo.com/v1/forecast', {
        params: {
          latitude: lat,
          longitude: lng,
          hourly: 'temperature_2m,windspeed_10m,winddirection_10m,weathercode',
          timezone: 'auto',
          start_date: dateStr,
          end_date: dateStr,
        }
      });

      // 2. Marine API (Water Temp, Tide/Sea Level, Waves)
      const marinePromise = axios.get('https://marine-api.open-meteo.com/v1/marine', {
        params: {
          latitude: lat,
          longitude: lng,
          hourly: 'sea_surface_temperature,sea_level_height_msl,wave_height',
          timezone: 'auto',
          start_date: dateStr,
          end_date: dateStr,
        }
      });

      const [weatherRes, marineRes] = await Promise.all([weatherPromise, marinePromise]);
      
      const weatherData = weatherRes.data;
      const marineData = marineRes.data;

      const hourlyTimes = weatherData.hourly.time;
      const timeIndex = hourlyTimes.indexOf(hourStr) !== -1 ? hourlyTimes.indexOf(hourStr) : 0;

      const getVal = (data: { hourly: Record<string, any> }, key: string) => data.hourly[key][timeIndex];

      // Enhanced Tide logic: Determine trend (Rising/Falling) and peak status
      const seaLevels: number[] = marineData.hourly.sea_level_height_msl;
      const currentLevel = seaLevels[timeIndex];
      const prevLevel = timeIndex > 0 ? seaLevels[timeIndex - 1] : seaLevels[0];
      const maxLevel = Math.max(...seaLevels);
      const minLevel = Math.min(...seaLevels);

      let tideType = 'Stable';
      
      // Determine trend
      if (currentLevel > prevLevel + 0.005) {
        tideType = 'Rising';
      } else if (currentLevel < prevLevel - 0.005) {
        tideType = 'Falling';
      }

      // Check for peaks (High/Low) - within 5cm of daily extreme
      if (Math.abs(currentLevel - maxLevel) < 0.05) {
        tideType = 'High Tide';
      } else if (Math.abs(currentLevel - minLevel) < 0.05) {
        tideType = 'Low Tide';
      }

      return {
        airTemp: getVal(weatherData, 'temperature_2m'),
        windSpeed: getVal(weatherData, 'windspeed_10m'),
        windDirection: getVal(weatherData, 'winddirection_10m'),
        weatherCode: getVal(weatherData, 'weathercode'),
        waterTemp: getVal(marineData, 'sea_surface_temperature'),
        waveHeight: getVal(marineData, 'wave_height'),
        tideType
      };
    } catch (err) {
      console.error('Failed to fetch weather/marine data', err);
      throw new Error('Sea conditions unavailable.');
    }
  }
};
