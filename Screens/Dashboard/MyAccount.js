import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Alert, Modal, FlatList } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../Actions/Api';
import { useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

const MyAccount = ({ navigation }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [updatedProfile, setUpdatedProfile] = useState(profile);
    const [language, setLanguage] = useState('en');
    const [isModalVisible, setIsModalVisible] = useState(false);

    const UserDetails = language === 'en' ? 'User Details' : 'معلوماتي';
    const Mobnumber = language === 'en' ? 'Mobile Number' : 'رقم الهاتف';
    const Email = language === 'en' ? 'Email' : 'رقم البريد';
    const KidsRegistred = language === 'en' ? 'Kids Registred' : 'عدد الأطفال';
    const InsuranceType = language === 'en' ? 'Insurance Type' : 'نوع التأمين';
    const DOB = language === 'en' ? 'Date of Birth' : 'تاريخ الميلاد';
    const Sex = language === 'en' ? 'Sex' : 'الجنس';
    const Address = language === 'en' ? 'Address' : 'عنوان';
    const Bio = language === 'en' ? 'Bio' : 'السيرة الذاتية';
    const id = language === 'en' ? 'User Id' : 'معرف المستخدم';

    //   useEffect(() => {
    //     // Create a copy of updatedProfile to avoid mutating the original object
    //     const newData = { ...updatedProfile };

    //     // Remove unwanted fields from the user object
    //     if (newData.user) {
    //         const { device_token, id_number, password, ...userData } = newData.user;
    //         newData.user = userData; // Assign the filtered user data back to the user key
    //     }

    //     // You can now use newData without the unwanted fields
    //     console.log(newData); // For debugging or further use
    //     setUpdatedProfile(newData)

    // }, [updatedProfile]);


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
        const fetchProfile = async () => {
            try {
                const accessToken = await AsyncStorage.getItem('access_token');
                if (accessToken) {
                    const response = await fetch(`${BASE_URL}/api/profile/`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setProfile(data);
                
                        const newData = { ...data };
                        if (newData.user) {
                            const { device_token, id_number, password, phone_number, ...userData } = newData.user;
                            newData.user = userData;
                        }
                        console.log(newData); 
                        console.log('newData>>>', newData);
                        setUpdatedProfile(newData)
                       
                    } else {
                        Alert.alert('Error', 'Failed to fetch profile details');
                    }
                } else {
                    Alert.alert('Error', 'No access token found');
                }
            } catch (error) {
                console.error(error);
                Alert.alert('Error', 'An error occurred while fetching profile details');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleEditChange = (field, value) => {
        setUpdatedProfile(prevState => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleUserEditChange = (field, value) => {
        setUpdatedProfile(prevState => ({
            ...prevState,
            user: {
                ...prevState.user,
                [field]: value,  // Update the specific field within the user object
            },
        }));
    };

    const handleSaveProfile = async () => {
        console.log('***********************', updatedProfile);
        try {
            const accessToken = await AsyncStorage.getItem('access_token');

            if (accessToken) {
                const response = await fetch(`${BASE_URL}/profile/update/`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedProfile),
                });

                if (response.ok) {
                    const data = await response.json();
                    setProfile(updatedProfile);  // Update the profile with new data
                    setEditMode(false);  // Exit edit mode after saving
                    Alert.alert('Success', 'Profile updated successfully');
                } else {
                    Alert.alert('Error', 'Failed to update profile');
                }
            } else {
                Alert.alert('Error', 'No access token found');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'An error occurred while updating the profile');
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

    if (!profile) {
        return (
            <View style={styles.container}>
                <Text>No profile data available</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
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
                <TouchableOpacity
                    style={styles.languageIcon}
                    onPress={() => setIsModalVisible(true)}
                >
                    <MaterialIcons name="language" size={34} color="white" />
                </TouchableOpacity>
            </View>

            {/* Back Button Icon */}
            <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
            >
                <FontAwesome name="angle-left" size={34} color="rgba(24,212,184,255)" />
            </TouchableOpacity>

            {/* Scrollable Content */}
            <ScrollView style={styles.container}>
                {/* Title Section */}
                <View style={styles.textSection}>
                    <Text style={styles.text}>My Account</Text>
                    <View style={styles.borderLine} />
                </View>

                {/* Profile Card */}
                <View style={styles.logoWrapper}>
                <Image
                    source={require('../../assets/profile.jpg')} // Path to logo image
                    style={styles.logo}
                />
            </View>


                <View style={styles.card}>
                    <Text style={styles.cardTitle}>{profile.user.first_name} {profile.user.last_name}</Text>
                    {editMode ? (
                        <>
                            <TextInput
                                style={styles.cardTextEdit}
                                value={updatedProfile.user.first_name || ''}
                                placeholder="First Name"  // Corrected spelling
                                placeholderTextColor="white"  // Corrected spelling
                                onChangeText={(value) => handleUserEditChange('first_name', value)}
                            />
                            <TextInput
                                style={styles.cardTextEdit}
                                value={updatedProfile.user.last_name || ''}
                                placeholder="Last Name"  // Corrected spelling
                                placeholderTextColor="white"  // Corrected spelling
                                onChangeText={(value) => handleUserEditChange('last_name', value)}
                            />
                            <TextInput
                                style={styles.cardTextEdit}
                                value={updatedProfile.email || ''}
                                placeholder="Email"  // Corrected spelling
                                placeholderTextColor="white"  // Corrected spelling
                                onChangeText={(value) => handleEditChange('email', value)}
                            />
                            {/* <TextInput
                                style={styles.cardTextEdit}
                                value={updatedProfile.user.phone_number || ''}
                                placeholder="Phone Number"  // Corrected spelling
                                placeholderTextColor="white"  // Corrected spelling
                                onChangeText={(value) => handleUserEditChange('phone_number', value)}
                            /> */}
                            <TextInput
                                style={styles.cardTextEdit}
                                value={updatedProfile.address || ''}
                                placeholder="Address"  // Corrected spelling
                                placeholderTextColor="white"  // Corrected spelling
                                onChangeText={(value) => handleEditChange('address', value)}
                            />
                            <TextInput
                                style={styles.cardTextEdit}
                                value={updatedProfile.bio || ''}
                                placeholder="Bio"  // Corrected spelling
                                placeholderTextColor="white"  // Corrected spelling
                                onChangeText={(value) => handleEditChange('bio', value)}
                            />
                            <TextInput
                                style={styles.cardTextEdit}
                                value={updatedProfile.date_of_birth || ''}
                                placeholder="DOB"  // Corrected spelling
                                placeholderTextColor="white"  // Corrected spelling
                                onChangeText={(value) => handleEditChange('date_of_birth', value)}
                            />
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={updatedProfile.gender || ''}
                                    style={styles.picker}
                                    onValueChange={(itemValue) => handleEditChange('gender', itemValue)}
                                >
                                    <Picker.Item label="Select Gender" value="" />
                                    <Picker.Item label="Male" value="MALE" />
                                    <Picker.Item label="Female" value="FEMALE" />
                                </Picker>
                                <Text style={styles.selectedValueText}>
                                    {updatedProfile.gender ? updatedProfile.gender : 'Select Gender'}
                                </Text>
                            </View>

                        </>
                    ) : (
                        <>
                            <Text style={styles.cardText}>{id}: {profile.user.id_number}</Text>
                            <Text style={styles.cardText}>{Email}: {profile.email}</Text>
                            <Text style={styles.cardText}>{Mobnumber}: {profile.user.phone_number}</Text>
                            <Text style={styles.cardText}>{Address}: {profile.address}</Text>
                            <Text style={styles.cardText}>{Bio}: {profile.bio}</Text>
                            <Text style={styles.cardText}>{DOB}: {profile.date_of_birth}</Text>
                            <Text style={styles.cardText}>{Sex}: {profile.gender}</Text>
                        </>
                    )}
                </View>

                {/* Edit Button */}
                <TouchableOpacity style={styles.editButton} onPress={() => setEditMode(!editMode)}>
                    <Text style={styles.editButtonText}>{editMode ? 'Cancel' : 'Edit Account'}</Text>
                </TouchableOpacity>

                {/* Save Button */}
                {editMode && (
                    <TouchableOpacity style={styles.editButton} onPress={handleSaveProfile}>
                        <Text style={styles.editButtonText}>Save Changes</Text>
                    </TouchableOpacity>
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
        justifyContent: 'space-between',
    },
    languageIcon: {
        marginRight: 'auto',
    },
    backButton: {
        marginLeft: 10,
        marginTop: 10,
    },
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

    // Profile Image Section
 
    // Profile Card Section
    card: {
        backgroundColor: '#000',
        padding: 15,
        marginVertical: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        alignItems: 'flex-end', // Align text to the right
        marginTop: -14, // Negative margin to pull up the card
        zIndex: 1, // Ensure the card stays below the profile image
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff', // Blue color used in the project
        marginBottom: 10,
    },
    cardText: {
        fontSize: 16,
        color: '#fff', // Black color for text
        marginBottom: 5,
    },
    cardTextEdit: {
        fontSize: 16,
        color: '#fff', // Black color for text
        marginBottom: 5,
        borderWidth: 1,
        borderColor: 'white',
        width: '100%',
        textAlign: 'right'
    },

    // Edit Button Section
    editButton: {
        backgroundColor: 'rgba(24,212,184,255)',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20,
    },
    editButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2a4770',
    },
    logoWrapper: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        width: '100%',
        padding: 0,  
        margin: 0,   
    },
    logo: {
        width: 100, 
        height: 100, 
        resizeMode: 'cover',
        borderRadius: 50,
        borderWidth: 0,
  
        zIndex: 10,
        margin: 0,
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
    pickerContainer: {
        position: 'relative',
        fontSize: 16,
        color: '#fff',
        marginBottom: 5,
        borderWidth: 1,
        borderColor: 'white',
        width: '100%',
        textAlign: 'right'
    },
    picker: {
        height: 40,
        borderWidth: 1,
        paddingHorizontal: 10,
        color: 'black',
        backgroundColor: 'transparent',
        borderColor: 'white',
        width: '100%',
        textAlign: 'right'
    },
    selectedValueText: {
        position: 'absolute',
        right: 10,
        top: 10,
        fontSize: 16,
        color: 'white',
    },

});

export default MyAccount;
