import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ParameterDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedParameter, setSelectedParameter] = useState({
    id: '1',
    name: 'Water Quality Index'
  });

  const parameters = [
    { id: '1', name: 'Water Quality Index' },
    { id: '2', name: 'pH' },
    { id: '3', name: 'Turbidity' },
    { id: '4', name: 'Conductivity' },
    { id: '5', name: 'Dissolved Oxygen' },
    { id: '6', name: 'Temperature' }
  ];

  const toggleDropdown = () => setIsOpen(!isOpen);

  const selectParameter = (parameter: { id: string; name: string }) => {
    setSelectedParameter(parameter);
    setIsOpen(false);
  };

  return (
    <View style={[styles.container, { marginBottom: isOpen ? 150 : 16 }]}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={toggleDropdown}
        activeOpacity={0.7}
      >
        <Text style={styles.selectedText}>{selectedParameter.name}</Text>
        <Icon
          name={isOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
          size={24}
          color="#003366"
        />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdownList}>
          <FlatList
            data={parameters}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.dropdownItem,
                  selectedParameter.id === item.id && styles.selectedItem
                ]}
                onPress={() => selectParameter(item)}
              >
                <Text style={[
                  styles.dropdownItemText,
                  selectedParameter.id === item.id && styles.selectedItemText
                ]}>
                  {item.name}
                </Text>
                {selectedParameter.id === item.id && (
                  <Icon name="check" size={20} color="#003366" />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 1000,
    marginHorizontal: 16,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedText: {
    fontSize: 16,
    color: '#003366',
    fontWeight: '500',
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 8,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedItem: {
    backgroundColor: '#E6F3FF',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  selectedItemText: {
    color: '#003366',
    fontWeight: '500',
  },
});

export default ParameterDropdown;