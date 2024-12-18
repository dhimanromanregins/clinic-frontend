import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, TextInput, ToastAndroid, Modal, FlatList } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from "jwt-decode";
import { Picker } from '@react-native-picker/picker';
import { BASE_URL } from '../../../Actions/Api';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

const WhomeItMayCocern = ({ navigation }) => {
  const [selectedKids, setSelectedKids] = useState([{ id: '', name: '' }]);
  const [kids, setKids] = useState([{ name: '' }]);
  const [concern, setConcern] = useState('');
  const [sentTo, setSentTo] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [ParentName, setParentName] = useState('');
  const [sender, setSender] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [language, setLanguage] = useState('en');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [show, setShow] = useState(false);



  const ToWhomeItMayCocern = language === 'en' ? 'To Whome It May Cocern' : 'إلي من يهمه الأمر';
  const ParentName2 = language === 'en' ? 'Parent Name' : 'أسم الاب / الأم';
  const KidsName = language === 'en' ? 'kids Name' : 'أسم الطفل';
  const From = language === 'en' ? 'From' : 'من';
  const To = language === 'en' ? 'To' : 'إلي';
  const Apply = language === 'en' ? 'Apply' : 'قدم الطلب';
  const AdditionalNotes = language === 'en' ? 'Additional Notes' : 'ملاحظات أضافية';
  const Note1 = language === 'en' ? 'Note: Sick leave is only issued upon medical examination or remote treatment. You will receive the sick leave within 12 working hours if it is approved.' : 'ملاحظة يتم أستخراج الطلب  فقط لمن رافق الطفل في معاينه او مراجعه طبيه';
  const Note2 = language === 'en' ? 'You will receive a companion leave if it is approved within 24 working hours.' : 'سيصلك الكتاب حال تم الموافقة خلال 24 ساعه';

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
          setKids(data); // Set the kids data from API
        } else {
          Alert.alert('Error', 'Failed to fetch children');
        }
      } catch (error) {
        Alert.alert('Error', 'An unexpected error occurred while fetching children');
      }
    };
    fetchChildren();
  }, []);


  const handleAddKid = () => {
    setSelectedKids([...selectedKids, { id: '', name: '' }]);
  };

  const handleKidChange = (index, selectedKidId) => {
    const newSelectedKids = [...selectedKids];
    const selectedKid = kids.find(kid => kid.id === selectedKidId);
    newSelectedKids[index] = { id: selectedKidId, name: selectedKid ? selectedKid.name : '' };
    setSelectedKids(newSelectedKids);
  };

  const getAvailableKids = (selectedKids) => {
    const selectedKidIds = selectedKids.map(kid => kid.id);
    return kids.filter(kid => !selectedKidIds.includes(kid.id));
  };

  const handleRemoveKid = (index) => {
    const newSelectedKids = selectedKids.filter((_, i) => i !== index);
    setSelectedKids(newSelectedKids);
  };


  const onChange = (event, selectedDate) => {
    setShow(false);
  
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setDateTime(formattedDate);
      const fourDaysLater = new Date(selectedDate);
      fourDaysLater.setDate(fourDaysLater.getDate() + 4);
      const formattedFourDaysLater = fourDaysLater.toISOString().split('T')[0];
      setSentTo(formattedFourDaysLater)
      console.log('4 days later:', formattedFourDaysLater);
    }
  };
  const showDatePicker = () => {
    setShow(true);
  };

  const handleSubmit = async () => {
  try {
    // Get the access token from AsyncStorage
    const accessToken = await AsyncStorage.getItem('access_token');

    // Decode the token to get user information (optional based on the backend logic)
    const decodedToken = jwtDecode(accessToken);
    const userId = decodedToken.user_id;

    // Prepare child IDs as a list
    const childNames = selectedKids
            .filter((kid) => kid.id) // Ensure only valid names are included
            .map((kid) => kid.id) // Get the names of the selected kids
            .join(', ');

    // Prepare data object to be sent to the API
    const data = {
      concern: concern,
      user: userId,
      child_name: childNames, // Pass list of child IDs
      sent_to: sentTo,
      sender: sender,
      additional_notes: additionalNotes
    };

    console.log(data, '------------');

    // Send the data to the backend API
    const response = await fetch(`${BASE_URL}/to-whom-it-may-concern/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`, // Send access token for authentication
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();
    console.log(responseData, '7777777777777777 ')

    // Check if the response is successful
    if (response.ok) {
      ToastAndroid.show('Request submitted successfully!', ToastAndroid.SHORT);
      navigation.goBack(); // Navigate back on success
    } else {
      ToastAndroid.show('Failed to submit request: ' + responseData.message, ToastAndroid.LONG);
    }
  } catch (error) {
    console.error(error);
    ToastAndroid.show('An error occurred while submitting the request.', ToastAndroid.LONG);
  }
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
      </View>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <FontAwesome name="angle-left" size={34} color="rgba(24,212,184,255)" />
      </TouchableOpacity>

      {/* Scrollable Content */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "android" ? "height" : "padding"}

      >

        <ScrollView
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 50 }} // Add extra space at the bottom for button visibility
          keyboardShouldPersistTaps="handled" // Ensures tapping outside dismisses the keyboard
        >
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
            <Text style={styles.text}>{ToWhomeItMayCocern}</Text>
            <View style={styles.borderLine} />
          </View>

          <View style={styles.inputGroup}>

            <TextInput
              style={styles.input}
              placeholder="Enter Text"
              value={concern} // Bind to concern state
              onChangeText={setConcern}  // Update concern state
              placeholderTextColor="#fff"
              color="#fff"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{ParentName2}</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Parent Name "
              value={ParentName} // Bind to concern state
              onChangeText={setParentName}  // Update concern state
              placeholderTextColor="#fff" // Change placeholder color here
              color="#fff"
            />
          </View>

          {/* Kid Names Section - Dynamic Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{KidsName}</Text>
            {selectedKids.map((selectedKid, index) => (
              <View key={selectedKid.id || index} style={styles.row}>
                <Picker
                  selectedValue={selectedKid.id}
                  style={{
                    flex: 1,
                    color: '#fff',
                    backgroundColor: '#2a4770',
                    borderRadius: 5,
                  }}
                  onValueChange={(value) => handleKidChange(index, value)}
                >
                  <Picker.Item label="Select Kid" value="" />
                  {kids
                    .filter(
                      (kid) =>
                        !selectedKids.some((sKid) => sKid.id === kid.id) || kid.id === selectedKid.id
                    )
                    .map((kid) => (
                      <Picker.Item key={kid.id} label={kid.full_name} value={kid.id} />
                    ))}
                </Picker>
                {index !== 0 && (
                  <TouchableOpacity onPress={() => handleRemoveKid(index)}>
                    <MaterialIcons name="close" size={24} color="#000" />
                  </TouchableOpacity>
                )}
                {index === selectedKids.length - 1 && (
                  <TouchableOpacity onPress={handleAddKid}>
                    <MaterialIcons name="add" size={24} color="#000" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          {/* To and From Section */}
          <View style={styles.row}>
            <View style={styles.inputGroupHalf}>
              <Text style={styles.label}>{To}</Text>
              <TextInput
                style={styles.dateInput}
                placeholder="Enter To"
                value={sentTo}
                onChangeText={setSentTo}
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

          {/* Additional Notes Section */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{AdditionalNotes}</Text>
            <TextInput
              style={styles.input}
              placeholder="Add your additional notes"
              value={additionalNotes} // Bind to additionalNotes state
              onChangeText={setAdditionalNotes} // Update additionalNotes state
              placeholderTextColor="#fff" // Change placeholder color here
              color="#fff"
            />
          </View>

          {/* Notes Section */}
          <View style={styles.inputGroup}>
            <Text style={styles.note}>
              {Note1}
            </Text>
            <Text style={styles.note}>
              {Note2}
            </Text>
          </View>

          {/* Apply Button */}
          <TouchableOpacity style={styles.applyButton} onPress={handleSubmit}>
            <Text style={styles.applyButtonText}>{Apply}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    width: '100%',
    marginTop: 32,
    backgroundColor: 'rgba(24,212,184,255)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',

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
    marginTop: 0,
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
  inputGroup: {
    marginBottom: 20,
  },
  inputGroupHalf: {
    width: '48%',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2a4770',
    marginBottom: 5,
    textAlign: 'right',
    justifyContent: 'flex-end',
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    fontSize: 16,
    backgroundColor: '#2a4770',
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
    marginTop: 0,
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
    // marginTop: 20,
    padding: 7,
    marginLeft: 1,
    marginRight: 2,
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

export default WhomeItMayCocern;
