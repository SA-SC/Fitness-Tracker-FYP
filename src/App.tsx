import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
import RootNavigator from './navigation/RootNavigator';
import { darkTheme, lightTheme, theme as defaultTheme } from './theme';
import * as NavigationBar from 'expo-navigation-bar';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { BLEProvider } from './context/BLEContext';

//Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

function AppContent() {
    const { theme, themeType } = useTheme();

    React.useEffect(() => {
        const hideNavBar = async () => {
            await NavigationBar.setVisibilityAsync('hidden');
        };

        hideNavBar();
        NavigationBar.setBehaviorAsync('inset-touch');
        NavigationBar.setBackgroundColorAsync(theme.colors.background.card);
        NavigationBar.setButtonStyleAsync(themeType === 'dark' ? 'light' : 'dark');
    }, [themeType, theme.colors.background.card]);

    //Set up notification channel for Android
    React.useEffect(() => {
        const setupNotifications = async () => {
            if (require('react-native').Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('hydration', {
                    name: 'Hydration Reminders',
                    importance: Notifications.AndroidImportance.HIGH,
                    vibrationPattern: [0, 250, 250, 250],
                    sound: 'default',
                });
                await Notifications.setNotificationChannelAsync('watch-alerts', {
                    name: 'Watch Alerts',
                    importance: Notifications.AndroidImportance.HIGH,
                    vibrationPattern: [0, 250, 250, 250],
                    sound: 'default',
                });
            }
        };
        setupNotifications();
    }, []);

    return (
        <NavigationContainer theme={{
            ...DarkTheme,
            dark: themeType === 'dark',
            colors: {
                ...DarkTheme.colors,
                primary: theme.colors.primary,
                background: theme.colors.background.primary,
                card: theme.colors.background.card,
                text: theme.colors.text.primary,
                border: theme.colors.background.tertiary,
                notification: theme.colors.status.error,
            },
        }}>
            <StatusBar
                style={themeType === 'dark' ? 'light' : 'dark'}
                translucent={true}
                backgroundColor="transparent"
            />
            <RootNavigator />
        </NavigationContainer>
    );
}

export default function App() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <ThemeProvider>
                    <BLEProvider>
                        <AppContent />
                    </BLEProvider>
                </ThemeProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
