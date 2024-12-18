import React, { useEffect, useState, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// ********************************
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './Screens/accounts/LoginScreen';
import RegisterScreen from './Screens/accounts/RegisterScreen';
import OTPScreen from './Screens/accounts/OTPScreen';
import LoginOTPScreen from './Screens/accounts/LoginOTPScreen';
import ForgotScreen from './Screens/accounts/ForgotScreen';
import ForgetPasswordOTPScreen from './Screens/accounts/ForgetPasswordOTPScreen';
import ResetPassword from './Screens/accounts/ResetPassword';
import Dashboard from './Screens/Dashboard/DashboardScreen';
import BookDoctor from './Screens/Doctors/BookDoctor';
import DoctorProfile from "./Screens/Doctors/DoctorProfile"
import AddDetail from './Screens/Doctors/AddDetail';
import PersonalDetail from './Screens/Dashboard/PersonalDetail';
import Calendar from './Screens/calander/Calendar';
import MyAccount from './Screens/Dashboard/MyAccount';
import MyFiles from './Screens/Dashboard/MyFiles';
// Childern
import MyKids from './Screens/Children/Mykids';
import Kids from './Screens/Children/Kids';
import AddKidsDetail from './Screens/Children/AddKidsDetail';
import TeleMedicine from './Screens/TeleMedicine/TeleMedicine';
import ReportsSick from './Screens/Leaves/ReportsSick';
import SickLeave from './Screens/Leaves/SickLeave';
import SickLeaveButton from './Screens/Leaves/SickLeaveButton';
import SickLeaveRequest from './Screens/Leaves/SickLeaveRequest';
import ParentSick from './Screens/Leaves/Parent/ParentSick';
import ParentSickLeave from './Screens/Leaves/Parent/ParentSickLeave';
import ParentSickLeaveHistory from './Screens/Leaves/Parent/ParentSickLeaveHistory';
import WhomeItMayCocern from './Screens/Leaves/Cocern/WhomeItMayCocern';
import Contact from './Screens/Dashboard/Contact';
import TeleDoctor from './Screens/TeleMedicine/TeleDoctor';
import Vaccination from './Screens/Vaccination/Vaccination';
import MedicalReports from './Screens/Medical/MedicalReports';
import MedicalHistory from './Screens/Medical/MedicalHistory';
import BookingConfirm from './Screens/Doctors/BookingConfirm';
import Setting from './Screens/Dashboard/Setting';
import Notification from './Screens/Dashboard/Notification';
import LabReports from './Screens/Documents/LabReports';
import Precautions from './Screens/Documents/Precautions';
import PrescriptionAll from './Screens/Myfiles/PrescriptionAll';
import AllParentSickLeaves from './Screens/Leaves/Parent/AllParentSickLeaves';
import AllConcern from './Screens/Myfiles/AllConcern';
import AllLabs from './Screens/Myfiles/AllLabs';
import AllSickLeaves from './Screens/Myfiles/AllSickLeaves';
import SplashScreen from './Screens/SplashScree';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { BASE_URL } from './Actions/Api';
import Constants from 'expo-constants';
// ********************************

const Stack = createNativeStackNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Login');
  const [expoPushToken, setExpoPushToken] = useState('');
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    console.log('Device Token: ', expoPushToken);

    const updateDeviceToken = async () => {
      if (expoPushToken) {
        try {
          const accessToken = await AsyncStorage.getItem('access_token');
          if (accessToken) {
            const response = await fetch(`${BASE_URL}/update_user/`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
              },
              body: JSON.stringify({
                device_token: expoPushToken, 
              }),
            });
            if (response.ok) {
              const data = await response.json();
              console.log('Device Token Updated Successfully:', data);
            } else {
              console.error('Failed to update device token:', response.status);
            }
          } else {
            console.log('No access token found in AsyncStorage');
          }
        } catch (error) {
          console.error('Error updating device token:', error);
        }
      }
    };

    updateDeviceToken();
  }, [expoPushToken]);

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => token && setExpoPushToken(token));
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received in foreground:', notification);
    });
    

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('User interacted with the notification:', response);
    });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(notificationListener.current);
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  async function registerForPushNotificationsAsync() {
    let token;
   
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      try {
        const projectId =
          Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        if (!projectId) {
          throw new Error('Project ID not found');
        }
        token = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;
      } catch (e) {
        token = `${e}`;
      }
    } else {
      alert('Must use physical device for Push Notifications');
    }
  
    return token;
  }

  const authCheck = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (token){
        setInitialRoute('Dashboard')
      }
    } catch (error) {
    } finally {
      setTimeout(()=>{
        setIsLoading(false);
      }, 3000);
    }
  };

  useEffect(() => {
    authCheck()
  }, []);

  if (isLoading) {
    return (
      <SplashScreen/>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{
            headerTitle: 'Register',
          }}
        />

        <Stack.Screen
          name="OTP"
          component={OTPScreen}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="LoginOTP"
          component={LoginOTPScreen}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="Forgot"
          component={ForgotScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ForgotOTPVerify"
          component={ForgetPasswordOTPScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ResetPassword"
          component={ResetPassword}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="Dashboard"
          component={Dashboard}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="BookDoctor"
          component={BookDoctor}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="DoctorDetail"
          component={DoctorProfile}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Booking"
          component={AddDetail}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Mykids"
          component={MyKids}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="kids"
          component={Kids}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="AddKids"
          component={AddKidsDetail}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="PersonalDetails"
          component={PersonalDetail}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="TeleMedicine"
          component={TeleMedicine}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ReportsSick"
          component={ReportsSick}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="SickLeave"
          component={SickLeave}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="SickLeaveButton"
          component={SickLeaveButton}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="SickLeaveRequest"
          component={SickLeaveRequest}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ParentSick"
          component={ParentSick}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ParentSickLeave"
          component={ParentSickLeave}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ParentSickLeaveHistory"
          component={ParentSickLeaveHistory}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="WhomeItMayCocern"
          component={WhomeItMayCocern}
          options={{
            headerShown: null,
          }}
        />
        <Stack.Screen
          name="TeleDoctor"
          component={TeleDoctor}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Vaccination"
          component={Vaccination}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="MedicalReports"
          component={MedicalReports}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="MedicalHistory"
          component={MedicalHistory}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Calendar"
          component={Calendar}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="MyAccount"
          component={MyAccount}
          options={{
            headerShown: false,

          }}
        />
        <Stack.Screen
          name="BookingConfirm"
          component={BookingConfirm}
          options={{
            headerShown: false,

          }}
        />
        <Stack.Screen
          name="MyFiles"
          component={MyFiles}
          options={{
            headerShown: false,

          }}
        />
        <Stack.Screen
          name="Setting"
          component={Setting}
          options={{
            headerShown: false,

          }}
        />
        <Stack.Screen
          name="Notification"
          component={Notification}
          options={{
            headerShown: false,

          }}
        />
        <Stack.Screen
          name="Contact"
          component={Contact}
          options={{
            headerShown: false,

          }}
        />
        <Stack.Screen
          name="lab"
          component={LabReports}
          options={{
            headerShown: false,

          }}
        />
        <Stack.Screen
          name="Precautions"
          component={Precautions}
          options={{
            headerShown: false,

          }}
        />
        <Stack.Screen
          name="AllParentSickLeaves"
          component={AllParentSickLeaves}
          options={{
            headerShown: false,

          }}
        />
        <Stack.Screen
          name="PrescriptionAll"
          component={PrescriptionAll}
          options={{
            headerShown: false,

          }}
        />
        <Stack.Screen
          name="AllSickLeaves"
          component={AllSickLeaves}
          options={{
            headerShown: false,

          }}
        />
        <Stack.Screen
          name="AllLabs"
          component={AllLabs}
          options={{
            headerShown: false,

          }}
        />
        <Stack.Screen
          name="AllConcern"
          component={AllConcern}
          options={{
            headerShown: false,

          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

