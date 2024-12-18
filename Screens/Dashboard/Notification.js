import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../Actions/Api';

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch access token from AsyncStorage
  const getAccessToken = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      return token;
    } catch (error) {
      console.error('Error fetching token:', error);
      return null;
    }
  };

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    const token = await getAccessToken();

    if (!token) {
      Alert.alert('Error', 'Access token is missing.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/notifications/`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      } else {
        Alert.alert('Error', 'Failed to fetch notifications.');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    const token = await getAccessToken();

    if (!token) {
      Alert.alert('Error', 'Access token is missing.');
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/notifications/${notificationId}/`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ is_read: true }),
        }
      );

      if (response.ok) {
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) =>
            notification.id === notificationId
              ? { ...notification, is_read: true }
              : notification
          )
        );
      } else {
        Alert.alert('Error', 'Failed to mark notification as read.');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Fetch notifications when the component mounts
  useEffect(() => {
    fetchNotifications();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="rgba(24,212,184,255)" />
      </View>
    );
  }

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
        onPress={() => alert('Go Back')} // Replace with `navigation.goBack()` in real usage
        style={styles.backButton}
      >
        <FontAwesome name="angle-left" size={34} color="rgba(24,212,184,255)" />
      </TouchableOpacity>

      {/* Scrollable Content */}
      <ScrollView style={styles.container}>
        {/* Title Section */}
        <View style={styles.textSection}>
          <Text style={styles.text}>Notifications</Text>
          <View style={styles.borderLine} />
        </View>

        {/* Notifications Section */}
        {notifications.map((notification) => (
          <TouchableOpacity
            key={notification.id}
            onPress={() => markAsRead(notification.id)}
            style={styles.notificationSection}
          >
            {/* Text Aligned to Right */}
            <Text
              style={[
                styles.rightAlignedText,
                notification.is_read && styles.readNotification,
              ]}
            >
              {notification.title}
            </Text>
            {/* Dummy Text Aligned to Left */}
            <Text style={styles.leftAlignedText}>{notification.bosy}</Text>
          </TouchableOpacity>
        ))}
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
    alignSelf: 'stretch', // Ensures it spans the parent's full width
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
    height: 100,
  },
  cardBlack: {
    backgroundColor: 'black',
  },
  notificationSection: {
    marginTop: 20,
    marginBottom:20,
  },
  rightAlignedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2a4770',
    textAlign: 'right',
    marginBottom: 5,
  },
  leftAlignedText: {
    fontSize: 14,
    color: '#444',
    textAlign: 'left',
  },

  rightTextContainer: {
    alignItems: 'flex-end', // Aligns text to the right
    marginBottom: 5,
  },
  rightAlignedText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2a4770',
    textAlign: 'right',
  },
  leftTextContainer: {
    alignItems: 'flex-start', // Aligns text to the left
  },
  leftAlignedText: {
    fontSize: 14,
    color: '#444',
    textAlign: 'left',
  },
});

export default Notification;
