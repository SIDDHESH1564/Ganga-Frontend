import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, StyleSheet, Platform } from 'react-native';
import WaterQualityCarousel from '@/components/Dashboard';
import BottomNavigation from '../components/BottomNavigation';
import ForecastScreen from '@/components/Forecast';
import MapDashboard from '../components/MapDashboard';
import SplashScreen from '@/components/SplashScreen';
import SatelliteMonitoringApp from '@/components/SatellitesDash';

interface Route {
  key: string;
  component: React.ComponentType;
}

const ROUTES: Record<string, Route> = {
  dashboard: {
    key: 'dashboard',
    component: WaterQualityCarousel,
  },
  forecast: {
    key: 'forecast',
    component: ForecastScreen,
  },
  satellite: {
    key: 'satellite',
    component: SatelliteMonitoringApp,
  },
  map: {
    key: 'map',
    component: MapDashboard,
  },
};

function App(): JSX.Element {
  const [currentRoute, setCurrentRoute] = useState('dashboard');
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Simulate any initialization tasks
    const initializeApp = async () => {
      try {
        // Add any initialization logic here
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulated delay
        setIsInitialized(true);
      } catch (error) {
        console.error('Initialization failed:', error);
        // Handle initialization error
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    if (isInitialized) {
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 500); // Fade out delay after initialization

      return () => clearTimeout(timer);
    }
  }, [isInitialized]);

  const handleRouteChange = (route: string) => {
    setCurrentRoute(route);
  };

  if (showSplash || !isInitialized) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  const CurrentComponent = ROUTES[currentRoute]?.component || ROUTES.dashboard.component;

  return (
    <SafeAreaView style={styles.container}>
      <View style={[
        styles.content,
        Platform.OS === 'ios' && styles.iosContent
      ]}>
        <CurrentComponent />
      </View>
      <BottomNavigation 
        currentRoute={currentRoute}
        onRouteChange={handleRouteChange}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    marginBottom: 60, // Height of bottom navigation
  },
  iosContent: {
    marginBottom: 80, // Additional space for iOS home indicator
  },
  placeholder: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default App;