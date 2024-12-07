import React, { useState, useEffect } from 'react';
import { StyleSheet, ActivityIndicator, View, Text } from 'react-native';
import WebView from 'react-native-webview';
import { API_URL } from '../.expo/config/api';

const MapScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pre-fetch the data before injecting it into the WebView
  const [stationsData, setStationsData] = useState<string>('[]');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Convert the data to a string to safely inject it into HTML
        setStationsData(JSON.stringify(data.stations || []));
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const mapHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link href="https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.css" rel="stylesheet">
        <script src="https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.js"></script>
        <style>
            body { margin: 0; padding: 0; }
            #map { position: absolute; top: 0; bottom: 0; width: 100%; }
            .mapboxgl-popup { max-width: 400px; }
            .parameter-row { display: flex; justify-content: space-between; padding: 4px 0; }
            .parameter-name { color: #666; }
            .parameter-value { font-weight: 500; }
            .error-container { 
                position: absolute; 
                top: 50%; 
                left: 50%; 
                transform: translate(-50%, -50%);
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                z-index: 1000;
            }
        </style>
    </head>
    <body>
    <div id="map"></div>
    <script>
        // Inject the pre-fetched data directly
        const stations = ${stationsData};
        
        mapboxgl.accessToken = 'pk.eyJ1Ijoic2lkZDIwMDMiLCJhIjoiY2xwNTZwaGZhMWY2NjJpcGJoYTg0eG1oZiJ9.Qg2DOZAG_SetSi0Cu2GgFQ';
        
        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [82.9739, 25.5877],
            zoom: 6
        });

        function formatValue(value, paramName) {
            if (value === null || value === undefined) return 'N/A';
            
            const units = {
                'Water Temperature': '°C',
                'Depth': 'm',
                'Conductivity': 'µS/cm',
                'Water Turbidity': 'NTU',
                'River Stage': 'm',
                'Nitrate': 'mg/L',
                'Chloride': 'mg/L',
                'Oxygen, dissolved': 'mg/L',
                'Chemical Oxygen Demand': 'mg/L',
                'Biochemical Oxygen Demand': 'mg/L',
                'Total Organic Carbon': 'mg/L'
            };
            return \`\${Number(value).toFixed(2)}\${units[paramName] ? ' ' + units[paramName] : ''}\`;
        }

        function createPopupContent(station) {
            const content = document.createElement('div');
            content.innerHTML = \`
                <h3 style="margin: 0 0 10px 0; font-size: 16px;">\${station.name || 'Unnamed Station'}</h3>
                <p style="margin: 0 0 10px 0; color: #666;">ID: \${station.station_id || 'N/A'}</p>
                <div style="max-height: 300px; overflow-y: auto;">
                    \${(station.parameters || []).map(param => \`
                        <div class="parameter-row">
                            <span class="parameter-name">\${param.name || 'Unknown Parameter'}:</span>
                            <span class="parameter-value">\${formatValue(param.value, param.name)}</span>
                        </div>
                    \`).join('')}
                </div>
            \`;
            return content;
        }

        map.on('load', () => {
            if (!Array.isArray(stations)) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-container';
                errorDiv.textContent = 'Error: Invalid station data received';
                document.body.appendChild(errorDiv);
                return;
            }

            stations.forEach(station => {
                if (!station.location?.latitude || !station.location?.longitude) {
                    console.warn('Invalid location data for station:', station.station_id);
                    return;
                }

                new mapboxgl.Marker({
                    color: '#2196F3'
                })
                .setLngLat([station.location.longitude, station.location.latitude])
                .setPopup(
                    new mapboxgl.Popup({ offset: 25 })
                        .setDOMContent(createPopupContent(station))
                )
                .addTo(map);
            });
        });
    </script>
    </body>
    </html>
  `;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <WebView
      style={styles.container}
      source={{ html: mapHTML }}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      onError={(syntheticEvent) => {
        const { nativeEvent } = syntheticEvent;
        console.warn('WebView error:', nativeEvent);
        setError('Failed to load map');
      }}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
});

export default MapScreen;