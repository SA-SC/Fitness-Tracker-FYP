import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from './types';
import Splash from '../screens/Splash';
import ProfileSetup from '../screens/ProfileSetup';
import DevicePairing from '../screens/DevicePairing';
import About from '../screens/About';
import TabNavigator from './TabNavigator';
import { useBLE } from '../context/BLEContext';
import { useTheme } from '../context/ThemeContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
    const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);
    const { autoReconnect } = useBLE();
    const { theme } = useTheme();

    useEffect(() => {
        const determineRoute = async () => {
            try {
                const userName = await AsyncStorage.getItem('userName');
                const pairedDeviceId = await AsyncStorage.getItem('@paired_device_id');

                if (!userName) {
                    //First-time user — show splash
                    setInitialRoute('Splash');
                } else if (!pairedDeviceId) {
                    //Has profile but no device — go to pairing
                    setInitialRoute('DevicePairing');
                } else {
                    //Has profile + paired device — go to main and auto-reconnect
                    setInitialRoute('Main');
                    //Fire auto-reconnect in the background (non-blocking)
                    autoReconnect().catch(() => {
                        console.log('Auto-reconnect failed, user can pair manually');
                    });
                }
            } catch (e) {
                console.error('Failed to determine initial route:', e);
                setInitialRoute('Splash');
            }
        };

        determineRoute();
    }, []);

    //Show loading spinner while checking storage
    if (initialRoute === null) {
        return (
            <View style={[styles.loading, { backgroundColor: theme.colors.background.primary }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <Stack.Navigator
            initialRouteName={initialRoute}
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                gestureEnabled: true,
                animationDuration: 400,
            }}
        >
            <Stack.Screen name="Splash" component={Splash} />
            <Stack.Screen name="ProfileSetup" component={ProfileSetup} />
            <Stack.Screen name="DevicePairing" component={DevicePairing} />
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="About" component={About} />
        </Stack.Navigator>
    );
};

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default RootNavigator;
