import React, { useEffect, useState,useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking , Modal, FlatList} from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../Actions/Api';
import { useFocusEffect } from '@react-navigation/native';


const AllConcern = ({ navigation }) => {
  const [sickLeaveRecords, setSickLeaveRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState('en');
  const [isModalVisible, setIsModalVisible] = useState(false);


  const SickLeaveHistory = language === 'en' ? 'Whome May I Concern Documents' : 'تاريخ الإجازات المرضية';
  const SickLeaveDate = language === 'en' ? 'Sick Leave Date' : 'تاريخ الإجازة المرضية'  ;

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

  // Function to fetch the sick leave data
  const fetchParentSickLeaveData = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('access_token'); 
      if (!accessToken) {
        Alert.alert("Error", "Access token is missing!");
        return;
      }

      const response = await fetch(`${BASE_URL}/api/documents/parent/To_whome_may_concern`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSickLeaveRecords(data);
      } else {
        // Alert.alert("Error", "Failed to fetch data!");
        console.log("Failed to fetch data!")
      }
    } catch (error) {
      console.error('Error fetching sick leave data:', error);
      // Alert.alert("Error", "Something went wrong while fetching data!");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchParentSickLeaveData();
  });

  // Function to open the PDF file when clicked
  const openDocument = (documentUrl) => {
    const fullUrl = `${BASE_URL}${documentUrl}`;
    console.log(fullUrl)
    Linking.openURL(fullUrl).catch(err => console.error('Failed to open PDF', err));
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Header Section - Full width */}
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
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <FontAwesome name="angle-left" size={34} color="rgba(24,212,184,255)" />
        </TouchableOpacity> 
      </View>
      
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
        {/* Title Section */}
        <View style={styles.textSection}>
          <Text style={styles.text}>{SickLeaveHistory}</Text>
          <View style={styles.borderLine} />
        </View>

        {isLoading ? (
          <Text>Loading...</Text> // Display loading text while data is being fetched
        ) : (
          // Display the sick leave records
          sickLeaveRecords.map((record, index) => (
            <View key={index} style={[styles.card, { backgroundColor: record.isUrgent ? '#FF0000' : '#000' }]}>
              <TouchableOpacity 
                style={styles.cardContent}
                onPress={() => openDocument(record.document)} // Pass document_url to open it
              >
                {!isNaN(new Date(record.created_at)) && (
                  <Text style={styles.cardTextRight}>
                    {SickLeaveDate}: {new Date(record.created_at).toLocaleDateString()}
                  </Text>
                )}
                {/* record.leave_request_date */}
                <Text style={styles.cardTextRight}>{record.Name || 'Download the PDF'}</Text>
                <MaterialIcons name="picture-as-pdf" size={34} color="#2a4770" />
                
              </TouchableOpacity>
            </View>
          ))
        )}
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
  },
  languageIcon: {
    marginRight: 15,
  },
  backButton: {
    marginLeft: 10,
  },
  textSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2a4770',
  },
  borderLine: {
    height: 4,
    backgroundColor: '#2a4770',
    marginTop: 10,
    alignSelf: 'stretch',
  },
  card: {
    marginTop: 30,
    padding: 15,
    borderRadius: 10,
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    height: 100, // Increased height for the card
    justifyContent: 'center',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end', // Align the content to the right
  },
  cardTextRight: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff', // White text for contrast
    marginRight: 10,
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

export default AllConcern;
