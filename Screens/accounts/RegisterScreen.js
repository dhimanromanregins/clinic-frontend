import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Button, Alert, TouchableOpacity, ToastAndroid,ActivityIndicator,Image, Modal, FlatList, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useState,useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons'; 
import {BASE_URL} from "../../Actions/Api"
import { useFonts } from 'expo-font';
import { Almarai_400Regular, Almarai_700Bold } from '@expo-google-fonts/almarai';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterScreen({ navigation }) {
  const [firstParentName, setFirstParentName] = useState('');
  const [uaeId, setUaeId] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [language, setLanguage] = useState('en'); 
  const [isModalVisible, setIsModalVisible] = useState(false); 
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const [fontsLoaded] = useFonts({
      Almarai_400Regular,
      Almarai_700Bold,
    })


    useFocusEffect(
      useCallback(() => {
        const loadSelectedLanguage = async () => {
          try {
            const savedLanguage = await AsyncStorage.getItem('selectedLanguage');
            if (savedLanguage) {
              setLanguage(savedLanguage);
              console.log(`Loaded language from storage: ${savedLanguage}`); // Debugging log
            }
          } catch (error) {
            console.error('Error loading language from local storage:', error);
          }
        };
  
        loadSelectedLanguage(); // Invoke the function to load the language
      }, [])
    );

  const handleRegister = async () => {
    const validationErrors = {};
    const nameParts = firstParentName.trim().split(' ');
  
    if (!firstParentName) {
      validationErrors.firstParentName = 'Parent name is required.';
    } else if (nameParts.length < 2) {
      validationErrors.firstParentName = 'Please provide both first and last name.';
    }
  
    if (!uaeId) {
      validationErrors.uaeId = 'UAE ID is required.';
    }
  
    if (!mobile) {
      validationErrors.mobile = 'Mobile number is required.';
    } else if (/^\d{1,7}$/.test(mobile)) {
      validationErrors.mobile = 'Enter a valid mobile number with at least 8 digits.';
    }
  
    if (!password) {
      validationErrors.password = 'Password is required.';
    }
  
    setErrors(validationErrors);
  
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    setLoading(true)
    const data = {
      first_name: nameParts[0],
      last_name: nameParts.slice(1).join(' '),
      phone_number: Number(mobile),
      id_number: uaeId,
      password,
    };
  
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      setLoading(false);
      console.log(response, '---------------------')
      // Check if the response is successful
      if (response.status === 201) {
        const responseData = await response.json(); 
        navigation.navigate('OTP');
        ToastAndroid.showWithGravity(
          'OTP is sent to your Mobile Number: ' + responseData?.message,
          ToastAndroid.LONG,
          ToastAndroid.TOP
        );
         // Navigate to OTP screen
      } else {
        // Handle non-success responses
        const errorData = await response.json(); // Parse error details
        throw new Error(errorData.message || 'Registration failed: Phone Number Already exist');
      }
    } catch (error) {
      setLoading(false);
      ToastAndroid.showWithGravity(
        'Registration Failed: ' + (error.message || 'Unknown error'),
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM
      );
    } finally{
      setLoading(false)
    }
  };
  const toggleLanguage = (selectedLanguage) => {
    setLanguage(selectedLanguage);
    setIsModalVisible(false);
  };

  const firstParentNameText = language === 'en' ? 'Parent Name' : 'نام والدین';
  const uaeIdText = language === 'en' ? 'UAE ID'  : 'UAE شناختی';
  const mobileText = language === 'en' ? 'Mobile Number' : 'رقم الهاتف';
  const passwordText = language === 'en' ? 'Password'  : 'كلمة المرور ';
  const registerText = language === 'en' ? 'Sign Up'  : 'حساب جديد';
  const signInText = language === 'en' ? "Already have an account?" : 'کیا آپ کا اکاؤنٹ ہے؟';
  const signInLinkText = language === 'en' ? 'Login' : 'تسجيل الدخول';
  

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'ae', label: 'العربية' }, 
  ];


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollView}>
        <TouchableOpacity onPress={() => setIsModalVisible(true)} style={styles.languageSwitcher}>
          <Ionicons name="globe" size={30} color="white" />
        </TouchableOpacity>

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
        
        <View style={styles.logoContainer}>
          <Image 
            source={require('./../../assets/logo.png')} 
            style={styles.logo}
          />
        </View>

        <TouchableOpacity onPress={() => Alert.alert('Settings', 'Settings clicked!')} style={styles.settingsIcon}>
          <Ionicons name="settings" size={30} color="white" />
        </TouchableOpacity>

        {/* First Parent Name Input */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>{firstParentNameText}</Text>
          <TextInput
            style={styles.input}
            placeholder=""
            value={firstParentName}
            onChangeText={setFirstParentName}
          />
        </View>
        {errors.firstParentName && <Text style={styles.error}>{errors.firstParentName}</Text>}

        {/* UAE ID Input */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>{uaeIdText}</Text>
          <TextInput
            style={styles.input}
            placeholder=""
            value={uaeId}
            onChangeText={setUaeId}
            keyboardType="numeric"
          />
        </View>

        {errors.uaeId && <Text style={styles.error}>{errors.uaeId}</Text>}

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
        </View>
        {errors.mobile && <Text style={styles.error}>{errors.mobile}</Text>}

        {/* Create Password Input */}
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
        </View>
        
        {errors.password && <Text style={styles.error}>{errors.password}</Text>}
        {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.spinner} />
      ) : (
        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.registerButtonText}>{registerText}</Text>
        </TouchableOpacity>
      )}
        {/* Sign In Link */}
        <View style={styles.signInContainer}>
          <Text style={styles.signInText}>{signInText} </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.signInLink}>{signInLinkText}</Text>
          </TouchableOpacity>
        </View>
        </ScrollView>

      <StatusBar style="auto" />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    fontSize: 18,
    color: 'black',
    fontFamily: 'Almarai_700Bold',

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
    fontSize: 16,
    fontFamily: 'Almarai_700Bold',

  },
  logoContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  settingsIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 15, // Reduced gap between inputs
  },
  label: {
    color: '#2a4770',
    fontSize: 16,
    fontWeight:'bold',
    marginBottom: 5,
    textAlign: 'right', // Corrected to use 'right' within quotes
    fontFamily: 'Almarai_700Bold',

  },
  input: {
    width: '100%',
    height: 50,
    paddingHorizontal: 10,
    borderColor: '#000',
    borderWidth: 2,
    borderRadius: 5,
    fontSize: 16,
    fontFamily: 'Almarai_400Regular',

  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
  },
  error: {
    color: 'red',
    fontSize: 14,
    marginTop: 1,
    fontFamily: 'Almarai_400Regular',

  },
  registerButton: {
    backgroundColor: '#2a4770',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Almarai_700Bold',

  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center', 
    marginTop: 10,
  },
  signInText: {
    color: '#2a4770',
    fontSize: 16,
  },
  signInLink: {
    color: '#2a4770',
    fontSize: 16,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    fontFamily: 'Almarai_400Regular',

  },
  line: {
    width: '100%',
    height: 1,
    marginVertical: 5,
  },
  spinner: {
    marginVertical: 20,
  },
}); 