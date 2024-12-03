import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface BottomNavigationProps {
  currentRoute: string;
  onRouteChange: (route: string) => void;
}

interface NavItem {
  route: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { route: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { route: 'forecast', label: 'Forecast', icon: 'assessment' },
  { route: 'satellite', label: 'Satellite', icon: 'satellite' },
  { route: 'map', label: 'Map', icon: 'map' }
];

const BottomNavigation: React.FC<BottomNavigationProps> = ({ 
  currentRoute, 
  onRouteChange 
}) => {
  const isActive = (route: string) => currentRoute === route;

  const renderNavItem = ({ route, label, icon }: NavItem) => (
    <TouchableOpacity
      key={route}
      style={[styles.tab, isActive(route) && styles.activeTab]}
      onPress={() => onRouteChange(route)}
      activeOpacity={0.7}
    >
      <View style={styles.tabContent}>
        <Icon 
          name={icon} 
          size={24} 
          color={isActive(route) ? '#003366' : '#666'} 
          style={styles.icon}
        />
        <Text style={[
          styles.tabText, 
          isActive(route) && styles.activeText
        ]}>
          {label}
        </Text>
      </View>
      {isActive(route) && <View style={styles.activeIndicator} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {NAV_ITEMS.map(renderNavItem)}
      </View>
      {Platform.OS === 'ios' && <View style={styles.bottomSafeArea} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  content: {
    flexDirection: 'row',
    height: 60,
  },
  bottomSafeArea: {
    height: Platform.OS === 'ios' ? 20 : 0,
    backgroundColor: 'white',
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: 'rgba(0, 51, 102, 0.05)',
  },
  icon: {
    marginBottom: 4,
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  activeText: {
    color: '#003366',
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#003366',
    borderRadius: 1.5,
  },
});

export default BottomNavigation;