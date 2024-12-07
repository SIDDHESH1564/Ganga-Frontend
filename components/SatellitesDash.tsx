import React, { useState, useEffect } from 'react';
import { fetchSatelliteForecasts } from '../services/dataSatellite';
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
import { DataFlood } from '../services/dataFlood'

// Types remain the same...
interface SatelliteParameters {
  ndvi: number;
  ndwi: number;
  ndbi: number;
}

interface SatelliteDataPoint {
  timestamp: string;
  parameters: SatelliteParameters;
}

interface ParameterCardProps {
  label: string;
  value: string | number | null;
}



const screenWidth = Dimensions.get('window').width;

const STATION_IDS = [
  "UT67", "UT62", "JH83", "WB88", "UT68", "WB85", "UT64", "HR56",
  "WB87", "UT57", "BH79", "UT61", "BH72", "WB89", "UK54", "UT69",
  "JH82", "WB90", "UT65", "UK52", "BH76", "BH81", "BH74", "UT71",
  "BH80", "UT60", "BH75", "WB86", "UK55", "BH77", "JH84", "BH78",
  "UK53", "BH73", "UT70", "UT63"
];

const PARAMETERS = {
  ndvi: {
    label: "Normalized Difference Vegetation Index",
    color: "rgb(76, 175, 80)", // Green
    shortLabel: "NDVI"
  },
  ndwi: {
    label: "Normalized Difference Water Index",
    color: "rgb(33, 150, 243)", // Blue
    shortLabel: "NDWI"
  },
  ndbi: {
    label: "Normalized Difference Built-up Index",
    color: "rgb(255, 152, 0)", // Orange
    shortLabel: "NDBI"
  }
};


const SatelliteMonitoringApp = () => {
  const [selectedStation, setSelectedStation] = useState<string>("UT67");
  const [stationData, setStationData] = useState<{ timestamp: string;[key: string]: number | string }[]>([]);
  const [showStationPicker, setShowStationPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataflood, setDataflood] = useState<any>(null);
  // const [status, setStatus] = useState<string | null>(null);
 

  

  useEffect(() => {
    const fetchDataflood = async () => {
      setIsLoading(true);
      try {
        const fetchedfloodData = await DataFlood();
        if (fetchedfloodData) {
          setDataflood(fetchedfloodData);
        } else {
          setError('Failed to fetch flood data.');
        }
      } catch (err) {
        console.error('Error fetching flood data:', err);
        setError('An error occurred while fetching the flood data.');
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchDataflood();
  }, []);



  const fetchData = async (stationId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchSatelliteForecasts(stationId);
      const combinedData = [
        ...data.historical_data,
        ...data.forecast_data
      ];

      const transformedData = combinedData.map(entry => ({
        timestamp: entry.timestamp,
        ndvi: entry.parameters.ndvi,
        ndwi: entry.parameters.ndwi,
        ndbi: entry.parameters.ndbi
      }));

      setStationData(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedStation);
  }, [selectedStation]);

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

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

  const renderCombinedChart = () => {
    if (stationData.length === 0) return null;

    const data = {
      labels: stationData.map(d => formatDate(d.timestamp)),
      datasets: Object.entries(PARAMETERS).map(([key, param]) => ({
        data: stationData.map(d => d[key] as number),
        color: (opacity = 1) => param.color,
        strokeWidth: 2
      }))
    };

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Combined Satellite Indices</Text>
        <LineChart
          data={data}
          width={screenWidth - 70}
          height={300}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 3,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16
            },
            propsForDots: {
              r: "4",
              strokeWidth: "2"
            }
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16
          }}
        />
        {/* Legend */}
        <View style={styles.legendContainer}>
          {Object.entries(PARAMETERS).map(([key, param]) => (
            <View key={key} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: param.color }]} />
              <Text style={styles.legendText}>{param.shortLabel}</Text>
            </View>
          ))}
        </View>
        {/* Parameter Descriptions */}
        <View style={styles.descriptionContainer}>
          {Object.entries(PARAMETERS).map(([key, param]) => (
            <Text key={key} style={styles.descriptionText}>
              {param.shortLabel}: {param.label}
            </Text>
          ))}
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
        <Text style={styles.title}>Satellite Monitoring</Text>
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
        {renderCombinedChart()}
        {!dataflood ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading parameters...</Text>
        </View>
      ) : (
        
        <View style={styles.parametersContainer}>
          <Text style={styles.sectionHeader}>Current Parameters</Text>
          <View style={styles.parametersGrid}>
            <ParameterCard label="Area ID (GFDS)" value={dataflood.gfds_area_id} />
            <ParameterCard label="Last Measured" value={dataflood.last_measured} />
            <ParameterCard label="Discharge in m^3/sec" value={dataflood.discharge.split(" ")[0]} />
            <ParameterCard label="Flood Magnitude (Scale of 1-10)" value={dataflood.flood_magnitude.split("")[0]} />
            <ParameterCard label="Status" value={dataflood.status} />
          </View>
        </View>
      )}
      </ScrollView>

    




      <StationPicker />
    </SafeAreaView>
  );
};
interface ParameterCardProps {
  label: string;
  value: string | number | null;
}

const ParameterCard: React.FC<ParameterCardProps> = ({ label, value }) => {
  const getStatusText = (value: string | number | null) => {
    if (label === "Status" && value !== null) {
      const status = Number(value);
      switch (status) {
        case 1:
          return "Low";
        case 2:
          return "Normal flow";
        case 3:
          return "Moderate flow";
        case 4:
          return "Major flow";
        default:
          return "Unknown status";
      }
    }
    return value !== null && value !== undefined ? String(value) : 'N/A';
  };

  return (
    <View style={styles.parameterCard}>
      <Text style={styles.parameterLabel}>{label}</Text>
      <Text style={styles.parameterValue}>
        {getStatusText(value)}
      </Text>
    </View>
  );
};

// const ParameterCard: React.FC<ParameterCardProps> = ({ label, value }) => (
//   <View style={styles.parameterCard}>
//     <Text style={styles.parameterLabel}>{label}</Text>
//     <Text style={styles.parameterValue}>
//       {value !== null && value !== undefined ? String(value) : 'N/A'}
//     </Text>
//   </View>
// );

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
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingVertical: 12,
    marginHorizontal: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'white',
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  legendText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  descriptionContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  descriptionText: {
    fontSize: 13,
    color: '#495057',
    marginBottom: 8,
    lineHeight: 18,
  },
  parametersContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  parametersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  parameterCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  parameterLabel: {
    fontSize: 16,
    color: '#666',
  },
  parameterValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

export default SatelliteMonitoringApp;