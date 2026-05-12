import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../navigation/types';
import { Bluetooth, Smartphone, Watch, Check, RefreshCw } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import SmoothToggle from '../components/SmoothToggle';
import { useBLE } from '../context/BLEContext';

type DevicePairingNavProp = NativeStackNavigationProp<RootStackParamList, 'DevicePairing'>;

const DevicePairing = () => {
    const { theme } = useTheme();
    const navigation = useNavigation<DevicePairingNavProp>();
    const { 
        isScanning, 
        discoveredDevices, 
        startScan, 
        stopScan, 
        connectToDevice, 
        isConnected 
    } = useBLE();

    const [isBluetoothOn, setIsBluetoothOn] = useState(true);
    const [connectingId, setConnectingId] = useState<string | null>(null);

    useEffect(() => {
        if (isBluetoothOn) {
            startScan();
        } else {
            stopScan();
        }
    }, [isBluetoothOn]);

    useEffect(() => {
        if (isConnected) {
            navigation.replace('Main');
        }
    }, [isConnected]);

    const handlePair = async (id: string) => {
        setConnectingId(id);
        try {
            await connectToDevice(id);
        } catch (error) {
            console.error('Failed to connect:', error);
            setConnectingId(null);
        }
    };

    const renderDeviceItem = ({ item }: { item: any }) => (
        <View style={[styles.deviceItem, { backgroundColor: theme.colors.background.card }]}>
            <View style={styles.deviceInfo}>
                <View style={[styles.iconWrapper, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                    <Watch color={theme.colors.text.primary} size={24} />
                </View>
                <View>
                    <Text style={[styles.deviceName, { color: theme.colors.text.primary }]}>{item.name || 'Unknown Device'}</Text>
                    <Text style={[styles.deviceSignal, { color: theme.colors.text.secondary }]}>ID: {item.id}</Text>
                </View>
            </View>

            <TouchableOpacity
                style={[styles.pairButton, { backgroundColor: `${theme.colors.primary}26` }, connectingId === item.id && styles.pairButtonDisabled]}
                onPress={() => handlePair(item.id)}
                disabled={!!connectingId}
            >
                {connectingId === item.id ? (
                    <ActivityIndicator color={theme.colors.primary} size="small" />
                ) : (
                    <Text style={[styles.pairButtonText, { color: theme.colors.primary }]}>Pair</Text>
                )}
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>Connect Device</Text>
                <Text style={[styles.headerSubtitle, { color: theme.colors.text.secondary }]}>Pairing with your SmartHealthWatch to sync health data.</Text>
            </View>

            <View style={[styles.card, { backgroundColor: theme.colors.background.card }]}>
                <View style={styles.row}>
                    <View style={styles.rowLeft}>
                        <Bluetooth color={isBluetoothOn ? theme.colors.primary : theme.colors.text.tertiary} size={24} />
                        <Text style={[styles.rowText, { color: theme.colors.text.primary }]}>Bluetooth</Text>
                    </View>
                    <SmoothToggle
                        value={isBluetoothOn}
                        onValueChange={setIsBluetoothOn}
                    />
                </View>
            </View>

            {isBluetoothOn && (
                <View style={styles.listContainer}>
                    <View style={styles.listHeader}>
                        <Text style={[styles.listTitle, { color: theme.colors.text.secondary }]}>Nearby Watches</Text>
                        {isScanning ? (
                            <View style={styles.scanningContainer}>
                                <ActivityIndicator size="small" color={theme.colors.primary} />
                                <Text style={[styles.scanningText, { color: theme.colors.primary }]}>Looking for Watch...</Text>
                            </View>
                        ) : (
                            <TouchableOpacity onPress={startScan} style={styles.refreshButton}>
                                <RefreshCw size={16} color={theme.colors.primary} />
                                <Text style={[styles.refreshText, { color: theme.colors.primary }]}>Scan Again</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <FlatList
                        data={discoveredDevices}
                        renderItem={renderDeviceItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            !isScanning ? (
                                <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>No devices found. Try refreshing.</Text>
                            ) : null
                        }
                    />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 60,
    },
    header: {
        marginBottom: 30,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
    },
    card: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 30,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    rowText: {
        fontSize: 18,
        fontWeight: '500',
    },
    listContainer: {
        flex: 1,
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    listTitle: {
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    refreshButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    refreshText: {
        fontSize: 14,
        fontWeight: '600',
    },
    scanningContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    scanningText: {
        fontSize: 14,
    },
    listContent: {
        gap: 12,
    },
    deviceItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
    },
    deviceInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deviceName: {
        fontSize: 16,
        fontWeight: '600',
    },
    deviceSignal: {
        fontSize: 12,
    },
    pairButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    pairButtonDisabled: {
        opacity: 0.7,
    },
    pairButtonText: {
        fontWeight: '600',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
    }
});

export default DevicePairing;

