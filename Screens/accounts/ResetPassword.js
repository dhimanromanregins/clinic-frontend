import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ToastAndroid, KeyboardAvoidingView, Platform, Image, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import {BASE_URL} from "../../Actions/Api"
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';


export default function ResetPassword({ navigation, route }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); 
  const [language, setLanguage] = useState('en');

  const { phoneNumber } = route.params; // Access phone number passed from the previous screen

  useEffect(() => {
    if (!phoneNumber) {
      setError('Phone number is missing');
    }
  }, [phoneNumber]);

  const handleReset = async () => {
    setError('');

    if (!password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true); 
    try {
      const response = await fetch(`${BASE_URL}/reset-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone_number: phoneNumber, new_password: password }), // Send phone number directly to the API
      });
      const data = await response.json();
      setLoading(false); 

      if (response.ok) {
        ToastAndroid.show(`Password reset successfully`, ToastAndroid.LONG);
        navigation.navigate('Login'); // Navigate to the Login screen
      } else {
        ToastAndroid.show(data.message || 'Something went wrong', ToastAndroid.LONG);
      }
    } catch (error) {
      setLoading(false);
      setError('Failed to connect to the server');
    }
  };

  const forgotText = language === 'en' ? 'Forgot Password' : language === 'es' ? 'Olvidaste tu contraseña' : language === 'fr' ? 'Mot de passe oublié' : 'پاسورڈ بھول گئے';
  const passwordText = language === 'en' ? 'New Password' : language === 'es' ? 'Nueva contraseña' : language === 'fr' ? 'Nouveau mot de passe' : 'نیا پاسورڈ';
  const confirmPasswordText = language === 'en' ? 'Confirm Password' : language === 'es' ? 'Confirmar contraseña' : language === 'fr' ? 'Confirmer le mot de passe' : 'پاسورڈ کی تصدیق کریں';
  const resetButtonText = language === 'en' ? 'Reset Password' : language === 'es' ? 'Restablecer la contraseña' : language === 'fr' ? 'Réinitialiser le mot de passe' : 'پاسورڈ دوبارہ ترتیب دیں';

  return (
    <KeyboardAwareScrollView
    contentContainerStyle={styles.scrollView}
    resetScrollToCoords={{ x: 0, y: 0 }}
    scrollEnabled={true}
  >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('./../../assets/logo.png')}
            style={styles.logo}
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.label}>{passwordText}</Text>
        <TextInput
          style={styles.input}
          placeholder=""
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Text style={styles.label}>{confirmPasswordText}</Text>
        <TextInput
          style={styles.input}
          placeholder=""
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        {/* Reset Button */}
        <TouchableOpacity onPress={handleReset} style={styles.submitButton} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>{resetButtonText}</Text>
          )}
        </TouchableOpacity>
      </View>

      <StatusBar style="auto" />
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(24,212,184,255)',
    padding: 20,
  },
  content: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 120, 
    resizeMode: 'contain',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2a4770',
    marginBottom: 10,
    textAlign: 'right', 
    width: '100%',
    fontFamily: 'Almarai_700Bold',

  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 2,
    borderRadius: 5,
    paddingLeft: 10,
    backgroundColor: 'transparent',
    marginBottom: 20,
    fontFamily: 'Almarai_400Regular',

  },
  submitButton: {
    backgroundColor: '#2a4770',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Almarai_700Bold',
  },
  error: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
    
    fontFamily: 'Almarai_400Regular',


  },
});
