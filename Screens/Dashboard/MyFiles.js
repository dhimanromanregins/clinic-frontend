import React,{useState, useEffect, useCallback} from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal , FlatList, Alert } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { BASE_URL } from '../../Actions/Api';

const MyFiles = ({ navigation }) => {
  const [language, setLanguage] = useState('en');
  const [isModalVisible, setIsModalVisible] = useState(false);


  const MyFiles = language === 'en' ? 'My Files' : 'ملفاتي';
  const Reports = language === 'en' ? 'Medical Reports' : 'التقارير الطبيه ';
  const Reports2 = language === 'en' ? 'Reports' : 'التقارير الطبيه ';
  const SickLeave = language === 'en' ? 'Sick Leave' : 'أجازات المرضية';
  const ParentSickLeave = language === 'en' ? 'Parent Sick Leave' : 'إجازه مرافق';
  const Towhomitmayconcern = language === 'en' ? 'To Whom May Concern' : 'ألي من يهمه الأمر';
  const Lab = language === 'en' ? 'Lab' : 'المختبر';
  const Receipt = language === 'en' ? 'Prescription' : 'وصفة طبيه';

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
    { code: 'ur', label: 'العربية' }
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
        <Text style={styles.text}>{MyFiles} & {Reports2}</Text>
        <View style={styles.borderLine} />
      </View>

      {/* Buttons Row */}
      <View style={styles.buttonRow}>
        {/* Sick Leave Button */}
        <TouchableOpacity
          style={[styles.button, styles.buttonShadow]}
          onPress={() => navigation.navigate('MedicalReports')}
        >
          <Text style={styles.buttonText}>{Reports}</Text>
        </TouchableOpacity>

        {/* Medical History Button */}
        <TouchableOpacity
          style={[styles.button, styles.buttonShadow]}
          onPress={() => navigation.navigate('AllSickLeaves')}
        >
          <Text style={styles.buttonText}>{SickLeave}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        {/* To Whom May Concern Button */}
        <TouchableOpacity
          style={[styles.button, styles.buttonShadow]}
          onPress={() => navigation.navigate('AllConcern')}
        >
          <Text style={styles.buttonText}>{Towhomitmayconcern}</Text>
        </TouchableOpacity>

        {/* Parent Sick Leave Button */}
        <TouchableOpacity
          style={[styles.button, styles.buttonShadow]}
          onPress={() => navigation.navigate('AllParentSickLeaves')}
        >
          <Text style={styles.buttonText}>{ParentSickLeave}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        {/* Receipt Button */}
        <TouchableOpacity
          style={[styles.button, styles.buttonShadow]}
          onPress={() => navigation.navigate('PrescriptionAll')}
        >
          <Text style={styles.buttonText}>{Receipt}</Text>
        </TouchableOpacity>

        {/* Lab Button */}
        <TouchableOpacity
          style={[styles.button, styles.buttonShadow]}
          onPress={() => navigation.navigate('AllLabs')}
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
    backgroundColor: 'rgba(24,212,184,255)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop:30,
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
    marginTop: 20,
    paddingLeft: 15,  // Added left padding
    paddingRight: 15, // Added right padding
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
    alignSelf: 'stretch', // Ensures it spans the parent's full width
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    paddingLeft: 15,  // Added left padding
    paddingRight: 15, // Added right padding
  },
  button: {
    width: '48%',
    paddingVertical: 15,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // White background for the buttons
    height: 100,
    borderWidth: 2,  // Adds a border around the button
    borderColor: 'rgba(24,212,184,255)', // Border color to match the text color
  },
  buttonText: {
    fontSize: 18,
    color: '#2a4770', // Color of the text
  },
  buttonShadow: {
    shadowColor: 'rgba(24,212,184,255)', // Custom shadow color using rgba(24,212,184,255)
    shadowOffset: { width: 0, height: 4 }, // Vertical offset for the shadow (downwards)
    shadowOpacity: 0.6,  // Set shadow opacity
    shadowRadius: 5, // Radius for shadow softness
    elevation: 10, // Elevation for Android shadow effect
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

export default MyFiles;