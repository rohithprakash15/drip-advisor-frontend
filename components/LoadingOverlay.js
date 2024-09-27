import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Modal } from 'react-native';

const LoadingOverlay = ({ isVisible, message = 'Loading...', timeout = 45000 }) => {
  const [showTimeout, setShowTimeout] = useState(false);

  useEffect(() => {
    let timer;
    if (isVisible) {
      timer = setTimeout(() => {
        setShowTimeout(true);
      }, timeout);
    }
    return () => clearTimeout(timer);
  }, [isVisible, timeout]);

  if (!isVisible) return null;

  return (
    <Modal transparent animationType="fade" visible={isVisible}>
      <View style={styles.overlay}>
        {!showTimeout ? (
          <>
            <ActivityIndicator size="large" color="#50C2C9" />
            <Text style={styles.message}>{message}</Text>
          </>
        ) : (
          <Text style={styles.timeoutMessage}>
            The operation is taking longer than expected. Please try again later.
          </Text>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  timeoutMessage: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default LoadingOverlay;