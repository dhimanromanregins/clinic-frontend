import React, { useState, useEffect , useCallback} from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert , Modal, FlatList} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { BASE_URL } from '../../Actions/Api';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';


const SickLeaveRequest = ({ navigation }) => {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [to, setTo] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [sender, setSender] = useState('');
  const [notes, SetNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [show, setShow] = useState(false);


  const [language, setLanguage] = useState('en');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const SickLeaveRequest2 = language === 'en' ? 'Sick Leave' : 'طلب إجازة مرضية';
  const SelectKid = language === 'en' ? 'Select Kid' : 'حدد طفل';
  const From = language === 'en' ? 'From' : 'من';
  const To = language === 'en' ? 'To' : 'إلي';
  const Apply = language === 'en' ? 'Apply' : 'قدم الطلب';
  const AddtionalNotes = language === 'en' ? 'Addtional Notes' : 'ملاحظات إضافية';
  const Note1 = language === 'en' ? 'Note: Sick leave is only issued upon medical examination or remote treatment. You will receive the sick leave within 12 working hours if it is approved.' : 'ملاحظة يتم أستخراج الإجازات الطبيه فقط عند المعاينه الطبيه';  
  const Note2 = language === 'en' ? 'You will receive a companion leave if it is approved within 24 working hours.' : 'ستصلك الأجازه المرضية في حال تم الموافقة خلال 24 ساعه';  
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


  const onChange = (event, selectedDate) => {
    setShow(false);
  
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setDateTime(formattedDate);
      const fourDaysLater = new Date(selectedDate);
      fourDaysLater.setDate(fourDaysLater.getDate() + 4);
      const formattedFourDaysLater = fourDaysLater.toISOString().split('T')[0];
      setTo(formattedFourDaysLater)
      console.log('4 days later:', formattedFourDaysLater);
    }
  };
  const showDatePicker = () => {
    setShow(true);
  };

  // Fetch children list on component mount
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        const response = await fetch(`${BASE_URL}/children/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setChildren(data);
        } else {
          Alert.alert('Error', 'Failed to fetch children');
        }
      } catch (error) {
        Alert.alert('Error', 'An unexpected error occurred while fetching children');
      }
    };
    fetchChildren();
  }, []);

  // Submit sick leave request
  const handleSubmit = async () => {
    if (!selectedChild || !to || !sender) {
      Alert.alert('Error', 'Please fill all the fields');
      return;
    }

    setIsSubmitting(true);
    try {
      // const token = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${BASE_URL}/api/sick-leave-request/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          children: selectedChild,
          to,
          sender,
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Sick leave request submitted successfully');
        navigation.goBack(); // Navigate back after successful submission
      } else {
        Alert.alert('Error', 'Failed to submit sick leave request');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred while submitting the request');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <View style={styles.textSection}>
          <Text style={styles.text}>{SickLeaveRequest2}</Text>
          <View style={styles.borderLine} />
        </View>

        {/* Kid Selector */}
        <Text style={styles.Newlabel}>{SelectKid}</Text>


        <Picker
          selectedValue={selectedChild}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedChild(itemValue)}
        >
          <Picker.Item label="Select a child" value={null} />
          {children.map((child) => (
            <Picker.Item key={child.id} label={child.full_name} value={child.id} />
          ))}
        </Picker>


        {/* To and From Section */}
        <View style={styles.row}>
          <View style={styles.inputGroupHalf}>
            <Text style={styles.label}>{To}</Text>
            <TextInput
              style={styles.dateInput}
              placeholder="Enter To"
              value={to}
              onChangeText={setTo}
              placeholderTextColor="#fff" // Change placeholder color here
              color="#fff"
              editable={false}  
            />
          </View>
          <View style={styles.inputGroupHalf}>
          <Text style={styles.label}>{From}</Text>
          <TouchableOpacity onPress={showDatePicker}>
                <TextInput
                  style={styles.dateInput}
                  value={dateTime}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#fff"
                  editable={false}
                  maxLength={10}
                />
              </TouchableOpacity>
            {show && (
              <DateTimePicker
                testID="dateTimePicker"
                value={new Date()}
                mode="date"
                display="default"
                onChange={onChange}
              />
            )}
          </View>
        </View>

        {/* Additional Notes */}
        <Text style={styles.label}>{AddtionalNotes}</Text>
        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input1}
            value={notes}
            onChangeText={SetNotes}
            placeholder="Enter Additional Notes"
            placeholderTextColor="#fff"
            textAlign="left"
            multiline
            numberOfLines={4} 
            textAlignVertical="top"
            color= '#fff' 
          />
        </View>

        {/* Apply Button */}
        <TouchableOpacity
          style={[styles.applyButton, isSubmitting && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.applyButtonText}>{isSubmitting ? 'Submitting...' : `${Apply}`}</Text>
        </TouchableOpacity>
        <Text style={styles.note}>
          {Note1}
        </Text>
      </ScrollView>

    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    // Padding for the content inside the ScrollView
  },
  header: {
    width: '100%',
    backgroundColor: 'rgba(24,212,184,255)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
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

  inputGroupHalf: {
    width: '48%',
    marginBottom: 20,
    marginTop: '20',
  },

  Newlabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2a4770',
    marginBottom: 20,
    textAlign: 'right',
    justifyContent: 'flex-end',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2a4770',

    textAlign: 'right',
    justifyContent: 'flex-end',
  },
  input: {

    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    fontSize: 16,
    backgroundColor: '#2a4770',
    color: '#fff',
  },
  input1: {
    height: 100,

  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Ensures even spacing between items
  },
  plusButton: {
    width: 40,
    height: 40,
    backgroundColor: '#2a4770',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginRight: 10,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  applyButton: {
    backgroundColor: 'rgba(24,212,184,255)',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  applyButtonText: {
    color: '#2a4770',
    fontSize: 18,
    fontWeight: 'bold',
  },
  note: {
    fontSize: 16,
    color: '#2a4770',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: 20,
    backgroundColor: '#2a4770',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  dropdownLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'right',
  },

  picker: {
    height: 50,
    width: '100%',
    color: '#fff',
    textAlign: 'center',
    borderRadius: 10,
    backgroundColor: '#2a4770',
    paddingVertical: 0,
    marginTop: -8,
    borderWidth: 5,

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

  dateInput: {
    textAlign: 'center',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    fontSize: 16,
    backgroundColor: '#2a4770',
    color: '#fff',
  },
});

export default SickLeaveRequest;
