import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ToastAndroid, ActivityIndicator , Modal, FlatList
} from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../Actions/Api';
import { useFocusEffect } from '@react-navigation/native';

const MedicalHistory = ({ navigation }) => {
  // const { kidDetails } = route.params;
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('en');
  const [isModalVisible, setIsModalVisible] = useState(false);


  const MedicalHistory = language === 'en' ? 'Medical History' : 'التاريخ الطبي';
  const Nomedicalhistoryavailable = language === 'en' ? 'No medical history available' : 'لا يوجد تاريخ طبي متاح';
  const Visited = language === 'en' ? 'Visited' : 'تمت زيارتها';

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

  // Fetch medical history from API
  const fetchMedicalHistory = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        ToastAndroid.show('Authentication token not found.', ToastAndroid.LONG);
        setLoading(false);
        return;
      }

      const response = await fetch(`${BASE_URL}/api/user/bookings/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMedicalHistory(data);
        ToastAndroid.show('Medical history fetched successfully.', ToastAndroid.SHORT);
      } else {
        ToastAndroid.show('Failed to fetch medical history.', ToastAndroid.LONG);
      }
    } catch (error) {
      ToastAndroid.show('An error occurred while fetching data.', ToastAndroid.LONG);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicalHistory();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.languageIcon} 
          onPress={() => setIsModalVisible(true)}
        >
          <MaterialIcons name="language" size={34} color="white" />
        </TouchableOpacity>
      </View>

      {/* Back Button */}
      <TouchableOpacity 
        onPress={() => navigation.goBack()} 
        style={styles.backButton}
      >
        <FontAwesome name="angle-left" size={34} color="rgba(24,212,184,255)" />
      </TouchableOpacity>

      {/* Scrollable Content */}
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
        <View style={styles.textSection}>
          <Text style={styles.text}>{MedicalHistory}</Text>
          <View style={styles.borderLine} />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="rgba(24,212,184,255)" />
        ) : medicalHistory.length === 0 ? (
          <Text style={styles.noDataText}>{Nomedicalhistoryavailable}.</Text>
        ) : (
          medicalHistory.map((history, index) => (
            <View key={index} style={styles.card}>
              <LinearGradient 
                colors={['white', 'rgba(24,212,184,1)', 'white']} 
                style={styles.gradientCard}
              >
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{history.date}</Text>
                  <Text style={styles.cardSubtitle}>{Visited}: {history.doctor.name}</Text>
                </View>
              </LinearGradient>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: {
    width: '100%',
    backgroundColor: 'rgba(24,212,184,255)', 
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: 'row', 
    alignItems: 'center',
  },
  languageIcon: { marginRight: 15 },
  backButton: { marginLeft: 10 },
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
  card: {
    width: '100%',
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
  },
  transparentCard: {
    backgroundColor: 'transparent', 
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    flexDirection: 'row',
    alignItems: 'center',
  },
  gradientCard: {
    padding: 15,
    justifyContent: 'center',
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

export default MedicalHistory;
