import React, { useState, useRef } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  StatusBar,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { WebView } from 'react-native-webview';

interface WebViewError {
  nativeEvent: {
    description: string;
    code: number;
  };
}

const ForwardedWebView = React.forwardRef<WebView, WebView['props']>((props, ref) => (
  <WebView {...props} ref={ref} />
));

const MapDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const webViewRef = useRef<WebView>(null);

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleError = (syntheticEvent: WebViewError) => {
    const { description, code } = syntheticEvent.nativeEvent;
    setHasError(true);
    setIsLoading(false);
    setErrorMessage(`Error ${code}: ${description}`);
  };

  const handleMapClick = () => {
    if (webViewRef.current) {
      webViewRef.current.postMessage('map-clicked');
    }
  };

  const LoadingIndicator = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#0066CC" />
      <Text style={styles.loadingText}>Loading map...</Text>
    </View>
  );

  const ErrorDisplay = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{errorMessage}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  const handleRetry = () => {
    setIsLoading(true);
    setHasError(false);
    setErrorMessage('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.webviewContainer}>
        <ForwardedWebView
          // ref={webViewRef}
          source={{ uri: 'https://sih-2024-sigma.vercel.app/' }}
          style={[styles.webview, { backgroundColor: 'transparent' }]}
          startInLoadingState={true}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          onMessage={(event) => {
            if (event.nativeEvent.data === 'map-clicked') {
              webViewRef.current?.reload();
            }
          }}
          renderLoading={() => <LoadingIndicator />}
          renderError={() => <ErrorDisplay />}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          scalesPageToFit={true}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          onShouldStartLoadWithRequest={(request) => {
            if (request.url === 'https://sih-2024-sigma.vercel.app/') {
              return true;
            } else {
              webViewRef.current?.postMessage('map-clicked');
              return false;
            }
          }}
        />
        {isLoading && <LoadingIndicator />}
        {hasError && <ErrorDisplay />}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  webviewContainer: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MapDashboard;