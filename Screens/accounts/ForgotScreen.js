import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ToastAndroid, KeyboardAvoidingView, Platform, Image, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import {BASE_URL} from "../../Actions/Api"
import { useFonts } from 'expo-font';
import { Almarai_400Regular, Almarai_700Bold } from '@expo-google-fonts/almarai';

export default function ForgotScreen({ navigation }) {
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false); 
  const [language, setLanguage] = useState('en');

  const handleReset = async () => {
    if (!mobile) {
      ToastAndroid.show('Please enter your mobile number', ToastAndroid.SHORT);
      return;
    }

    setLoading(true); 
    try {
      const response = await fetch(`${BASE_URL}/forgot-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone_number: mobile }),
      });
      const data = await response.json();
      setLoading(false); 

      if (response.ok) {
        ToastAndroid.show(`Reset OTP sent to ${mobile}`, ToastAndroid.LONG);
        navigation.navigate('ForgotOTPVerify', { phoneNumber: mobile });
      } else {
        ToastAndroid.show(data.message || 'Something went wrong', ToastAndroid.LONG);
      }
    } catch (error) {
      setLoading(false);
      ToastAndroid.show('Failed to connect to the server', ToastAndroid.LONG);
    }
  };
  const [fontsLoaded] = useFonts({
      Almarai_400Regular,
      Almarai_700Bold,
    });

  const forgotText = language === 'en' ? 'Forgot Password' : language === 'es' ? 'Olvidaste tu contraseña' : language === 'fr' ? 'Mot de passe oublié' : 'پاسورڈ بھول گئے';
  const mobileText = language === 'en' ? 'Mobile Number' : language === 'es' ? 'Número de móvil' : language === 'fr' ? 'Numéro de mobile' : 'موبائل نمبر';
  const resetButtonText = language === 'en' ? 'Reset Password' : language === 'es' ? 'Restablecer la contraseña' : language === 'fr' ? 'Réinitialiser le mot de passe' : 'پاسورڈ دوبارہ ترتیب دیں';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('./../../assets/logo.png')}
            style={styles.logo}
          />
        </View>

        <Text style={styles.label}>{mobileText}</Text>
        <TextInput
          style={styles.input}
          placeholder=""
          value={mobile}
          onChangeText={setMobile}
          keyboardType="phone-pad"
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
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
    borderColor: '#000',
    borderWidth: 2,
    borderRadius: 5,
    paddingLeft: 10,
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
    // fontWeight: 'bold',
    fontFamily: 'Almarai_700Bold',

  },
});
