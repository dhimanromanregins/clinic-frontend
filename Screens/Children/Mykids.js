import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, ScrollView ,Modal, FlatList} from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { BASE_URL } from "../../Actions/Api";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const MyKids = ({ route, navigation }) => {
  const { kidId } = route.params;
  const [kidDetails, setKidDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('en');
  const [isModalVisible, setIsModalVisible] = useState(false);
  console.log(kidDetails, '--------');


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

  const MyKids = language === 'en' ? 'My Kids' : 'أطفالي';
  const Sex = language === 'en' ? 'Gender' : 'الجنس';
  const DOB = language === 'en' ? 'Date of Birth' : 'تاريخ الميلاد';
  const MedicalHistory = language === 'en' ? 'Medical History' : 'التقارير الطبية';  
  const VaccinationCertificate = language === 'en' ? 'Vaccination Certificate' : 'شهادة التطعيم';
  const Booking = language === 'en' ? 'Booking' : 'حجز موعد';
  const ReportsandSickLeave = language === 'en' ? 'Reports and Sick Leave' : 'التقارير والإجازات المرضية';
  const TeleMedicine = language === 'en' ? 'Tele Medicine' : 'العلاج عن بعد';

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
    const fetchKidDetails = async () => {
      try {
        // Get the token from AsyncStorage
        const token = await AsyncStorage.getItem('access_token');

        if (!token) {
          console.log('No access token found');
          return;
        }

        // Fetch data with the token in the headers
        const response = await fetch(`${BASE_URL}/api/children/${kidId}/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setKidDetails(data);
          setLoading(false);
        } else {
          console.error('Failed to fetch kid details:', response.status);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching kid details:", error);
        setLoading(false);
      }
    };

    fetchKidDetails();
  }, [kidId]);

  if (loading) {
    return <ActivityIndicator size="large" color="#2a4770" />;
  }

  if (!kidDetails) {
    return <Text>No kid details found</Text>;
  }

  // Safely check for the gender before calling toLowerCase
  const genderImage = kidDetails.gender
    ? (kidDetails.gender.toLowerCase() === 'female'
      ? require('../../assets/girl.jpg')
      : require('../../assets/boy.jpg'))
    : null;

  // Conditionally apply styles based on gender
  const cardStyle = kidDetails.gender.toLowerCase() === 'female' ? styles.cardBlack : styles.cardGreen;

  return (
    <ScrollView >
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
        <View style={styles.header}>
          {/* Language Switcher Icon */}
          <TouchableOpacity
            style={styles.languageIcon}
            onPress={() => setIsModalVisible(true)}
          >
            <MaterialIcons name="language" size={34} color="white" />
          </TouchableOpacity>

          {/* Back Button Icon */}
    
        </View>
        <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <FontAwesome name="angle-left" size={34} color="rgba(24,212,184,255)" />
          </TouchableOpacity>
        {/* Section Title */}
        <View style={styles.textSection}>
          <Text style={styles.text}>{MyKids}</Text>
          <View style={styles.borderLine} />
        </View>

        {/* Kid Details Card with Conditional Style */}
        <View style={[styles.card, cardStyle]}>
          <Image
            source={genderImage}
            style={styles.profileImage}
          />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{kidDetails.full_name}</Text>
            <Text style={styles.cardSubtitle}>
              {DOB}: {kidDetails.date_of_birth} | {Sex}: {kidDetails.gender}
            </Text>
          </View>
        </View>

        {/* Icon and Button Row */}
        <View style={styles.row}>
          <TouchableOpacity style={styles.sideIcon} onPress={() => navigation.navigate('MedicalHistory', { kidDetails })}>
            <MaterialIcons name="info" size={30} color="#2a4770" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.medicalHistoryButton} onPress={() => navigation.navigate('MedicalHistory', { kidDetails })}>
            <Text style={styles.medicalHistoryText}>{MedicalHistory}</Text>
          </TouchableOpacity>
        </View>

        {/* Additional Buttons and Icons */}
        <View style={styles.row}>
          <TouchableOpacity style={styles.sideIcon} onPress={() => navigation.navigate('Vaccination', { kidDetails })}>
            <MaterialIcons name="local-hospital" size={30} color="#2a4770" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.medicalHistoryButton}
            onPress={() => navigation.navigate('Vaccination', { kidDetails })}  // Navigate to 'Vaccination' page
          >
            <Text style={styles.medicalHistoryText}>{VaccinationCertificate}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity style={styles.sideIcon} onPress={() => navigation.navigate('BookDoctor')} >
            <MaterialIcons name="book" size={30} color="#2a4770" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.medicalHistoryButton}
            onPress={() => navigation.navigate('BookDoctor')} // Navigate to the Booking page
          >
            <Text style={styles.medicalHistoryText}>{Booking}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity style={styles.sideIcon} onPress={() => navigation.navigate('ReportsSick', { childId: kidDetails.id })}>
            <MaterialIcons name="assignment" size={30} color="#2a4770" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.medicalHistoryButton}
            onPress={() => navigation.navigate('ReportsSick', { childId: kidDetails.id })}
          >
            <Text style={styles.medicalHistoryText}>{ReportsandSickLeave}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity style={styles.sideIcon} onPress={() => navigation.navigate('TeleMedicine')}>
            <MaterialIcons name="phone-in-talk" size={30} color="#2a4770" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.medicalHistoryButton}
            onPress={() => navigation.navigate('TeleMedicine')} // Navigate to the TeleMedicine page
          >
            <Text style={styles.medicalHistoryText}>{TeleMedicine}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    flex: 1,
  },

  header: {
    width: '100%',
    backgroundColor: 'rgba(24,212,184,255)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop:28,
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

  backButton: {
    padding: 10,
    position: 'absolute',  // Position it absolutely within the parent container
    left: 0,               // Align it to the left
    top: 80,               // You can adjust the top value if needed
  },

  card: {
    width: '90%',
    flexDirection: 'row',
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    padding: 10,
    marginBottom: 20,
    alignItems: 'center',
  },

  cardGreen: {
    backgroundColor: 'rgba(24,212,184,255)',
  },
  cardBlack: {
    backgroundColor: '#000',
  },

  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 10,
  },

  cardContent: {
    flex: 1,
    alignItems: 'flex-end',
    textAlign: 'right',
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2a4770',
    textAlign: 'right',
  },

  cardSubtitle: {
    fontSize: 14,
    color: '#2a4770',
    marginTop: 5,
    textAlign: 'right',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    alignItems: 'center',
    marginVertical: 20,
    backgroundColor: 'rgba(24,212,184,255)',
    padding: 10,
  },

  sideIcon: {
    flex: 1,
    alignItems: 'flex-start',
  },

  medicalHistoryButton: {
    flex: 1,
    alignItems: 'flex-end',
    backgroundColor: 'rgba(24,212,184,255)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginLeft: 10,
  },

  medicalHistoryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2a4770',
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

export default MyKids;