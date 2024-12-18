import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, ToastAndroid, TouchableOpacity, ActivityIndicator } from 'react-native';
import { BASE_URL } from "../../Actions/Api"
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import { Almarai_400Regular, Almarai_700Bold } from '@expo-google-fonts/almarai';

export default function LoginOTPScreen({ navigation }) {  // Destructure navigation from props
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false); // New state to handle loading
  const [error, setError] = useState('');

  const handleChange = (value, index) => {
    const newOtp = [...otp];
    if (value.length === 6) {
      const pastedOtp = value.split('').slice(0, 6);
      setOtp(pastedOtp);
    } else if (/^\d$/.test(value)) {
      newOtp[index] = value;
      setOtp(newOtp);

      const nextInput = index + 1;
      if (nextInput < 6) {
        inputs[nextInput].focus();
      }
    }
  };

  const [fontsLoaded] = useFonts({
    Almarai_400Regular,
    Almarai_700Bold,
  });

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '') {
      const prevInput = index - 1;
      if (prevInput >= 0) {
        inputs[prevInput].focus();
        const newOtp = [...otp];
        newOtp[prevInput] = '';
        setOtp(newOtp);
      }
    }
  };

  const handleSubmit = async () => {
    const otpCode = otp.join('');
    if (otpCode.length === 6) {
      setIsLoading(true);
      setError('');
      try {
        const response = await fetch(`${BASE_URL}/verify_otp_login/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ otp: otpCode }),
        });

        const data = await response.json();
        setIsLoading(false);
        if (response.ok) {
          await AsyncStorage.setItem('access_token', data.access_token);
          await AsyncStorage.setItem('refresh_token', data.refresh_token);
          const accessToken = await AsyncStorage.getItem('access_token');
          const refreshToken = await AsyncStorage.getItem('refresh_token');
          console.log(accessToken, refreshToken);
          ToastAndroid.show(`OTP successfully verified: ${data.message}`, ToastAndroid.SHORT);
          navigation.navigate('Dashboard');
        } else {
          ToastAndroid.show(data.error || 'Something went wrong', ToastAndroid.LONG);
        }
      } catch (error) {
        setIsLoading(false);
        setError('Network error or invalid server');
        ToastAndroid.show('Network error or invalid server', ToastAndroid.LONG);
      }
    } else {
      ToastAndroid.show('Please enter a 6-digit OTP', ToastAndroid.LONG);
    }
  };

  const inputs = [];

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Enter OTP</Text>
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            style={styles.input}
            value={digit}
            onChangeText={(value) => handleChange(value, index)}
            keyboardType="numeric"
            maxLength={1}
            returnKeyType="next"
            onKeyPress={(e) => handleKeyPress(e, index)}
            ref={(ref) => (inputs[index] = ref)}
            autoFocus={index === 0}
          />
        ))}
      </View>
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit OTP</Text>
        </TouchableOpacity>
      )}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',

    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2a4770',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  input: {
    width: 40,
    height: 50,
    borderColor: '#2a4770',
    borderWidth: 2,
    borderRadius: 5,
    textAlign: 'center',
    fontSize: 18,
    marginHorizontal: 5,
    fontFamily: 'Almarai_400Regular',

  },
  submitButton: {
    backgroundColor: '#2a4770',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Almarai_700Bold',

  },
});