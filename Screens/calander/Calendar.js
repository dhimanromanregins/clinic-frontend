import React, { useEffect, useState ,useCallback } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Image, ToastAndroid , Modal, FlatList} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; 
import { FontAwesome } from '@expo/vector-icons'; 
import { LinearGradient } from 'expo-linear-gradient'; 
import { BASE_URL } from '../../Actions/Api';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const Calendar = ({ navigation }) => {
  const [doctors, setDoctors] = useState([]);
  const [language, setLanguage] = useState('en');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleDoctorDetail = (doctorId) => {
    navigation.navigate('DoctorDetail', { doctorId });
  };


  const Calander = language === 'en' ? 'Calender' : 'مواعيد العيادة';
  const AM = language === 'en' ? 'AM' : 'صباحا';
  const PM = language === 'en' ? 'PM' : 'مساء';
 

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

  useEffect(() => {
    const currentDate = new Date().toISOString().split('T')[0];
    fetch(`${BASE_URL}/api/doctors-availability/?date=${currentDate}`)
      .then((response) => response.json())
      .then((data) => {
        setDoctors(data);
      })
      .catch((error) => {
        ToastAndroid.show('Error fetching doctors data', ToastAndroid.SHORT);
      });
  }, []);
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-GB', {
    weekday: 'short', // 'Mon', 'Tue', etc.
    day: '2-digit', // '01', '02', etc.
    month: 'short', // 'Jan', 'Feb', etc.
    year: 'numeric', // '2024'
  });

  return (
<ScrollView style={styles.scrollView}>
  {/* Header Section */}
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
      onPress={() => ToastAndroid.show('Going back', ToastAndroid.SHORT)}
      style={styles.backButton}
    >
      <FontAwesome name="angle-left" size={34} color="rgba(24,212,184,255)" />
    </TouchableOpacity>
  </View>

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

  <View style={styles.container}>
    {/* Calendar Title */}
    <View style={styles.textSection}>
      <Text style={styles.text}>{Calander}</Text>
      <View style={styles.borderLine} />
      <Text style={styles.text}>{formattedDate}</Text>
    </View>

    {/* Doctor Cards Section with Gradient Overlay */}
    {doctors.map((doctorData, index) => {
      const doctor = doctorData.doctor;
      const isAvailable = doctor.is_available;
      const morningStart = doctorData.morning_start.split(' ')[0];
      const [morninghour, morningminute] = morningStart.split(':');
      const morningformattedTime = `${morninghour}:${morningminute}`;
      const afternoonEnd = doctorData.afternoon_end.split(' ')[0];
      const [noonhour, noonminute] = afternoonEnd.split(':');
      const noonformattedTime = `${noonhour}:${noonminute}`;

      return (
        <React.Fragment key={doctor.id}>
          <LinearGradient
            colors={['#fff', 'rgba(24,212,184,255)', '#fff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.card}
          >
            <View style={styles.cardContent}>
              {/* Profile Picture */}
              <Image
                source={{ uri: `${BASE_URL}${doctor.profile_photo}` }}
                style={styles.profilePicture}
              />

              {/* Doctor Details */}
              <View style={styles.doctorDetails}>
                <Text style={styles.doctorName}>{doctor.name}</Text>
                <Text style={styles.specialty}>{doctor.specialty}</Text>
                <View style={styles.bookingTimeSection}>
                  <Text style={styles.bookingTime}>{morningformattedTime}{AM}</Text>
                  <MaterialIcons name="arrow-forward" size={20} color="#2a4770" style={styles.arrowIcon} />
                  <Text style={styles.bookingTime}>{noonformattedTime}{PM}</Text>
                </View>
              </View>

              {/* Profile Icon Button */}
              <TouchableOpacity 
                style={styles.profileIconContainer} 
                onPress={() => handleDoctorDetail(doctor.id)}
              >
                <MaterialIcons name="account-circle" size={30} color="#2a4770" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
          <View style={styles.cardSeparator} />
        </React.Fragment>
      );
    })}
  </View>
</ScrollView>

  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    padding: 20,
    flexGrow: 1, // Ensures that the content grows to fill the screen
  },
  // Header Section
  header: {
    width: '100%',
    paddingVertical: 10,
  marginTop:30,
    paddingHorizontal: 15,
    flexDirection: 'row', // Arrange elements horizontally
    alignItems: 'center',
    backgroundColor: 'rgba(24,212,184,255)', // Green background
    borderRadius: 10, // Optional: rounded corners for the header
  },
  languageIcon: {
    marginRight: 15, // Adjust spacing for the language icon
  },
  backButton: {
    marginLeft: 10, // Adjust spacing for the back button
  },
  textSection: {
    width: '100%',
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
    marginBottom: 20, // Adjust spacing for separation
  },
  // Card Section with Gradient
  card: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row', // Align profile picture and details horizontally
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
    position: 'relative', // Allows absolute positioning for the doctorName
    overflow: 'hidden', // Ensure the gradient stays within the bounds of the card
  },
  cardContent: {
    flexDirection: 'row', // Horizontal alignment for image and text
    width: '100%',
    justifyContent: 'space-between', // Space out content inside the card
  },
  profilePicture: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15, // Space between image and text
  },
  doctorDetails: {
    justifyContent: 'flex-start', // Align items to the start
    flex: 1,
    paddingTop: 40, // Add top padding to ensure the text doesn't overlap with the name
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 10, // Add bottom padding for the space from the bottom
    borderRadius: 10, // Optional: rounded corners for the background
    marginTop: 10, 
    position: 'relative', // Ensure the doctor name stays inside the card container
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: '#2a4770', // Background color for the doctor's name
    color: '#fff',
    padding: 10,
    position: 'absolute',
    top: -30, // Position the name at the top
    left: 10,
    right: 10,
    borderRadius: 5,
    zIndex: 100, // Ensure the name is displayed on top of other elements
  },
  profileIconContainer: {
    position: 'absolute',
    right: -18,
    top: '50%',
    transform: [{ translateY: -15 }],
  
  },
  bookingTimeSection: {
    flexDirection: 'row', // Align the times and arrow horizontally
    marginTop: 10,
    backgroundColor: '#fff', // White background for the booking time section
    borderRadius: 8, // Rounded corners for the section
    padding: 10, // Add padding inside the section
    shadowColor: '#000', // Optional: shadow for depth
    shadowOpacity: 0.1, // Optional: shadow opacity
    shadowRadius: 5, // Optional: shadow blur radius
    elevation: 2, // Optional: shadow for Android


},

  bookingTime: {
    fontSize: 14,
    color: '#555', // Dark color for the booking time text

  },
  arrowIcon: {
    marginHorizontal: 5, // Space around the arrow icon
  },
  cardSeparator: {
    width: '100%',
    height: 1,
    backgroundColor: '#ddd', // Light gray line for separation
    marginVertical: 10, // Adjust spacing for separation
  },
  offButton: {
    backgroundColor: '#2a4770',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10, // Space above the "Off" button
  },
  offButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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

export default Calendar;
