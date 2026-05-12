import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Bell, Smartphone, Trash2, Info, HelpCircle, ChevronRight, LogOut, Clock, X, Mail } from 'lucide-react-native';
import ConfirmationModal from '../components/ConfirmationModal';
import AboutModal from '../components/AboutModal';
import SmoothToggle from '../components/SmoothToggle';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useTheme } from '../context/ThemeContext';
import { useBLE } from '../context/BLEContext';

type SettingsNavProp = NativeStackNavigationProp<RootStackParamList>;

type SettingItem = {
    id: string;
    label: string;
    icon: React.ReactNode;
    type: 'toggle' | 'link' | 'action';
    value?: boolean;
    detail?: string;
    danger?: boolean;
    onPress: (val?: any) => void;
};

const Settings = () => {
    const { theme, themeType, toggleTheme } = useTheme();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<SettingsNavProp>();
    const { isConnected, disconnect, clearHealthData } = useBLE();

    //Persisted toggle states
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [hydrationAlerts, setHydrationAlerts] = useState(false);

    //Modal states
    const [unpairModalVisible, setUnpairModalVisible] = useState(false);
    const [resetModalVisible, setResetModalVisible] = useState(false);
    const [aboutModalVisible, setAboutModalVisible] = useState(false);
    const [helpModalVisible, setHelpModalVisible] = useState(false);
    const [versionModalVisible, setVersionModalVisible] = useState(false);

    //Load persisted toggle states on mount
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const pushVal = await AsyncStorage.getItem('@push_notifications');
                if (pushVal !== null) setNotificationsEnabled(pushVal === 'true');

                const hydroVal = await AsyncStorage.getItem('@hydration_reminder');
                if (hydroVal !== null) setHydrationAlerts(hydroVal === 'true');
            } catch (e) {
                console.error('Failed to load settings:', e);
            }
        };
        loadSettings();
    }, []);

    //─── PUSH NOTIFICATION TOGGLE ────────────────────────────────────────────
    const handleTogglePushNotifications = async (newValue: boolean) => {
        setNotificationsEnabled(newValue);
        await AsyncStorage.setItem('@push_notifications', newValue.toString());
    };

    //─── HYDRATION TOGGLE + SCHEDULING ───────────────────────────────────────
    const handleToggleHydration = async (newValue: boolean) => {
        setHydrationAlerts(newValue);
        await AsyncStorage.setItem('@hydration_reminder', newValue.toString());

        if (newValue) {
            //Request notification permissions first
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') {
                setHydrationAlerts(false);
                await AsyncStorage.setItem('@hydration_reminder', 'false');
                return;
            }

            //Cancel any existing hydration notifications first
            await Notifications.cancelAllScheduledNotificationsAsync();

            //Set up Android notification channel
            await Notifications.setNotificationChannelAsync('hydration', {
                name: 'Hydration Reminders',
                importance: Notifications.AndroidImportance.HIGH,
                sound: 'default',
            });

            //Schedule repeating notification every 60 minutes
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: '💧 Stay Hydrated!',
                    body: 'Time to drink a glass of water. Your body needs it!',
                    sound: 'default',
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                    seconds: 3600, // 60 minutes
                    repeats: true,
                },
            });
        } else {
            //Cancel all scheduled hydration notifications
            await Notifications.cancelAllScheduledNotificationsAsync();
        }
    };

    //─── UNPAIR ──────────────────────────────────────────────────────────────
    const handleUnpair = async () => {
        setUnpairModalVisible(false);
        disconnect();
        await AsyncStorage.removeItem('@paired_device_id');
        navigation.navigate('DevicePairing');
    };

    //─── RESET ALL DATA ──────────────────────────────────────────────────────
    const handleReset = async () => {
        setResetModalVisible(false);
        //Disconnect smartwatch first
        disconnect();
        //Cancel any scheduled notifications
        await Notifications.cancelAllScheduledNotificationsAsync();
        //Clear Context health data and primary storages
        await clearHealthData();
        //Clear ALL leftover storage
        await AsyncStorage.clear();
        //Reset navigation to Splash
        navigation.reset({
            index: 0,
            routes: [{ name: 'Splash' }],
        });
    };

    const sections: { title: string; data: SettingItem[] }[] = [
        {
            title: 'Notifications',
            data: [
                {
                    id: 'notif_push',
                    label: 'Push Notifications',
                    icon: <Bell size={20} color={theme.colors.primary} />,
                    type: 'toggle',
                    value: notificationsEnabled,
                    onPress: () => handleTogglePushNotifications(!notificationsEnabled)
                },
                {
                    id: 'notif_hydro',
                    label: 'Hydration Reminders',
                    icon: <Clock size={20} color={theme.colors.secondary} />,
                    type: 'toggle',
                    value: hydrationAlerts,
                    detail: 'Every hour',
                    onPress: () => handleToggleHydration(!hydrationAlerts)
                },
            ]
        },
        {
            title: 'Device',
            data: [
                {
                    id: 'dev_status',
                    label: 'Device Status',
                    icon: <Smartphone size={20} color={theme.colors.accent} />,
                    type: 'link',
                    detail: isConnected ? 'Connected' : 'Disconnected',
                    onPress: () => { }
                },
                {
                    id: 'dev_unpair',
                    label: 'Unpair Device',
                    icon: <LogOut size={20} color={theme.colors.primary} />,
                    type: 'action',
                    danger: true,
                    onPress: () => setUnpairModalVisible(true)
                },
            ]
        },
        {
            title: 'System',
            data: [
                {
                    id: 'sys_theme',
                    label: 'Dark Mode',
                    icon: <Smartphone size={20} color={theme.colors.text.primary} />,
                    type: 'toggle',
                    value: themeType === 'dark',
                    onPress: toggleTheme
                },
                {
                    id: 'sys_reset',
                    label: 'Reset All Data',
                    icon: <Trash2 size={20} color={theme.colors.primary} />,
                    type: 'action',
                    danger: true,
                    onPress: () => setResetModalVisible(true)
                },
            ]
        },
        {
            title: 'About',
            data: [
                {
                    id: 'abt_about',
                    label: 'About',
                    icon: <Info size={20} color={theme.colors.text.primary} />,
                    type: 'link',
                    onPress: () => setAboutModalVisible(true)
                },
                {
                    id: 'abt_help',
                    label: 'Help & Support',
                    icon: <HelpCircle size={20} color={theme.colors.text.primary} />,
                    type: 'link',
                    onPress: () => setHelpModalVisible(true)
                },
                {
                    id: 'abt_ver',
                    label: 'Version',
                    icon: <Info size={20} color={theme.colors.text.primary} />,
                    type: 'link',
                    detail: '1.0.0',
                    onPress: () => setVersionModalVisible(true)
                },
            ]
        }
    ];

    const renderItem = ({ item }: { item: SettingItem }) => (
        <TouchableOpacity
            style={[styles.row, { backgroundColor: theme.colors.background.card }]}
            onPress={item.type === 'toggle' ? item.onPress : item.onPress}
            activeOpacity={item.type === 'toggle' ? 1 : 0.7}
        >
            <View style={styles.rowLeft}>
                <View style={[
                    styles.iconContainer,
                    { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
                    item.danger && { backgroundColor: `${theme.colors.status.error}15` }
                ]}>
                    {item.icon}
                </View>
                <View>
                    <Text style={[
                        styles.label,
                        { color: theme.colors.text.primary },
                        item.danger && { color: theme.colors.status.error }
                    ]}>{item.label}</Text>
                    {item.detail && item.type === 'toggle' && (
                        <Text style={{ fontSize: 13, color: theme.colors.text.secondary, marginTop: 2 }}>{item.detail}</Text>
                    )}
                </View>
            </View>

            <View style={styles.rowRight}>
                {item.id === 'notif_push' && (
                    <SmoothToggle
                        value={notificationsEnabled}
                        onValueChange={handleTogglePushNotifications}
                    />
                )}
                {item.id === 'notif_hydro' && (
                    <SmoothToggle
                        value={hydrationAlerts}
                        onValueChange={handleToggleHydration}
                    />
                )}
                {item.id === 'sys_theme' && (
                    <SmoothToggle
                        value={themeType === 'dark'}
                        onValueChange={toggleTheme}
                    />
                )}
                {item.type === 'link' && (
                    <View style={styles.linkRight}>
                        {item.detail && <Text style={[styles.detailText, { color: theme.colors.text.secondary }]}>{item.detail}</Text>}
                        <ChevronRight size={20} color={theme.colors.text.secondary} />
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
        <Text style={[styles.sectionHeader, { color: theme.colors.text.secondary }]}>{title}</Text>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
            <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
                <Text style={[styles.screenTitle, { color: theme.colors.text.primary }]}>Settings</Text>
            </View>
            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                renderSectionHeader={renderSectionHeader}
                contentContainerStyle={[
                    styles.content,
                    { paddingBottom: insets.bottom + 110 }
                ]}
                stickySectionHeadersEnabled={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                SectionSeparatorComponent={() => <View style={styles.sectionSeparator} />}
            />

            <ConfirmationModal
                visible={unpairModalVisible}
                title="Unpair Device"
                message="Are you sure you want to disconnect your smartwatch? You'll need to pair it again to continue using the app."
                confirmText="Unpair"
                cancelText="Cancel"
                onConfirm={handleUnpair}
                onCancel={() => setUnpairModalVisible(false)}
                danger
            />

            <ConfirmationModal
                visible={resetModalVisible}
                title="Reset All Data"
                message="This will permanently delete all your health data, profile information, and settings. This action cannot be undone."
                confirmText="Reset"
                cancelText="Cancel"
                onConfirm={handleReset}
                onCancel={() => setResetModalVisible(false)}
                danger
            />

            <AboutModal
                visible={aboutModalVisible}
                onClose={() => setAboutModalVisible(false)}
            />

            <Modal
                visible={helpModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setHelpModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity
                        style={styles.modalBackdrop}
                        activeOpacity={1}
                        onPress={() => setHelpModalVisible(false)}
                    />
                    <Animated.View entering={FadeInDown.duration(300)} style={[styles.infoModal, { backgroundColor: theme.colors.background.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>Help & Support</Text>
                            <TouchableOpacity onPress={() => setHelpModalVisible(false)}>
                                <X size={24} color={theme.colors.text.secondary} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalContent}>
                            <View style={styles.contactInfo}>
                                <View style={[styles.contactItem, { backgroundColor: theme.colors.background.tertiary, borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                                    <View style={[styles.contactIcon, { backgroundColor: theme.colors.background.card }]}>
                                        <Mail size={24} color={theme.colors.accent} />
                                    </View>
                                    <View style={styles.contactItemText}>
                                        <Text style={[styles.contactLabel, { color: theme.colors.text.secondary }]}>Contact Developer</Text>
                                        <Text style={[styles.contactValue, { color: theme.colors.text.primary }]}>Sannan Adil</Text>
                                        <Text style={[styles.contactSubValue, { color: theme.colors.text.secondary }]}>sannanadil.sa@gmail.com</Text>
                                    </View>
                                </View>
                            </View>
                        </ScrollView>
                    </Animated.View>
                </View>
            </Modal>

            <Modal
                visible={versionModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setVersionModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity
                        style={styles.modalBackdrop}
                        activeOpacity={1}
                        onPress={() => setVersionModalVisible(false)}
                    />
                    <Animated.View entering={FadeInDown.duration(300)} style={[styles.infoModal, { backgroundColor: theme.colors.background.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>Version Info</Text>
                            <TouchableOpacity onPress={() => setVersionModalVisible(false)}>
                                <X size={24} color={theme.colors.text.secondary} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.versionInfo}>
                            <Text style={[styles.versionNumber, { color: theme.colors.primary }]}>1.0.0</Text>
                            <Text style={[styles.versionLabel, { color: theme.colors.text.tertiary }]}>Production Build</Text>
                            <View style={{ height: 24 }} />
                            <Text style={[styles.versionText, { color: theme.colors.text.secondary }]}>
                                Your fitness tracker is up to date. This build includes all latest stability improvements and features.
                            </Text>
                            <Text style={[styles.versionCopyright, { color: theme.colors.text.tertiary }]}>© 2026 Fitness Companion. All rights reserved.</Text>
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    screenTitle: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    content: {
        paddingHorizontal: 20,
    },
    sectionHeader: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 32,
        marginBottom: 16,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
    },
    rowRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    linkRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailText: {
        fontSize: 14,
    },
    separator: {
        height: 8,
    },
    sectionSeparator: {
        height: 0,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    infoModal: {
        width: '85%',
        borderRadius: 24,
        padding: 24,
        maxHeight: '70%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    modalContent: {
        gap: 16,
    },
    contactInfo: {
        gap: 16,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        padding: 24,
        borderRadius: 20,
        borderWidth: 1,
    },
    contactIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    contactItemText: {
        flex: 1,
        justifyContent: 'center',
    },
    contactLabel: {
        fontSize: 12,
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    contactValue: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    contactSubValue: {
        fontSize: 15,
        opacity: 0.9,
    },
    versionInfo: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    versionNumber: {
        fontSize: 48,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    versionLabel: {
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    versionText: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
    },
    versionCopyright: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: 16,
    },
});

export default Settings;
