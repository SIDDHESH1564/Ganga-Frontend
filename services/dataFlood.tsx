export const DataFlood = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/flood-observatory/data`, {
        method: 'GET', 
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });    
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const dataflood = await response.json();

      return dataflood;
    } catch (error) {
      return error;
    }
  };