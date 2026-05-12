import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, PermissionsAndroid, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { Plus, Phone, Trash2, Siren } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AddContactModal from '../components/AddContactModal';
import SmoothToggle from '../components/SmoothToggle';

type Contact = {
    id: string;
    name: string;
    number: string;
};

const SOS = () => {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const [sosEnabled, setSosEnabled] = useState(false);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [modalVisible, setModalVisible] = useState(false);

    //Load contacts and SOS state on mount
    useEffect(() => {
        loadData();
    }, []);

    //Save contacts whenever they change
    useEffect(() => {
        saveContacts();
    }, [contacts]);

    const loadData = async () => {
        try {
            const savedContacts = await AsyncStorage.getItem('emergencyContacts');
            if (savedContacts) {
                setContacts(JSON.parse(savedContacts));
            }

            const savedSosState = await AsyncStorage.getItem('@sos_active');
            if (savedSosState !== null) {
                setSosEnabled(savedSosState === 'true');
            }
        } catch (error) {
            console.error('Error loading SOS data:', error);
        }
    };

    const saveContacts = async () => {
        try {
            await AsyncStorage.setItem('emergencyContacts', JSON.stringify(contacts));
        } catch (error) {
            console.error('Error saving contacts:', error);
        }
    };

    const handleSosToggle = async (val: boolean) => {
        if (val && Platform.OS === 'android') {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CALL_PHONE,
                {
                    title: "Emergency Calling Permission",
                    message: "This app needs calling permission so it can automatically securely dial your Emergency Contact immediately if a critical health alert is detected.",
                    buttonNeutral: "Ask Me Later",
                    buttonNegative: "Cancel",
                    buttonPositive: "Allow"
                }
            );
            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                setSosEnabled(false);
                return;
            }
        }

        setSosEnabled(val);
        await AsyncStorage.setItem('@sos_active', val.toString());
    };

    const handleAddContact = (name: string, number: string) => {
        const newContact: Contact = {
            id: Date.now().toString(),
            name,
            number,
        };
        //Enforce max 1 contact
        setContacts([newContact]);
    };

    const handleDelete = (id: string) => {
        setContacts(contacts.filter(c => c.id !== id));
    };

    const renderContact = (item: Contact) => (
        <View key={item.id} style={[styles.contactItem, { backgroundColor: theme.colors.background.card, borderColor: theme.colors.background.tertiary }]}>
            <View style={styles.contactInfo}>
                <View style={[styles.contactIcon, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                    <Phone size={20} color={theme.colors.text.primary} />
                </View>
                <View>
                    <Text style={[styles.contactName, { color: theme.colors.text.primary }]}>{item.name}</Text>
                    <Text style={[styles.contactNumber, { color: theme.colors.text.secondary }]}>{item.number}</Text>
                </View>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Trash2 size={20} color={theme.colors.primary} />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
            <LinearGradient
                colors={[theme.colors.background.primary, theme.colors.background.secondary]}
                style={styles.gradient}
            >
                <ScrollView
                    contentContainerStyle={[
                        styles.content,
                        {
                            paddingTop: insets.top + 20,
                            paddingBottom: insets.bottom + 110
                        }
                    ]}
                >
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.colors.text.primary }]}>Emergency SOS</Text>
                        <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>Automatically alert contacts when a fall is detected or triggered manually.</Text>
                    </View>

                    <View style={[
                        styles.sosCard,
                        { backgroundColor: theme.colors.background.card, borderColor: theme.colors.background.tertiary },
                        sosEnabled && styles.sosCardActive
                    ]}>
                        <View style={styles.sosIconContainer}>
                            <Siren size={48} color={sosEnabled ? '#FFF' : theme.colors.text.secondary} />
                        </View>
                        <Text style={[styles.sosStatus, { color: sosEnabled ? '#FFFFFF' : theme.colors.text.secondary }]}>
                            {sosEnabled ? 'SOS ACTIVE' : 'SOS DISABLED'}
                        </Text>
                        <Text style={[styles.sosDescription, { color: sosEnabled ? 'rgba(255, 255, 255, 0.9)' : theme.colors.text.secondary }]}>
                            {sosEnabled
                                ? 'Monitoring for falls. Alerts enabled.'
                                : 'Fall detection and emergency alerts are off.'}
                        </Text>
                        <View style={styles.sosToggleRow}>
                            <Text style={[styles.sosToggleLabel, { color: sosEnabled ? '#FFFFFF' : theme.colors.text.primary }]}>SOS Active</Text>
                            <SmoothToggle
                                value={sosEnabled}
                                onValueChange={handleSosToggle}
                                activeColor={sosEnabled ? 'rgba(255, 255, 255, 0.4)' : undefined}
                                inactiveColor={sosEnabled ? 'rgba(255, 255, 255, 0.2)' : undefined}
                            />
                        </View>
                    </View>

                    <View style={styles.contactsSection}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Emergency Contacts</Text>
                            {contacts.length === 0 && (
                                <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
                                    <Plus size={20} color={theme.colors.primary} />
                                    <Text style={styles.addButtonText}>Add</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {contacts.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>No emergency contacts added yet</Text>
                                <Text style={[styles.emptySubtext, { color: theme.colors.text.tertiary }]}>Tap "Add" to create your first contact</Text>
                            </View>
                        ) : (
                            contacts.map(renderContact)
                        )}
                    </View>
                </ScrollView>
            </LinearGradient>

            <AddContactModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onAdd={handleAddContact}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    content: {
        padding: 20,
    },
    header: {
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 14,
        marginTop: 4,
        lineHeight: 20,
    },
    sosToggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 20,
        width: '100%',
    },
    sosToggleLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    sosCard: {
        borderRadius: 24,
        padding: 30,
        alignItems: 'center',
        marginBottom: 40,
        borderWidth: 1,
    },
    sosCardActive: {
        backgroundColor: '#E63946',
        borderColor: '#E63946',
        shadowColor: '#E63946',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    sosIconContainer: {
        marginBottom: 16,
    },
    sosStatus: {
        fontSize: 24,
        fontWeight: '900',
        letterSpacing: 1,
        marginBottom: 8,
    },
    sosStatusActive: {
        color: '#FFF',
    },
    sosDescription: {
        textAlign: 'center',
        marginBottom: 24,
    },
    contactsSection: {
        gap: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    addButtonText: {
        color: '#E63946',
        fontWeight: '600',
    },
    contactItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
    },
    contactInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    contactIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contactName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    contactNumber: {
        fontSize: 14,
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 16,
        marginBottom: 4,
    },
    emptySubtext: {
        fontSize: 14,
    },
});

export default SOS;
