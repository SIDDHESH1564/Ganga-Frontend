import React, { useState, useEffect } from 'react';
import { fetchforecastData } from '../services/dataForecast';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

// Types
interface Parameter {
  name: string;
  value: number;
  is_anomaly: boolean;
  normal_range: [number, number];
}

interface DataPoint {
  timestamp: string;
  parameters: Parameter[];
  wqi: number;
  status: string;
}

interface StationData {
  station_id: string;
  station_name: string;
  latitude: number;
  longitude: number;
  historical_data: DataPoint[];
  forecast_data: DataPoint[];
}

const screenWidth = Dimensions.get('window').width;

const STATION_IDS = [
  "UT67", "UT62", "JH83", "WB88", "UT68", "WB85", "UT64", "HR56",
  "WB87", "UT57", "BH79", "UT61", "BH72", "WB89", "UK54", "UT69",
  "JH82", "WB90", "UT65", "UK52", "BH76", "BH81", "BH74", "UT71",
  "BH80", "UT60", "BH75", "WB86", "UK55", "BH77", "JH84", "BH78",
  "UK53", "BH73", "UT70", "UT63"
];

const WaterMonitoringApp = () => {
  const [selectedStation, setSelectedStation] = useState<string>("UT67");
  const [stationData, setStationData] = useState<{ timestamp: string; [key: string]: number | string }[]>([]);
  const [showStationPicker, setShowStationPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parameters, setParameters] = useState<{ name: string; normalRange: [number, number] }[]>([]);

  // Fetch data when station is selected
  const fetchData = async (stationId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchforecastData(stationId);
      console.log('Fetched data:', data);
      const combinedData = [
        ...data.historical_data,
        ...data.forecast_data
      ];
      
      const transformedData = combinedData.map(entry => ({
        timestamp: entry.timestamp,
        ...Object.fromEntries(
          entry.parameters.map(param => [param.name, param.value]),
        )
      })) as { timestamp: string; [key: string]: number | string }[];
      
      const uniqueParams = data.historical_data[0].parameters.map(param => ({
        name: param.name,
        normalRange: param.normal_range
      }));
      // console.log('Combine Data', combinedData);
      // console.log('tranformed data',transformedData);
      // console.log('parameters', uniqueParams);
      setParameters(uniqueParams);
      setStationData(transformedData);

      // console.log('parameters after', parameters);
      // console.log('stationData after', stationData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };
  // Effect to fetch data when station changes
  useEffect(() => {
    fetchData(selectedStation);
  }, [selectedStation]);

  // Station Picker Modal
  const StationPicker = () => (
    <Modal
      visible={showStationPicker}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalView}>
        <Text style={styles.modalTitle}>Select Station</Text>
        <FlatList
          data={STATION_IDS}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.stationItem}
              onPress={() => {
                setSelectedStation(item);
                setShowStationPicker(false);
              }}
            >
              <Text style={styles.stationItemText}>{item}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={item => item}
        />
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setShowStationPicker(false)}
        >
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );

  const renderChart = (param: { name: string; normalRange: [number, number] }) => {
    const data = {
      labels: stationData.map(d => formatDate(d.timestamp)),
      datasets: [{
        data: stationData.map(d => d[param.name]),
        color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
        strokeWidth: 2
      }]
    };
    // console.log('data', data);

    return (
      <View key={param.name} style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{param.name}</Text>
        <LineChart 
          data={data}
          width={screenWidth - 80}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16
            }
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16
          }}
        />
        <View style={styles.normalRangeContainer}>
          <Text style={styles.normalRangeText}>
            Normal Range: {param.normalRange[0]} - {param.normalRange[1]}
          </Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => fetchData(selectedStation)}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Water Quality Monitor</Text>
        <TouchableOpacity
          style={styles.stationSelector}
          onPress={() => setShowStationPicker(true)}
        >
          <Text style={styles.stationSelectorText}>
            Station: {selectedStation}
          </Text>
        </TouchableOpacity>
      </View>



      <ScrollView style={styles.content}>
        {parameters.map(param => renderChart(param))}
      </ScrollView>

      <Modal
        visible={showStationPicker}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Select Station</Text>
          <FlatList
            data={STATION_IDS}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.stationItem}
                onPress={() => {
                  setSelectedStation(item);
                  setShowStationPicker(false);
                }}
              >
                <Text style={styles.stationItemText}>{item}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={item => item}
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowStationPicker(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>



      <StationPicker />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  stationSelector: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
  stationSelectorText: {
    fontSize: 16,
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  normalRangeContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  normalRangeText: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff0000',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalView: {
    flex: 1,
    marginTop: 80,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  stationItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  stationItemText: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WaterMonitoringApp;