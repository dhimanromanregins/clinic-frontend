import React, { useEffect, useState,useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator, Modal,
  FlatList
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { BASE_URL } from "../../Actions/Api.js"
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BookDoctor = ({ navigation }) => {
  const [doctors, setDoctors] = useState([]); // State for doctors
  const [loading, setLoading] = useState(true); // State for loading indicator
  const [language, setLanguage] = useState('en');



  const Doctors = language === 'en' ? 'Doctors' : 'أطباء العيادة';   
  const Book = language === 'en' ? 'Book' : 'حجز موعد';

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

  // Fetch doctors from the API
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch(`${BASE_URL}/doctors/`);
        if (!response.ok) {
          throw new Error('Failed to fetch doctors');
        }
        const data = await response.json();
        setDoctors(data.doctors);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);


  


  // Handle navigation to the DoctorProfile page
  const handleBookAppointment = (doctor_details) => {
    navigation.navigate('Booking', { doctor_details });
  };

  const handleDoctorDetail = (doctorId) => {
    navigation.navigate('DoctorDetail', { doctorId });
  };

  return (
    <View style={styles.container}>
      {/* Title Section */}
      <View style={styles.textSection}>
        <Text style={styles.text}>Book an Appointment</Text>
        <View style={styles.borderLine} />
      </View>
      <Text style={styles.text}>{Doctors}</Text>
      

      {/* Display loading indicator */}
      {loading ? (
        <ActivityIndicator size="large" color="#2a4770" />
      ) : (
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {doctors.length > 0 && doctors?.map((doctor) => (
            <View key={doctor.id} style={styles.doctorItem}>
              {/* Profile Image and Details */}
              
              <View style={styles.profileSection}>
                <Image
                  source={{ uri: `${BASE_URL}${doctor.profile_photo}` }}
                  style={styles.profilePic}
                />
              </View>
              {/* <Text>{doctor.name}</Text> */}

              {/* Book Button */}
              <TouchableOpacity
                style={styles.bookButton}
                onPress={() => handleBookAppointment(doctor)}
              >
                <Text style={styles.bookText}>{Book}</Text>
              </TouchableOpacity>

              {/* Exclamation Icon */}
              <View style={styles.exclamationWrapper}>
                <TouchableOpacity
                  onPress={() => handleDoctorDetail(doctor.id)}
                >
                  <FontAwesome
                    name="exclamation-circle"
                    size={24}
                    color="#2a4770"
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Styles remain unchanged
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    paddingTop: 20,
  },
  textSection: {
    width: '90%',
    alignItems: 'center',
    marginBottom: 0,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2a4770',
    marginTop:50,
  
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
    backgroundColor: '#2a4770',
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    width: '100%',
    height: 160,
    marginBottom: 20,
    position: 'relative',
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
  },
  bookButton: {
    backgroundColor: 'rgba(24,212,184,255)',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 50,
    marginTop: 60,
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
});

export default BookDoctor;
