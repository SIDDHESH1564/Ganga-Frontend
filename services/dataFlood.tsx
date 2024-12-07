export const DataFlood = async () => {
    try {
      const response = await fetch('http://192.168.29.123:8000/flood-observatory/data', {
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