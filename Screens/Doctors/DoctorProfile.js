import React, { useEffect, useState , useCallback} from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import {BASE_URL} from "../../Actions/Api"
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons, FontAwesome, AntDesign } from '@expo/vector-icons';
const DoctorProfile = ({ route, navigation }) => {
  const { doctorId } = route.params;  // Assuming doctorId is passed from the previous screen
  const [doctor, setDoctor] = useState(null);
  const [language, setLanguage] = useState('en');

  const handleDoctorDetail = (doctor_details) => {
    navigation.navigate('Booking', { doctor_details });
  };

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'ur', label: 'العربية' },
  ];

  const BookAppointment = language === 'en' ? 'Book Appointment' : 'حجز موعد';




  // Fetch doctor details based on the doctorId
  useEffect(() => {
    fetch(`${BASE_URL}/doctors/${doctorId}`)
      .then((response) => response.json())
      .then((data) => {
        setDoctor(data);
      })
      .catch((error) => {
        console.error("Error fetching doctor details:", error);
      });
  }, [doctorId]);


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

  if (!doctor) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
        <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <FontAwesome name="angle-left" size={34} color="rgba(24,212,184,255)" />
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <View style={styles.profileDetails}>
            <Text style={styles.doctorName}>{doctor.name}</Text>
            <Text style={styles.specialty}>{doctor.specialty}</Text>
            <Text style={styles.experience}>{doctor.experience}</Text>
          </View>
          {doctor.profile_photo ? (
            <Image
              source={{ uri: `${BASE_URL}${doctor.profile_photo}` }}
              style={styles.profileImage}
            />
          ) : (
            <Image
              // source={require('/path/to/placeholder-image.jpg')}
              style={styles.profileImage}
            />
          )}
        </View>

        <View style={styles.borderLine} />
        <View style={styles.bioSection}>
          <Text style={styles.bioText}>{doctor.about}</Text>
          <Text style={styles.bioText}>Hospital: {doctor.hospital_name}</Text>
          <Text style={styles.bioText}>Education: {doctor.education}</Text>
          <Text style={styles.bioText}>Location: {doctor.location.city}</Text>
          <Text style={styles.bioText}>Languages: {doctor.languages.map(lang => lang.language).join(', ')}</Text>
          <Text style={styles.bioText}>Registration ID: {doctor.registration_id}</Text>
          <Text style={styles.bioText}>Available for Digital Consult: {doctor.digital_consult ? 'Yes' : 'No'}</Text>
          <Text style={styles.bioText}>Available for Hospital Visit: {doctor.hospital_visit ? 'Yes' : 'No'}</Text>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.bookButton}
        onPress={() => handleDoctorDetail(doctor)} 
      >
        <Text style={styles.bookButtonText}>{BookAppointment}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    marginTop:50
    
  },
  backButton:{
    padding:10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  borderLine: {
    borderBottomWidth: 3,
    borderColor: '#2a4770',
    marginBottom: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  profileDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  doctorName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2a4770',
  },
  specialty: {
    fontSize: 16,
    color: '#555',
    marginTop: 5,
  },
  experience: {
    fontSize: 16,
    color: '#555',
    marginTop: 5,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#2a4770',
  },
  bioSection: {
    padding: 20,
  },
  bioText: {
    fontSize: 14,
    color: '#333',
    marginTop: 5,
    textAlign: 'left',
  },
  bookButton: {
    backgroundColor: 'rgba(24,212,184,255)',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2a4770',
  },
});

export default DoctorProfile;
