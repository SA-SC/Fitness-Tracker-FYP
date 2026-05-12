import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Platform, PermissionsAndroid, Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BleManager, Device } from 'react-native-ble-plx';
import * as Notifications from 'expo-notifications';
import * as IntentLauncher from 'expo-intent-launcher';
import base64 from 'react-native-base64';

//BLE UUIDs - MUST MATCH ESP32 CODE EXACTLY
const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const DATA_CHARACTERISTIC_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';

type HealthData = {
    hr: number;
    spo2: number;
    temp: number;
    steps: number;
    calories: number;
    stress: 'Relaxed' | 'Normal' | 'High';
    fatigue: 'Low' | 'Medium' | 'High';
    vibration: number;
    history: { hr: number[]; steps: number[]; timestamps: string[] };
};

interface BLEContextType {
    isScanning: boolean;
    discoveredDevices: Device[];
    connectedDevice: Device | null;
    isConnected: boolean;
    healthData: HealthData;
    startScan: () => void;
    stopScan: () => void;
    connectToDevice: (deviceId: string) => Promise<void>;
    disconnect: () => void;
    autoReconnect: () => Promise<void>;
    clearHealthData: () => Promise<void>;
}

const defaultHealth: HealthData = {
    hr: 0,
    spo2: 0,
    temp: 0,
    steps: 0,
    calories: 0,
    stress: 'Normal',
    fatigue: 'Low',
    vibration: 0,
    history: { hr: [], steps: [], timestamps: [] },
};

const BLEContext = createContext<BLEContextType | undefined>(undefined);

export const BLEProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const managerRef = useRef<BleManager | null>(null);
    if (!managerRef.current) {
        managerRef.current = new BleManager();
    }
    const manager = managerRef.current;

    const [isScanning, setIsScanning] = useState(false);
    const [discoveredDevices, setDiscoveredDevices] = useState<Device[]>([]);
    const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
    const [healthData, setHealthData] = useState<HealthData>(defaultHealth);

    //Refs declared BEFORE any useEffect
    const lastMagnitude = useRef(0);
    const stepCount = useRef(0);
    const lastStepTime = useRef(0);
    const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    //Load persisted data on mount
    useEffect(() => {
        const loadPersistedData = async () => {
            try {
                const savedHealthData = await AsyncStorage.getItem('@health_data');
                if (savedHealthData) {
                    const parsed = JSON.parse(savedHealthData);
                    setHealthData(parsed);
                    stepCount.current = parsed.steps || 0;
                } else {
                    //Fallbacks for older data if migration needed
                    const savedSteps = await AsyncStorage.getItem('@steps_count');
                    if (savedSteps) stepCount.current = parseInt(savedSteps, 10);

                    const savedHistory = await AsyncStorage.getItem('@health_history');
                    if (savedHistory) {
                        const parsed = JSON.parse(savedHistory);
                        setHealthData(prev => ({ ...prev, history: parsed }));
                    }
                }
            } catch (e) {
                console.error('Failed to load health data', e);
            }
        };
        loadPersistedData();

        return () => {
            manager.destroy();
        };
    }, []);

    //Periodic Save Task
    useEffect(() => {
        const timer = setInterval(async () => {
            try {
                await AsyncStorage.setItem('@steps_count', stepCount.current.toString());
                setHealthData(prev => {
                    const newHistory = { ...prev.history };
                    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    newHistory.hr.push(prev.hr);
                    newHistory.steps.push(stepCount.current);
                    newHistory.timestamps.push(now);
                    if (newHistory.hr.length > 24) {
                        newHistory.hr.shift();
                        newHistory.steps.shift();
                        newHistory.timestamps.shift();
                    }
                    const updatedData = { ...prev, history: newHistory };
                    AsyncStorage.setItem('@health_data', JSON.stringify(updatedData));
                    return updatedData;
                });
            } catch (e) {
                console.error('Failed to save health data', e);
            }
        }, 600000);
        return () => clearInterval(timer);
    }, []);

    //─── PERMISSIONS ─────────────────────────────────────────────────────────────
    const requestPermissions = async (): Promise<boolean> => {
        if (Platform.OS !== 'android') return true;

        const apiLevel = parseInt(Platform.Version.toString(), 10);

        try {
            if (apiLevel < 31) {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: 'Location Permission Required',
                        message: 'This app needs Location access to scan for Bluetooth devices (required by Android).',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'Allow',
                    }
                );
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    Alert.alert('Permission Denied', 'Location permission is required for Bluetooth scanning.');
                    return false;
                }
                return true;
            } else {
                const results = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                ]);

                const scanGranted = results['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED;
                const connectGranted = results['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED;

                if (!scanGranted || !connectGranted) {
                    Alert.alert('Bluetooth Permission Denied', 'Please grant Nearby Devices permission in App Settings.');
                    return false;
                }
                return true;
            }
        } catch (err) {
            console.warn('Permission request error:', err);
            return false;
        }
    };

    //─── SCANNING ────────────────────────────────────────────────────────────────
    const startScan = async () => {
        const state = await manager.state();
        if (state !== 'PoweredOn') {
            Alert.alert('Bluetooth is Off', 'Please turn on Bluetooth in your phone settings, then tap Scan Again.');
            return;
        }

        const hasPermissions = await requestPermissions();
        if (!hasPermissions) return;

        if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);

        setIsScanning(true);
        setDiscoveredDevices([]);

        manager.startDeviceScan(null, { allowDuplicates: false }, (error, device) => {
            if (error) {
                console.error('BLE Scan Error:', error.message);
                setIsScanning(false);
                Alert.alert('Scan Error', `BLE scan failed: ${error.message}`);
                return;
            }
            if (device?.name) {
                setDiscoveredDevices(prev => {
                    const exists = prev.find(d => d.id === device.id);
                    if (!exists) return [...prev, device];
                    return prev;
                });
            }
        });

        scanTimeoutRef.current = setTimeout(() => {
            stopScan();
        }, 15000);
    };

    const stopScan = () => {
        manager.stopDeviceScan();
        setIsScanning(false);
        if (scanTimeoutRef.current) {
            clearTimeout(scanTimeoutRef.current);
            scanTimeoutRef.current = null;
        }
    };

    //─── DATA PROCESSING (SINGLE ATOMIC UPDATE) ─────────────
    const processBluetoothData = (value: string) => {
        try {
            const rawDecoded = base64.decode(value);
            const decoded = rawDecoded.replace(/\0/g, '').trim(); // Remove C-string null terminators
            console.log('Raw BLE Payload received:', decoded); // Help debug any incoming corrupted strings

            const data = JSON.parse(decoded);



            //SINGLE setHealthData call — all vitals + algorithms computed atomically
            setHealthData(prev => {
                const newData = { ...prev };

                //Update raw vitals from ESP32
                if (data.bpm !== undefined) newData.hr = data.bpm;
                if (data.spo2 !== undefined) newData.spo2 = data.spo2;
                if (data.temp !== undefined && data.temp > -40) newData.temp = data.temp;

                //Update vibration
                if (data.vib !== undefined) newData.vibration = data.vib;

                //Steps integration — simply pull native calculated value
                if (data.steps !== undefined) {
                    newData.steps = data.steps;
                    stepCount.current = data.steps; //sync reference for fatigue/history blocks
                } else {
                    newData.steps = stepCount.current;
                }

                //STRESS algorithm: High HR while stationary = stress
                const hr = newData.hr;
                const mag = data.vib ?? newData.vibration;
                let stress: 'Relaxed' | 'Normal' | 'High' = 'Normal';
                if (hr > 100 && mag < 1.5) {
                    stress = 'High';
                } else if (hr > 0 && hr < 70 && mag < 1.2) {
                    stress = 'Relaxed';
                }
                newData.stress = stress;

                //FATIGUE algorithm: Based on cumulative steps
                let fatigue: 'Low' | 'Medium' | 'High' = 'Low';
                if (stepCount.current > 12000) fatigue = 'High';
                else if (stepCount.current > 7000) fatigue = 'Medium';
                newData.fatigue = fatigue;

                //CALORIES algorithm: ~0.04 per step with HR intensity
                const baseCalories = stepCount.current * 0.04;
                const hrIntensity = hr > 110 ? 1.5 : 1.0;
                newData.calories = Math.round(baseCalories * hrIntensity);

                return newData;
            });

            //Handle watch notification trigger
            if (data.notify === 1) {
                handleWatchNotification();
            }

        } catch (error) {
            const rawDecoded = base64.decode(value);
            console.error('Error parsing BLE data:', error, ' | Original Payload:', rawDecoded);
        }
    };

    //─── WATCH NOTIFICATION HANDLER ────────────────────────────────
    const handleWatchNotification = async () => {
        try {
            const pushEnabled = await AsyncStorage.getItem('@push_notifications');
            if (pushEnabled === 'false') return; // Default is enabled (null = enabled)

            await Notifications.scheduleNotificationAsync({
                content: {
                    title: '⌚ Alert from SmartWatch',
                    body: 'Your smartwatch sent you a notification!',
                    sound: 'default',
                },
                trigger: null, //Fire immediately
            });

            //SOS Integration: Launch Native Dialer if active
            const sosActive = await AsyncStorage.getItem('@sos_active');
            if (sosActive === 'true') {
                const contactsData = await AsyncStorage.getItem('emergencyContacts');
                if (contactsData) {
                    const contacts = JSON.parse(contactsData);
                    if (Array.isArray(contacts) && contacts.length > 0) {
                        const telephoneURI = `tel:${contacts[0].number}`;
                        if (Platform.OS === 'android') {
                            await IntentLauncher.startActivityAsync('android.intent.action.CALL', { data: telephoneURI });
                        } else {
                            //iOS Fallback (Prompts)
                            const canOpen = await Linking.canOpenURL(telephoneURI);
                            if (canOpen) {
                                await Linking.openURL(telephoneURI);
                            } else {
                                console.warn('Device cannot handle phone calls.');
                            }
                        }
                    }
                }
            }

        } catch (e) {
            console.error('Failed to send watch notification:', e);
        }
    };

    //─── CONNECTION ──────────────────────────────────────────────────────────────
    const connectToDevice = async (deviceId: string) => {
        try {
            stopScan();
            const device = await manager.connectToDevice(deviceId, {
                autoConnect: false,
                timeout: 10000,
            });

            //Request higher MTU on Android to prevent JSON string truncation (> 20 bytes)
            if (Platform.OS === 'android') {
                try {
                    await device.requestMTU(512);
                } catch (mtuErr) {
                    console.log('MTU request failed:', mtuErr);
                }
            }

            await device.discoverAllServicesAndCharacteristics();
            setConnectedDevice(device);

            //Save paired device ID for auto-reconnect
            await AsyncStorage.setItem('@paired_device_id', deviceId);

            device.monitorCharacteristicForService(
                SERVICE_UUID,
                DATA_CHARACTERISTIC_UUID,
                (err, chr) => {
                    if (err) {
                        console.error('Monitor error:', err);
                        return;
                    }
                    if (chr?.value) processBluetoothData(chr.value);
                }
            );

            device.onDisconnected(() => {
                setConnectedDevice(null);
                console.log('Device disconnected');
            });
        } catch (error: any) {
            console.error('Connection error:', error);
            Alert.alert('Connection Failed', `Could not connect: ${error?.message ?? error}`);
            throw error;
        }
    };

    //─── AUTO-RECONNECT ────────────────────────────────────────────
    const autoReconnect = async () => {
        try {
            const savedDeviceId = await AsyncStorage.getItem('@paired_device_id');
            if (!savedDeviceId) return;

            const state = await manager.state();
            if (state !== 'PoweredOn') {
                //Wait for bluetooth to power on
                return new Promise<void>((resolve) => {
                    const subscription = manager.onStateChange((newState) => {
                        if (newState === 'PoweredOn') {
                            subscription.remove();
                            connectToDevice(savedDeviceId)
                                .then(resolve)
                                .catch(() => resolve()); // Silently fail — user can manually reconnect
                        }
                    }, true);
                    //Timeout after 10 seconds
                    setTimeout(() => {
                        subscription.remove();
                        resolve();
                    }, 10000);
                });
            }

            await connectToDevice(savedDeviceId);
        } catch (e) {
            console.log('Auto-reconnect failed silently:', e);
            //Don't throw — the user can manually pair from DevicePairing
        }
    };

    const disconnect = () => {
        if (connectedDevice) {
            manager.cancelDeviceConnection(connectedDevice.id);
            setConnectedDevice(null);
        }
    };

    //─── DATA CLEARING ───────────────────────────────────────────
    const clearHealthData = async () => {
        setHealthData(defaultHealth);
        stepCount.current = 0;
        await AsyncStorage.multiRemove(['@health_data', '@steps_count', '@health_history']);
    };

    return (
        <BLEContext.Provider
            value={{
                isScanning,
                discoveredDevices,
                connectedDevice,
                isConnected: !!connectedDevice,
                healthData,
                startScan,
                stopScan,
                connectToDevice,
                disconnect,
                autoReconnect,
                clearHealthData,
            }}
        >
            {children}
        </BLEContext.Provider>
    );
};

export const useBLE = () => {
    const context = useContext(BLEContext);
    if (context === undefined) {
        throw new Error('useBLE must be used within a BLEProvider');
    }
    return context;
};
