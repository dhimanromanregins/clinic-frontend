import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal , FlatList} from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BASE_URL} from '../../Actions/Api'
import { useFocusEffect } from '@react-navigation/native';

const ReportsSick = ({ route, navigation }) => {
  const { childId } = route.params;

  const [childData, setChildData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('en');
  const [isModalVisible, setIsModalVisible] = useState(false);


  const MyKid = language === 'en' ? 'My Kid' : 'ملف طفلي ';
  const Reports = language === 'en' ? 'Medical Reports' : 'التقارير الطبية';
  const Reports2 = language === 'en' ? 'Reports' : 'التقارير الطبيه ';
  const SickLeave = language === 'en' ? 'Sick Leave' : 'إجازه مرضية';
  const ParentSickLeave = language === 'en' ? 'Parent Sick Leave' : 'طلب إجازه مرافق';
  const Towhomitmayconcern = language === 'en' ? 'To Whom May Concern' : 'إلي من يهمه الأمر';
  const Lab = language === 'en' ? 'Lab' : 'المختبر';
  const Receipt = language === 'en' ? 'Precaution' : 'وصفه طبيه';

  const toggleLanguage = async (selectedLanguage) => {
    try {
      setLanguage(selectedLanguage);
      await AsyncStorage.setItem('selectedLanguage', selectedLanguage);
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error saving language to local storage:', error);
    }
  };

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

  
  const languages = [
    { code: 'en', label: 'English' },
    { code: 'ur', label: 'العربية' },
  ];

  useEffect(() => {
    const fetchChildDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (!token) {
          // Handle missing token, possibly navigate to login page
          alert('No token found');
          return;
        }

        const response = await fetch(`${BASE_URL}/api/children/${childId}/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          setChildData(data);
        } else {
          // Handle errors (e.g. child not found, API issues)
          alert('Failed to fetch child data');
        }
      } catch (error) {
        console.error('Error fetching child details:', error);
        alert('Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchChildDetails();
  }, [childId]);

  // Calculate age from date of birth
  const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
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
        <TouchableOpacity onPress={() => setIsModalVisible(true)}>
              <MaterialIcons name="language" size={34} color="white" />
            </TouchableOpacity>

        {/* Back Button Icon */}
      </View>

      {/* Back Button outside of header */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <FontAwesome name="angle-left" size={34} color="rgba(24,212,184,255)" />
      </TouchableOpacity>

      {/* Title Section */}
      <View style={styles.textSection}>
        <Text style={styles.text}>{Reports2} & {SickLeave}</Text>
        <View style={styles.borderLine} />
      </View>

      {/* Child Info */}
      {childData && (
        <View style={[styles.card, styles.cardGreen]}>
          <Image
            source={childData.gender === 'female' ? require('../../assets/boy.jpg') : require('../../assets/girl.jpg')}
            style={styles.profileImage}
          />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{childData.full_name}</Text>
            <Text style={styles.cardSubtitle}>
              Age: {childData.date_of_birth} | Grade: {childData.grade}
            </Text>
          </View>
        </View>
      )}

      {/* Buttons Row */}
      <View style={styles.buttonRow}>
        {/* Sick Leave Button */}
        <TouchableOpacity
          style={[styles.button, styles.buttonShadow]}
          onPress={() => navigation.navigate('MedicalReports',{ childData })}
        >
          <Text style={styles.buttonText}>{Reports}</Text>
        </TouchableOpacity>

        {/* Medical History Button */}
        <TouchableOpacity
          style={[styles.button, styles.buttonShadow]}
          onPress={() =>navigation.navigate('SickLeaveButton', { childId: childId })}
        >
          <Text style={styles.buttonText}>{SickLeave}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        {/* To Whom May Concern Button */}
        <TouchableOpacity
          style={[styles.button, styles.buttonShadow]}
          onPress={() => navigation.navigate('WhomeItMayCocern' ,{ childId :childId })}
        >
          <Text style={styles.buttonText}>{Towhomitmayconcern}</Text>
        </TouchableOpacity>

        {/* Parent Sick Leave Button */}
        <TouchableOpacity
          style={[styles.button, styles.buttonShadow]}
          onPress={() => navigation.navigate('ParentSickLeave',{ childId :childId })}
        >
          <Text style={styles.buttonText}>{ParentSickLeave}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        {/* Receipt Button */}
        <TouchableOpacity
          style={[styles.button, styles.buttonShadow]}
          onPress={() => navigation.navigate('Precautions',{ childId :childId })}
        >
          <Text style={styles.buttonText}>{Receipt}</Text>
        </TouchableOpacity>

        {/* Lab Button */}
        <TouchableOpacity
          style={[styles.button, styles.buttonShadow]}
          onPress={() => navigation.navigate('lab',{ childId :childId })}
        >
          <Text style={styles.buttonText}>{Lab}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    width: '100%',
    marginTop:32,
    backgroundColor: 'rgba(24,212,184,255)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageIcon: {
    marginRight: 15,
  },
  backButton: {
    marginLeft: 10,
  },
  textSection: {
    width: '100%',
    alignItems: 'right',
    marginBottom: 20,
    marginTop: 20,
    paddingLeft: 15,  // Added left padding
    paddingRight: 15, // Added right padding
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2a4770',
    textAlign: 'right',  // This is correct for right-aligning the text
  },
  borderLine: {
    height: 4,
    backgroundColor: '#2a4770',
    marginTop: 10,
    alignSelf: 'stretch', // Ensures it spans the parent's full width
  },
  card: {
    width: '90%',
    flexDirection: 'row',
    borderRadius: 10,
    elevation: 5, // Adds shadow for Android
    shadowColor: '#000', // Adds shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    padding: 10,
    marginBottom: 20,
    alignItems: 'center',

   marginLeft:18,
 },

  cardGreen: {
    backgroundColor: 'black', // Green background
  },

  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40, // Circular image
    marginRight: 10,
  },

  cardContent: {
    flex: 1,
    alignItems: 'flex-end', // Align content to the right
    textAlign: 'right',
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'right',
  },

  cardSubtitle: {
    fontSize: 14,
    color: '#dddddd',
    marginTop: 5,
    textAlign: 'right',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    paddingLeft: 15,  
    paddingRight: 15, 
  },
  button: {
    width: '48%',
    paddingVertical: 15,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(24,212,184,255)', 
    height: 100,
    borderWidth: 2,  
    borderColor: 'rgba(24,212,184,255)', 
  },
  buttonText: {
    fontSize: 18,
    color: '#2a4770', 
  },
  buttonShadow: {
    shadowColor: 'rgba(24,212,184,255)', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.6,  
    shadowRadius: 5, 
    elevation: 10, 
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

export default ReportsSick;