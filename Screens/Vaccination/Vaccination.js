import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';

const Vaccination = ({ navigation, route }) => {
  const { kidDetails } = route.params;
  return (
    <View style={{ flex: 1 }}>
      {/* Header Section - Full width */}
      <View style={styles.header}>
        {/* Language Switcher Icon */}
        <TouchableOpacity
          style={styles.languageIcon}
          onPress={() => alert('Language switch clicked')}
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
    <Text style={styles.text}>Vaccination Certificate</Text>
    <View style={styles.borderLine} />
  </View>

  <View style={[styles.card, styles.cardBlack]}>
    {/* Conditional Image Based on Gender */}
    <Image
                  source={
                    kidDetails.gender.toLowerCase() === 'female'
                      ? require('../../assets/girl.jpg')
                      : require('../../assets/boy.jpg')
                  }
                  style={styles.profileImage}
                />
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{kidDetails.full_name}</Text>
      <Text style={styles.cardSubtitle}>Age: {kidDetails.date_of_birth} | Grade: {kidDetails.grade}</Text>
    </View>
  </View>
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
    alignItems: 'right',
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
    alignSelf: 'stretch', // Ensures it spans the parent's full width
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75, // Circular image
    marginBottom: 10,
  },

  card: {
    width: '100%',
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
  },

  cardBlack: {
    backgroundColor: 'black', // Green background
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

});

export default Vaccination;
