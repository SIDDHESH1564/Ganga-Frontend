// components/SplashScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const logoScale = new Animated.Value(0);
  const textOpacity = new Animated.Value(0);

  useEffect(() => {
    const animationSequence = Animated.sequence([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 10,
        friction: 2,
        useNativeDriver: true,
      }),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      })
    ]);

    animationSequence.start(() => {
      setTimeout(onComplete, 1500);
    });

    return () => {
      animationSequence.stop();
    };
  }, [onComplete]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, { transform: [{ scale: logoScale }] }]}>
        <Text style={styles.logo}>💧</Text>
      </Animated.View>
      <Animated.Text style={[styles.text, { opacity: textOpacity }]}>
        Jana-Ganga
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  logoContainer: {
    marginBottom: 20,
  },
  logo: {
    fontSize: 72,
  },
  text: {
    fontSize: 24,
    color: '#2196F3',
    fontWeight: 'bold',
  },
});

export default SplashScreen;