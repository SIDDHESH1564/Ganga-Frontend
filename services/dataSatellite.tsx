// api.ts
const BASE_URL = 'http://192.168.29.123:8000'; // Replace with your actual API base URL

// Define the parameter structure for satellite data
interface SatelliteParameters {
  ndvi: number;   // Normalized Difference Vegetation Index
  ndwi: number;   // Normalized Difference Water Index
  ndbi: number;   // Normalized Difference Built-up Index
}

// Define the data point structure
interface SatelliteDataPoint {
  timestamp: string;
  parameters: SatelliteParameters;
}

// Define the main response structure
export interface SatelliteApiResponse {
  station_id: string;
  station_name: string;
  latitude: number;
  longitude: number;
  historical_data: SatelliteDataPoint[];
  forecast_data: SatelliteDataPoint[];
}

/**
 * Fetches satellite forecast data for a specific station
 * @param stationId - The ID of the station to fetch data for
 * @returns Promise containing the satellite forecast data
 */
export const fetchSatelliteForecasts = async (stationId: string): Promise<SatelliteApiResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/dashboard/satellite_forecasts/${stationId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: SatelliteApiResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching satellite forecast data:', error);
    throw error;
  }
};

// Example usage:
/*
const getSatelliteData = async () => {
  try {
    const satelliteData = await fetchSatelliteForecasts('UT67');
    console.log('Station Name:', satelliteData.station_name);
    console.log('Latest NDVI:', satelliteData.historical_data[0].parameters.ndvi);
  } catch (error) {
    console.error('Failed to fetch satellite data:', error);
  }
};
*/