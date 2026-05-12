import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../context/ThemeContext';
import { User, Edit2, Trash2, Calendar, Scale, Ruler } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import EditProfileModal from '../components/EditProfileModal';
import ConfirmationModal from '../components/ConfirmationModal';

type UserProfileNavProp = NativeStackNavigationProp<RootStackParamList>;

const UserProfile = () => {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<UserProfileNavProp>();
    const [user, setUser] = useState({
        name: 'User',
        age: 25,
        weight: 70,
        height: 170,
    });
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const name = await AsyncStorage.getItem('userName') || 'User';
            const age = parseInt(await AsyncStorage.getItem('userAge') || '25');
            const weight = parseInt(await AsyncStorage.getItem('userWeight') || '70');
            const height = parseInt(await AsyncStorage.getItem('userHeight') || '170');

            setUser({ name, age, weight, height });
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    };

    const handleSaveProfile = async (name: string, age: number, weight: number, height: number) => {
        try {
            await AsyncStorage.setItem('userName', name);
            await AsyncStorage.setItem('userAge', age.toString());
            await AsyncStorage.setItem('userWeight', weight.toString());
            await AsyncStorage.setItem('userHeight', height.toString());

            setUser({ name, age, weight, height });
        } catch (error) {
            console.error('Error saving user data:', error);
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await AsyncStorage.clear();
            setDeleteModalVisible(false);
            navigation.reset({
                index: 0,
                routes: [{ name: 'Splash' }],
            });
        } catch (error) {
            console.error('Error deleting account:', error);
        }
    };

    const renderStatItem = (label: string, value: string | number, unit: string, icon: React.ReactNode) => (
        <View style={[styles.statItem]}>
            <View style={styles.statIcon}>{icon}</View>
            <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>{value}<Text style={[styles.statUnit, { color: theme.colors.text.secondary }]}>{unit}</Text></Text>
            <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>{label}</Text>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
            <ScrollView
                contentContainerStyle={[
                    styles.content,
                    {
                        paddingTop: insets.top + 20,
                        paddingBottom: insets.bottom + 110
                    }
                ]}
            >
                <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
                    <Text style={[styles.screenTitle, { color: theme.colors.text.primary }]}>My Profile</Text>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(200)} style={styles.avatarSection}>
                    <View style={[styles.avatarContainer, { backgroundColor: theme.colors.background.card, borderColor: theme.colors.background.tertiary }]}>
                        <User size={60} color={theme.colors.text.primary} />
                    </View>
                    <Text style={[styles.userName, { color: theme.colors.text.primary }]}>{user.name}</Text>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(300)} style={[styles.statsGrid, { backgroundColor: theme.colors.background.card, borderColor: theme.colors.background.tertiary }]}>
                    {renderStatItem('Age', user.age, ' yrs', <Calendar size={20} color={theme.colors.primary} />)}
                    {renderStatItem('Weight', user.weight, ' kg', <Scale size={20} color={theme.colors.accent} />)}
                    {renderStatItem('Height', user.height, ' cm', <Ruler size={20} color={theme.colors.secondary} />)}
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(400)} style={styles.actions}>
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.colors.background.card, borderColor: theme.colors.background.tertiary }]} onPress={() => setEditModalVisible(true)}>
                        <Edit2 size={20} color={theme.colors.text.primary} />
                        <Text style={[styles.actionText, { color: theme.colors.text.primary }]}>Edit Profile</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.actionButton, styles.deleteButton, { borderColor: theme.colors.primary }]} onPress={() => setDeleteModalVisible(true)}>
                        <Trash2 size={20} color={theme.colors.primary} />
                        <Text style={[styles.actionText, styles.deleteText]}>Delete Account</Text>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>

            <EditProfileModal
                visible={editModalVisible}
                onClose={() => setEditModalVisible(false)}
                onSave={handleSaveProfile}
                currentData={user}
            />

            <ConfirmationModal
                visible={deleteModalVisible}
                title="Delete Account"
                message="Are you sure you want to delete your account? This will permanently delete all your data and cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleDeleteAccount}
                onCancel={() => setDeleteModalVisible(false)}
                danger
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 20,
    },
    header: {
        marginBottom: 40,
    },
    screenTitle: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    avatarContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        marginBottom: 16,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    userJoined: {
        fontSize: 14,
        marginTop: 4,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statIcon: {
        marginBottom: 8,
        opacity: 0.8,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    statUnit: {
        fontSize: 12,
        fontWeight: 'normal',
    },
    statLabel: {
        fontSize: 12,
        marginTop: 4,
    },
    actions: {
        gap: 16,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 18,
        borderRadius: 16,
        gap: 12,
        borderWidth: 1,
    },
    actionText: {
        fontSize: 16,
        fontWeight: '600',
    },
    deleteButton: {
        backgroundColor: 'rgba(230, 57, 70, 0.1)',
    },
    deleteText: {
        color: '#E63946',
    },
});

export default UserProfile;

