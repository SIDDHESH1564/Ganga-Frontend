import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { loadWaterQualityData } from '../services/dataService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const WaterQualityCarousel: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const fetchedData = await loadWaterQualityData(); // Fixed here
        // console.log(fetchedData);
        if (fetchedData) {
          setData(fetchedData);
        } else {
          setError('Failed to fetch water quality data.');
        }
      } catch (err) {
        setError('An error occurred while fetching the data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No data available.</Text>
      </View>
    );
  }

  const stations = data.predictions;

  const getRequiredParameters = (stationData: any) => {
    const parameters = {
      pH: stationData.parameters_used?.ph ?? 0,
      turbidity: stationData.parameters_used?.turbidity ?? 0,
      conductivity: stationData.parameters_used?.conductivity ?? 0,
      dissolvedOxygen: stationData.parameters_used?.oxygen_dissolved ?? 0,
      temperature: stationData.parameters_used?.water_temperature ?? 0,
      wqi: stationData.wqi ?? 0,

    };
    return parameters;
  };


  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        {stations.map((station: { name: string; }, index: React.Key | null | undefined) => {
          const params = getRequiredParameters(station);
          let status: string;
          if (Number(params.wqi) >= 75) {
            status = 'Good';
          } else if (Number(params.wqi) >= 40) {
            status = 'Moderate';
          } else {
            status = 'Poor';
          }
          return (
            <View key={index} style={styles.slide}>
              <View style={styles.statusContainer}>
                <View style={styles.headerRow}>
                  <View style={styles.stationContainer}>
                    <Text style={styles.stationLabel}>Station Name</Text>
                    <Text style={styles.stationValue}>
                      {station.name.split('_')[1]}
                    </Text>
                  </View>
                  <View style={styles.qualityContainer}>
                    <Text style={styles.qualityLabel}>Water Quality Index</Text>
                    <Text style={[
                      styles.qualityScore,
                      { color: status === 'Good' ? '#34C759' : '#FF3B30' }
                    ]}>
                      {params.wqi}
                    </Text>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: status === 'Good' ? '#34C759' : '#FF3B30' }
                    ]}>
                      <Text style={styles.statusText}>{status}</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.parametersContainer}>
                <Text style={styles.sectionHeader}>Current Parameters</Text>
                <View style={styles.parametersGrid}>
                  <ParameterCard label="pH" value={params.pH.toFixed(2)} />
                  <ParameterCard label="Turbidity" value={params.turbidity.toFixed(2)} />
                  <ParameterCard label="Conductivity" value={params.conductivity.toFixed(2)} />
                  <ParameterCard label="Dissolved Oxygen" value={params.dissolvedOxygen.toFixed(2)} />
                  <ParameterCard label="Temperature" value={params.temperature.toFixed(2)} />
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

interface ParameterCardProps {
  label: string;
  value: string;
}

const ParameterCard: React.FC<ParameterCardProps> = ({ label, value }) => (
  <View style={styles.parameterCard}>
    <Text style={styles.parameterLabel}>{label}</Text>
    <Text style={styles.parameterValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    width: SCREEN_WIDTH,
    padding: 16,
  },
  statusContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  stationContainer: {
    flex: 1,
  },
  stationLabel: {
    fontSize: 16,
    color: '#666',
  },
  stationValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  qualityContainer: {
    alignItems: 'flex-end',
  },
  qualityScore: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  qualityLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  statusText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: '#007AFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#FF3B30',
    textAlign: 'center',
  },
});

export default WaterQualityCarousel;
