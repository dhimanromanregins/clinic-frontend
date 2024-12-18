import React, { useState, useEffect , useCallback} from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, ToastAndroid , FlatList, Modal} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { jwtDecode } from "jwt-decode";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../Actions/Api';
import { useFocusEffect } from '@react-navigation/native';


const TeleMedicine = ({ navigation, userId }) => {
  const [doctors, setDoctors] = useState([]);
  const [language, setLanguage] = useState('en');
  const [isModalVisible, setIsModalVisible] = useState(false);


  const TelemedicineDoctorsAvailable  = language === 'en' ? 'Telemedicine Doctors Available' : 'العلاج عن بعد';
  const Available = language === 'en' ? 'Available' : 'أتصال';
  const NotAvailable = language === 'en' ? 'Not Available' : 'غير متاح';



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

  const handlePress = async (doctor) => {
    const accessToken = await AsyncStorage.getItem('access_token');
    console.log("Access Token:", accessToken);

    if (!accessToken) {
      console.error("No access token found.");
      return;
    }

    if (doctor.is_available) {
      console.log("Doctor is available, sending request to book...");

      // Send POST request to API
      fetch(`${BASE_URL}/create-tele-doctor/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`, // Add the token to the Authorization header
        },
        body: JSON.stringify({
          doctor_id: doctor.id, // Pass only doctor ID in the body
        }),
      })
        .then((response) => {
          if (response.status === 201) {
            ToastAndroid.show('Doctor successfully booked!', ToastAndroid.SHORT);  // Success toast
            return response.json();
          } else {
            ToastAndroid.show('Error booking doctor!', ToastAndroid.SHORT);  // Error toast
            throw new Error('Error booking doctor');
          }
        })
        .then((data) => {
          console.log("Successfully booked with response:", data);
          navigation.navigate('TeleDoctor', { doctor: doctor }); // Navigate to the TeleDoctor screen
        })
        .catch((error) => {
          console.error('Error booking doctor:', error);
        });
    } else {
      ToastAndroid.show('This doctor is currently unavailable.', ToastAndroid.SHORT);  // Unavailable toast
    }
  };

  // Fetch doctors data from the API
  useEffect(() => {
    fetch(`${BASE_URL}/api/available-telemedicine-doctors/`)
      .then((response) => response.json())
      .then((data) => {
        setDoctors(data);
        console.log(data.doctors, '---------', `${BASE_URL}/api/available-telemedicine-doctors/`) // Set the fetched doctors to state
      })
      .catch((error) => {
        console.error('Error fetching doctors:', error);
      });
  }, []);

  const handleDoctorDetail = (doctorId) => {
    navigation.navigate('DoctorDetail', { doctorId });
  };

  return (
    <View style={styles.container}>
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
      <View style={styles.header}>
        {/* Language Switcher Icon */}
        <TouchableOpacity
          style={styles.languageIcon}
          onPress={() => setIsModalVisible(true)}
        >
          <MaterialIcons name="language" size={34} color="white" />
        </TouchableOpacity>

        {/* Back Button Icon */}
        <TouchableOpacity
          onPress={() => navigation.goBack()} // Go back to the previous screen
          style={styles.backButton}
        >
          <FontAwesome name="angle-left" size={34} color="rgba(24,212,184,255)" />
        </TouchableOpacity>
      </View>

      <View style={styles.textSection}>
        <Text style={styles.text}>{TelemedicineDoctorsAvailable}</Text>
        <View style={styles.borderLine} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {doctors?.map((doctor) => (
          <View key={doctor.id} style={styles.doctorItem}>
            {/* Profile Image and Details */}
            <View style={styles.profileSection}>
              <Image
                source={{ uri: `${BASE_URL}${doctor.profile_photo}` }}
                style={styles.profilePic}
              />
            </View>

            {/* Container for the Text and Available Button */}
            <View style={styles.availableSection}>
              <Text style={styles.doctorName}>{doctor.name}</Text>
              <TouchableOpacity
                style={[
                  styles.bookButton,
                  !doctor.is_available && styles.disabledButton // Apply disabled style if not available
                ]}
                onPress={() => handlePress(doctor)} // Pass doctor as argument
                disabled={!doctor.is_available} // Disable button if doctor is not available
              >
                <Text style={styles.bookText}>
                  {doctor.is_available ? `${Available}` : `${NotAvailable}`}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Exclamation Icon */}
            <TouchableOpacity
              style={styles.exclamationWrapper}
              onPress={() => handleDoctorDetail(doctor.id)}
            >
              <FontAwesome name="exclamation-circle" size={24} color="#2a4770" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Centers the content vertically
    alignItems: 'center', // Centers the content horizontally
    backgroundColor: '#f9f9f9', // Light background color
  },
  header: {
    width: '100%',
    backgroundColor: 'rgba(24,212,184,255)', // Green background
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: 'row', // Arrange elements horizontally
    alignItems: 'center',
  },
  textSection: {
    width: '90%',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },

  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2a4770',
  },

  borderLine: {
    width: '100%',
    height: 4,
    backgroundColor: '#2a4770',
    marginTop: 10,
  },
  scrollContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 20,
    paddingHorizontal: 15,
  },
  doctorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,   // Keep the rounded corners
    shadowRadius: 4,
    width: '100%',
    height: 160,
    marginBottom: 20,
    position: 'relative',

  },
  availableSection:{
    width:'200',
  
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 100,
    marginRight: 20,
    borderWidth: 2,    // Border thickness
    borderColor: '#2a4770', // Border color (adjust as needed)
  },
  bookButton: {
    backgroundColor: 'rgba(24,212,184,255)',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 50,
    marginTop: 20,
    marginRight: 30,
  },
  bookText: {
    color: '#2a4770',
    fontWeight: 'bold',
  },
  exclamationWrapper: {
    position: 'absolute',
    right: -10,
    top: '60%',
    transform: [{ translateY: -16 }],
    backgroundColor: 'rgba(24,212,184,255)',
    borderRadius: 50,
    padding: 8,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  disabledButton: {
    backgroundColor: 'grey',
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
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#24d4b8',
    borderRadius: 5,
    alignItems: 'center',
  },
});

export default TeleMedicine;
