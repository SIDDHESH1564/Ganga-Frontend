export const loadWaterQualityData = async () => {
  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/water-quality/predict`, {
      method: 'GET', 
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    });    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // console.log('Data fetched:', data);
    return data;
  } catch (error) {
    // console.error('Error fetching data:', error);
    return error;
  }
};