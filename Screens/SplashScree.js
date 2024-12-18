import React from 'react';
import { View, Image, ActivityIndicator, StyleSheet } from 'react-native';


export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require('./../assets/logo.png')}
        style={styles.logo}
      />
      <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  logo: {
    width: 250,
    height: 250,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  loader: {
    marginTop: 10,
  },
});
