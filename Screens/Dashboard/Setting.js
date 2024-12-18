import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Modal, FlatList, ToastAndroid } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { BASE_URL } from '../../Actions/Api';

const Setting = ({ navigation }) => {
  const [isNotificationEnabled, setNotificationEnabled] = useState(false);
  const [language, setLanguage] = useState('en');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const toggleSwitch = () => setNotificationEnabled(previousState => !previousState);

  const Settings = language === 'en' ? 'Settings' : 'الأعدادات';
  const DisableNotifications = language === 'en' ? 'Disable Notifications' : 'تفعيل التنبيهات';
  const Language = language === 'en' ? 'Language' : 'اللغة';
  const Arabic = language === 'en' ? 'Arabic' : 'العربية';
  const Logout = language === 'en' ? 'Logout App' : 'الخروج';


  const toggleLanguage = async (selectedLanguage) => {
    try {
      setLanguage(selectedLanguage);
      await AsyncStorage.setItem('selectedLanguage', selectedLanguage);
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error saving language to local storage:', error);
    }
  };

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'ur', label: 'العربية' },
  ];


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

  return (
    <View style={{ flex: 1 }}>
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
      {/* Header Section */}
      <View style={styles.header}>
        {/* Language Switcher Icon */}
        <TouchableOpacity onPress={() => setIsModalVisible(true)}>
          <MaterialIcons name="language" size={34} color="white" />
        </TouchableOpacity>

        {/* Back Button Icon */}
      </View>

      {/* Back Button Icon */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <FontAwesome name="angle-left" size={34} color="rgba(24,212,184,255)" />
      </TouchableOpacity>

      {/* Scrollable Content */}
      <ScrollView style={styles.container}>
        {/* Title Section */}
        <View style={styles.textSection}>
          <Text style={styles.text}>{Settings}</Text>
          <View style={styles.borderLine} />
        </View>

        {/* Notification Section */}
        <View style={styles.notificationSection}>
          <Switch
            trackColor={{ false: '#767577', true: '#24D4B8' }}  // Background color for the track (toggle's background)
            thumbColor={isNotificationEnabled ? '#2a4770' : '#f4f3f4'}  // The color of the circle toggle when ON and OFF
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={isNotificationEnabled}
          />
          <Text style={styles.notificationText}>{DisableNotifications}</Text>
        </View>
        {/* <View style={styles.notificationSection}>
          <Switch
            trackColor={{ false: '#767577', true: '#24D4B8' }}  // Background color for the track (toggle's background)
            thumbColor={isNotificationEnabled ? '#2a4770' : '#f4f3f4'}  // The color of the circle toggle when ON and OFF
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={isNotificationEnabled}
          />
          <Text style={styles.notificationText}></Text>
        </View> */}
        {/* <View style={styles.notificationSection}>
          <Switch
            trackColor={{ false: '#767577', true: '#24D4B8' }}  // Background color for the track (toggle's background)
            thumbColor={isNotificationEnabled ? '#2a4770' : '#f4f3f4'}  // The color of the circle toggle when ON and OFF
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={isNotificationEnabled}
          />
          <Text style={styles.notificationText}></Text>
        </View> */}
        <View style={styles.textSection}>
          <Text style={styles.text}>{Language}</Text>
          <View style={styles.borderLine} />
        </View>
        {/* Language Section */}
        <View style={styles.languageSection}>
          <TouchableOpacity onPress={() => toggleLanguage('en')} style={[styles.languageButtonEnglish, language === 'en' && styles.languageButtonArabic]}>
            <Text style={styles.buttonText}>English</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => toggleLanguage('ur')} style={[styles.languageButtonEnglish, language === 'ur' && styles.languageButtonArabic]}>
            <Text style={styles.buttonText}>العربية</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.borderLine} />

        {/* Logout Button */}
        <TouchableOpacity
  style={styles.logoutButton}
  onPress={async () => {
    try {
      await AsyncStorage.clear();

      ToastAndroid.show('Logout Successfull', ToastAndroid.SHORT);
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error clearing AsyncStorage:', error);
    } finally {
      console.log('Logout process completed.');
    }
  }}
>
  <Text style={styles.logoutText}>{Logout}</Text>
</TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    width: '100%',
    backgroundColor: 'rgba(24,212,184,255)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  languageIcon: {
    marginRight: 'auto',
  },
  hamburgerIcon: {
    marginLeft: 'auto',
  },
  backButton: {
    marginLeft: 10,
    marginTop: 10,
  },
  textSection: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2a4770',
    textAlign: 'right',
  },
  borderLine: {
    height: 4,
    backgroundColor: '#2a4770',
    marginTop: 10,
    alignSelf: 'stretch',
  },
  notificationSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  notificationText: {
    fontSize: 18,
    color: '#2a4770',
    fontWeight: 'bold',
    marginLeft: 'auto',
  },
  languageSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  languageButtonEnglish: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: '#ededed',  // English button background color
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  languageButtonArabic: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: '#c7d8d5',  // Arabic button background color
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000', // Button text color
  },
  logoutButton: {
    width: '100%', // Make the button span the full width
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#efabab', // Logout button background color
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center', // Center the text horizontally
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2a4770',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
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
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#24d4b8',
    borderRadius: 5,
    alignItems: 'center',
  },

});

export default Setting;
