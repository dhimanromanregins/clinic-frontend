import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, BackHandler, TextInput, ActivityIndicator, Alert, ToastAndroid,TouchableOpacity, Image, Modal, FlatList, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {BASE_URL} from "../../Actions/Api"
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useFocusEffect } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Almarai_400Regular, Almarai_700Bold } from '@expo-google-fonts/almarai';


export default function LoginScreen({ navigation }) {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [language, setLanguage] = useState('en');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [backPressedOnce, setBackPressedOnce] = useState(false);
  
  // Error states for fields
  const [mobileError, setMobileError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [fontsLoaded] = useFonts({
    Almarai_400Regular,
    Almarai_700Bold,
  });


  const handleLogin = async () => {
    // Reset errors before validation
    setMobileError('');
    setPasswordError('');

    

    if (!mobile) {
      setMobileError('Mobile number is required');
    }
    if (!password) {
      setPasswordError('Password is required');
    }

    if (!mobile || !password) {
      return;
    }

    setLoading(true);

    const loginData = {
      identifier: mobile,
      password: password,
    };


    try {
      const response = await fetch(`${BASE_URL}/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();
      if (response.ok) {
        // If the response is successful, navigate to LoginOTP screen
        ToastAndroid.showWithGravity(
          'Otp Sent Successfully: ' + (data.message || 'Please check your phone'),
          ToastAndroid.LONG,
          ToastAndroid.TOP
        );
        navigation.navigate('LoginOTP');
      } else {
        ToastAndroid.showWithGravity(
          'Login Failed: ' + (data.message || 'Invalid credentials. Please try again'),
          ToastAndroid.LONG,
          ToastAndroid.BOTTOM
        );
      }
    } catch (error) {
      ToastAndroid.showWithGravity(
        'Network error. Please try again later.',
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM
      );
    }finally {
      setLoading(false); // Hide spinner
    }
  };


  // Function to toggle between languages
  const toggleLanguage = (selectedLanguage) => {
    setLanguage(selectedLanguage);
    setIsModalVisible(false); // Close the modal after selection
  };

  // Text based on the selected language
const loginText = language === 'en' ? 'Login' : 'تسجيل الدخول';
const mobileText = language === 'en' ? 'Mobile Number OR UAE Number' : 'رقم الهاتف ';
const passwordText = language === 'en' ? 'Password' : 'كلمة المرور';
const signUpText = language === 'en' ? "Don't have an account?" : 'کیا آپ کا اکاؤنٹ نہیں ہے؟';
const signUpLinkText = language === 'en' ? 'Sign Up' : 'حساب جديد';
const ForgetPassword = language === 'en' ? 'Forget Password' : 'هل نسيت كلمة السر ؟';

  // Available languages
  const languages = [
    { code: 'en', label: 'English' },
    { code: 'ur', label: 'العربية' },
  ];

  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        if (backPressedOnce) {
          BackHandler.exitApp();
          return true;
        }
        setBackPressedOnce(true);
        ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
        setTimeout(() => setBackPressedOnce(false), 2000);
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction
      );

      return () => backHandler.remove();
    }, [backPressedOnce])
  );

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <Text>Loading fonts...</Text>
      </View>
    );
  }

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.scrollView}
      resetScrollToCoords={{ x: 0, y: 0 }}
      scrollEnabled={true}
    >

      <ScrollView contentContainerStyle={styles.scrollView}>
        {/* Language Switcher Icon */}
        <TouchableOpacity onPress={() => setIsModalVisible(true)} style={styles.languageSwitcher}>
          <Ionicons name="globe" size={30} color="#000" />
        </TouchableOpacity>

        {/* Modal for Language Selection */}
        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <FlatList
                data={languages}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => toggleLanguage(item.code)} style={styles.languageOption}>
                    <Text style={styles.languageText}>{item.label}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.code}
              />
              <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <View style={styles.blackBox}></View>
        {/* Logo Image */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('./../../assets/logo.png')} 
            style={styles.logo}
          />
        </View>


        {/* Mobile Number Input */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>{mobileText}</Text>
          <TextInput
            style={styles.input}
            placeholder=""
            value={mobile}
            onChangeText={setMobile}
            keyboardType="phone-pad"
          />
          {mobileError ? <Text style={styles.errorText}>{mobileError}</Text> : null}
        </View>
        
        {/* Password Input */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>{passwordText}</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.input}
              placeholder=""
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!passwordVisible} // Toggles between secureTextEntry and visible password
            />
            <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} style={styles.eyeIcon}>
              <Ionicons name={passwordVisible ? "eye-off" : "eye"} size={24} color="grey" />
            </TouchableOpacity>
          </View>
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Forgot')} style={styles.forgotPassword}>
  <Text style={styles.forgotPasswordText}>{ForgetPassword}
  </Text>
  
</TouchableOpacity>
        
        {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.spinner} />
      ) : (
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>{loginText}</Text>
        </TouchableOpacity>
      )}

        {/* Sign Up Link */}
        <View style={styles.signUpContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.signUpLink}>{signUpLinkText}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <StatusBar style="auto" />
      </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageSwitcher: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'transparent',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Background overlay
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
  },
  languageOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  languageText: { 
    fontFamily: 'Almarai_700Bold',
    fontSize: 18,
    color: 'black',
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#24d4b8',
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontFamily: 'Almarai_700Bold',
    fontSize: 16,
  },
  logoContainer: {
    marginBottom: 30,  // Adjust this value for spacing between logo and inputs
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  logo: {
    width: 120, // Adjust the width of the logo
    height: 120, // Adjust the height of the logo
    resizeMode: 'contain',
  },
  settingsIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 20,
    paddingHorizontal:20,
    alignItems: 'flex-end', // Align input fields to the right of label
  },
  label: {
    fontSize: 14,
    // fontWeight: 'bold',
    fontFamily: 'Almarai_700Bold',
    marginBottom: 5,
    color: '#2a4770',
    textAlign: 'right', // Align label text to the right
    width: '100%', // Make the label span the full width for correct alignment
  },
  input: {
    height: 50,
    borderColor: '#000',
    borderWidth: 2,
    borderRadius: 5,
    paddingLeft: 10,
    width: '100%',
    backgroundColor: 'none', // No background color
    fontFamily: 'Almarai_400Regular',

    
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
  },
  signUpContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  signUpText: {
    color: '#2a4770',
    fontSize: 16,
  },
  signUpLink: {
    color: '#2a4770',
    fontSize: 16,
    // fontWeight: 'bold',
    fontFamily: 'Almarai_400Regular',
    textDecorationLine: 'underline',
  },
  loginButton: {
    backgroundColor: '#2a4770', 
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    // fontWeight: 'bold',
    fontFamily: 'Almarai_700Bold',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#2a4770',
    paddingHorizontal:20,
    fontSize: 14,
    // fontWeight: 'bold',
    textDecorationLine: 'underline',
    fontFamily: 'Almarai_700Bold',
  },
  blackBox: {
    backgroundColor: 'black',
    height: 50,
    width: '100%',
    marginTop: 50,
    padding: 0,
  },
  spinner: {
    marginVertical: 20,
  },

  errorText: {
    color: 'red',
    fontSize: 12,
    fontFamily: 'Almarai_400Regular',
  },

});