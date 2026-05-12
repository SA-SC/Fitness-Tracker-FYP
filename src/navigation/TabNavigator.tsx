import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../context/ThemeContext';
import Home from '../screens/Home';
import History from '../screens/History';
import SOS from '../screens/SOS';
import UserProfile from '../screens/UserProfile';
import Settings from '../screens/Settings';
import { TabParamList } from './types';
import { Home as HomeIcon, Activity, AlertCircle, User, Settings as SettingsIcon } from 'lucide-react-native';

const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator = () => {
    const { theme } = useTheme();

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: true,
                tabBarHideOnKeyboard: true,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 24,
                    left: 20,
                    right: 20,
                    backgroundColor: theme.isDark ? 'rgba(28, 28, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                    borderTopWidth: 0,
                    borderRadius: 25,
                    height: 68,
                    paddingBottom: 10,
                    paddingTop: 10,
                    borderWidth: 1,
                    borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    ...theme.shadows.lg,
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.text.tertiary,
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '600',
                    marginBottom: 5,
                },
                animation: 'fade',
            }}
        >
            <Tab.Screen
                name="Home"
                component={Home}
                options={{
                    tabBarIcon: ({ color, size }) => <HomeIcon color={color} size={24} />
                }}
            />
            <Tab.Screen
                name="History"
                component={History}
                options={{
                    tabBarIcon: ({ color, size }) => <Activity color={color} size={24} />
                }}
            />
            <Tab.Screen
                name="SOS"
                component={SOS}
                options={{
                    tabBarIcon: ({ color, size }) => <AlertCircle color={color} size={24} />
                }}
            />
            <Tab.Screen
                name="UserProfile"
                component={UserProfile}
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => <User color={color} size={24} />
                }}
            />
            <Tab.Screen
                name="Settings"
                component={Settings}
                options={{
                    tabBarIcon: ({ color, size }) => <SettingsIcon color={color} size={24} />
                }}
            />
        </Tab.Navigator>
    );
};

export default TabNavigator;
