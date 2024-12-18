import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ToastAndroid, TextInput, ScrollView, Alert, Modal, FlatList } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from "../../Actions/Api"
import { useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const AddDetail = ({ route, navigation }) => {
  const { doctor_details } = route.params;
  const [language, setLanguage] = useState('en');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedKids, setSelectedKids] = useState([{ id: '', name: '' }]);
  const [doctor, setDoctor] = useState(null);
  const [dateTime, setDateTime] = useState('');
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [kids, setKids] = useState(['']);
  const [userId, setUserId] = useState(null);
  const doctorId = doctor_details.id
  const [show, setShow] = useState(false);


  const ChoseKid = language === 'en' ? 'Choose Kid' : 'أختر الطفل';
  const DayandTime = language === 'en' ? 'Day and Time' : 'اليوم و التاريخ';
  const AvailableHours = language === 'en' ? 'Available Hours' : 'المواعيد المتاحه';
  const Book = language === 'en' ? 'Book' : 'احجز موعد';
  const Apply = language === 'en' ? 'Apply' : 'أختر موعد';
  const Noslotsavailable = language === 'en' ? 'No slots available' : 'لا توجد فتحات متاحة';

  const onChange = (event, selectedDate) => {
    setShow(false);
    if (selectedDate) {

      const formattedDate = selectedDate.toISOString().split('T')[0];
      setDateTime(formattedDate);
    }
  };

  const showDatePicker = () => {
    setShow(true);
  };

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
    // Fetch doctor's details
    const fetchDoctorDetails = async () => {
      try {
        const response = await fetch(`${BASE_URL}/doctors/${doctorId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch doctor details');
        }
        const data = await response.json();
        setDoctor(data);
      } catch (error) {
        console.error(error);
        ToastAndroid.show('Failed to fetch doctor details', ToastAndroid.SHORT);

      }
    };

    fetchDoctorDetails();
  }, [doctorId]);

  const handleFetchSlots = async () => {
    if (!dateTime) {
      ToastAndroid.show('Please enter a valid date and time.', ToastAndroid.SHORT);
      return;
    }

    try {
      const selectedDate = dateTime.split(' ')[0];
      const response = await fetch(

        `${BASE_URL}/doctors/${doctorId}/available_slots/?selected_date=${selectedDate}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch available slots');
      }
      const data = await response.json();
      setTimeSlots(data.available_slots || []);
    } catch (error) {
      console.error(error);
      setTimeSlots([]);
      ToastAndroid.show('Failed to fetch available slots', ToastAndroid.SHORT);
    }
  };

  const handleAddKid = () => {
    setSelectedKids([...selectedKids, { id: '', name: '' }]);
  };



  const handleRemoveKid = (index) => {
    const newSelectedKids = selectedKids.filter((_, i) => i !== index);
    setSelectedKids(newSelectedKids);
  };

  const handleKidChange = (index, selectedKidId) => {
    const newSelectedKids = [...selectedKids];
    const selectedKid = kids.find(kid => kid.id === selectedKidId);
    newSelectedKids[index] = { id: selectedKidId, name: selectedKid ? selectedKid.name : '' };
    setSelectedKids(newSelectedKids);
  };


  const handleKidNameChange = (text, index) => {
    const updatedKids = [...kids];
    updatedKids[index] = text; 
    setKids(updatedKids);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleBooking = async () => {
    if (kids.length === 0 || kids.every(kid => kid === '')) {

      ToastAndroid.show('Please add or select a child', ToastAndroid.SHORT);
      return;
    }

    if (!selectedSlot) {
      ToastAndroid.show('Please select a time slot', ToastAndroid.SHORT);
      return;
    }

    const childrenNames = kids.filter(kid => kid !== ''); 

    const bookingData = {
      doctor: doctorId,
      user: 1,  
      children_names: JSON.stringify(childrenNames),
      slot_start: selectedSlot.start,
      slot_end: selectedSlot.end,
      date: dateTime.split(' ')[0],
    };
    console.log(bookingData, '--------------')

    try {
      const accessToken = await AsyncStorage.getItem('access_token');
      if (!accessToken) {
        ToastAndroid.show('User not authenticated. Please log in again.', ToastAndroid.SHORT);
        return;
      }
      const response = await fetch(`${BASE_URL}/book-slot/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        throw new Error('Failed to book the slot');
      }

      const data = await response.json();
      ToastAndroid.show('Your slot has been successfully booked!', ToastAndroid.SHORT);

      navigation.navigate('BookingConfirm', { bookingData, doctor_details });
    } catch (error) {
      console.error(error);
      ToastAndroid.show('Failed to book the slot', ToastAndroid.SHORT);

    }
  };

  if (!doctor) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const handleClear = () => {
    setDateTime(''); 
    setShow(true); 
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
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
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.languageIcon} onPress={() => setIsModalVisible(true)}>
          <MaterialIcons name="language" size={34} color="white" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <FontAwesome name="angle-left" size={34} color="#2a4770" />
      </TouchableOpacity>

      <View style={styles.imageContainer}>
  {doctor?.profile_photo && (
    <Image
      source={{ uri: `${BASE_URL}${doctor.profile_photo}` }}
      style={styles.logo}
    />
  )}
  <View style={styles.blackBox}>
    <Text style={styles.doctorName}>{doctor?.name || 'Doctor Name'}</Text>
    <Text style={styles.doctorDesignation}>{doctor?.specialty || 'Specialty'}</Text>
  </View>
</View>

      <View style={styles.mainContent}>
        <View style={styles.labelContainer}>
          <Text style={styles.inputLabel}>{ChoseKid}</Text>
        </View>
        {selectedKids.map((selectedKid, index) => (
          <View key={index} style={styles.row}>
            <Picker
              selectedValue={selectedKid.id}
              style={{ flex: 1, color: '#fff', backgroundColor: '#2a4770', borderRadius: 20, }}
              onValueChange={(value) => handleKidChange(index, value)}
            >
              <Picker.Item label="Select Kid" value="" />
              {kids
                .filter(kid => !selectedKids.some(sKid => sKid.id === kid.id) || kid.id === selectedKid.id)
                .map(kid => (
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
    
        <View style={styles.dateTimeContainer}>
          <Text style={styles.inputLabel}>{DayandTime}</Text>
          <View style={styles.dateTimeRow}>
            <TouchableOpacity style={styles.applyButton} onPress={handleFetchSlots}>
              <Text style={styles.applyButtonText}>{Apply}</Text>
            </TouchableOpacity>

            {/* <TouchableOpacity>
              <TextInput
                style={styles.input}
                value={dateTime}
                onChangeText={setDateTime}
                placeholder="(YYYY-MM-DD)"
                placeholderTextColor="#A0A0A0"
                onChange={handleClear}
                onFocus={showDatePicker}
              />
              </TouchableOpacity> */}
              <TouchableOpacity onPress={showDatePicker}>
                <TextInput
                  style={styles.dateInput}
                  value={dateTime}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#A0A0A0"
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

        {/* Available Slots */}
        <View style={styles.availableHoursContainer}>
          <Text style={styles.availableHoursText}>{AvailableHours}</Text>
          <View style={styles.borderLine} />
          <View style={styles.timeSlotsContainer}>
            {timeSlots.length > 0 ? (
              timeSlots.map((slot, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.timeSlotBox,
                    selectedSlot === slot && styles.selectedSlot, // Apply selectedSlot style if this slot is selected
                  ]}
                  onPress={() => handleSlotSelect(slot)}
                >
                  <Text style={styles.timeSlotText}>
                    {/* {slot.start} - {slot.end} */}
                    {slot.start}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noSlotsText}>{Noslotsavailable}</Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleBooking} // Call handleBooking on button click
        >
          <Text style={styles.bookButtonText}>{Book}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9f9f9',
    paddingBottom: 20,
  },
  header: {
    width: '100%',
    backgroundColor: 'rgba(24,212,184,255)',
    paddingVertical: 20,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#2a4770',
    marginLeft: 20,
  },
  blackBox: {
    backgroundColor: 'rgba(24,212,184,255)',
    height: 80,
    width: '55%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    padding: 10,
    marginRight: 30,
  },
  languageIcon: {
    padding: 5,
  },
  backButton: {
    padding: 20,
  },
  mainContent: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  labelContainer: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 0,
  },

  inputLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2a4770',
    textAlign: 'right',
    paddingRight: 30,
    marginBottom: 10,

  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'center',
    justifyContent: 'space-between',

  },
  removeButton: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    color: 'black'
  },
  iconContainer: {
    backgroundColor: 'rgba(24,212,184,255)',
    padding: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: '20%',
    height: 50,

  },
  inputField: {
    height: 50, // Set height for the dropdown
    fontSize: 16,
    color: 'white',
    width: '100%', // Occupy 60% width
    backgroundColor: '#2a4770', // Background color for dropdown
    borderRadius: 10, // Rounded corners
    paddingLeft: 10, // Add padding for dropdown text
    marginLeft: '20',
    marginBottom: '5'
  },

  availableHoursContainer: {
    width: '100%',
    marginTop: 30,
    paddingHorizontal: 20,
  },
  availableHoursText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2a4770',
    marginBottom: 10,
    textAlign: 'center',
  },
  borderLine: {
    borderBottomWidth: 1,
    borderColor: '#2a4770',
    marginBottom: 15,
  },
  doctorName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  doctorDesignation: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },

  dateTimeContainer: {
    width: '100%',
    marginTop: 20,
    // flex: 1,
    paddingLeft: 30,
    // flexDirection: 'row',
    // alignItems: 'center',
  },

  dateTimeRow: {
    flexDirection: 'row',  // Arrange button and input in a row
    alignItems: 'center',  // Center vertically
    justifyContent: 'space-between',
    width: '100%',  // Ensure the row takes the full width
    gap: 10,  // Optional: adds space between the input and button
    paddingRight: 20,
  },

  applyButton: {
    backgroundColor: 'rgba(24,212,184,255)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    // Adjust width to fit within container, adjust as needed
  },

  applyButtonText: {
    color: 'white',  // Text color for the button
    fontSize: 16,
  },

  dateTimeInputField: {
    height: 50,
    fontSize: 16,
    color: 'white',
    marginBottom:10,
    width: '30%',  // Adjust width to take up 60% of the row (or adjust as needed)
    backgroundColor: '#2a4770',
    borderRadius: 10,
    paddingLeft: 10,  // Add padding to input text
    // marginRight: '50',  // Avoid large margin that causes overflow
  },

  bookButton: {
    backgroundColor: '#2a4770',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },

  selectedSlot: {
    backgroundColor: '#4CAF50',
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',        // Allows wrapping of elements
    justifyContent: 'space-evenly', // Space out the items evenly in a row
    width: '100%',            // Control the width of the container
  },

  timeSlotBox: {
    width: '32%',            // Each time slot box takes up roughly one-third of the container's width (for 3 items per row)
    marginBottom: 10,        // Add space between rows
    backgroundColor: '#ccc',  // Change as per your style
    padding: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  selectedSlot: {
    backgroundColor: 'rgba(24,212,184,255)',  // Apply background color when selected
  },

  timeSlotText: {
    color: '#2a4770',
    fontSize: 16,
    textAlign: 'center',
  },

  noSlotsText: {
    color: 'gray',
    fontSize: 16,
    textAlign: 'center',
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

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    borderRadius: 10
  },
  dateInput: {
    width: 150,
    padding: 10,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 8,
    // marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#2a4770', 
    color: '#fff', 
    height: 45, 
  },
});

export default AddDetail;
