// api.ts
const BASE_URL = 'http://192.168.29.123:8000'; // Replace with your actual API base URL

export interface ApiResponse {
  station_id: string;
  station_name: string;
  latitude: number;
  longitude: number;
  historical_data: DataPoint[];
  forecast_data: DataPoint[];
}

interface DataPoint {
  timestamp: string;
  parameters: Parameter[];
  wqi: number;
  status: string;
}

interface Parameter {
  name: string;
  value: number;
  is_anomaly: boolean;
  normal_range: [number, number];
}

export const fetchforecastData = async (stationId: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/dashboard/parameter_forecasts/${stationId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching station data:', error);
    throw error;
  }
};
