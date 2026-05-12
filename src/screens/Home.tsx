import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useBLE } from '../context/BLEContext';
import MetricCard from '../components/MetricCard';
import HydrationCard from '../components/HydrationCard';
import HydrationModal from '../components/HydrationModal';
import MetricModal, { MetricType } from '../components/MetricModal';
import { Heart, Activity, Thermometer, Flame, Droplets, Brain, Battery, Zap } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const Home = () => {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const { healthData, isConnected } = useBLE();

    const [refreshing, setRefreshing] = useState(false);
    const [userName, setUserName] = useState('User');
    const [hydrationCount, setHydrationCount] = useState(0);
    const [hydrationModalVisible, setHydrationModalVisible] = useState(false);

    //Metric Modal State
    const [selectedMetric, setSelectedMetric] = useState<{
        type: MetricType;
        value: string;
        icon: React.ReactNode;
        accentColor: string;
    } | null>(null);

    //Load user profile and hydration on mount and focus
    useFocusEffect(
        React.useCallback(() => {
            loadUserProfile();
            loadHydration();
        }, [])
    );

    const loadUserProfile = async () => {
        try {
            const name = await AsyncStorage.getItem('userName');
            if (name) {
                setUserName(name);
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    };

    const loadHydration = async () => {
        try {
            const count = await AsyncStorage.getItem('hydrationCount');
            if (count !== null) {
                setHydrationCount(parseInt(count, 10));
            }
        } catch (error) {
            console.error('Error loading hydration:', error);
        }
    };

    const updateHydration = async (count: number) => {
        setHydrationCount(count);
        try {
            await AsyncStorage.setItem('hydrationCount', count.toString());
        } catch (error) {
            console.error('Error saving hydration:', error);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 2000);
    };

    const metricItems = [
        {
            id: 'hr' as MetricType,
            title: "Heart Rate",
            value: `${healthData.hr}`,
            unit: "BPM",
            icon: <Heart size={20} color={theme.colors.health.heartRate} fill={theme.colors.health.heartRate} />,
            accentColor: theme.colors.health.heartRate
        },
        {
            id: 'spo2' as MetricType,
            title: "SpO2",
            value: `${healthData.spo2}`,
            unit: "%",
            icon: <Activity size={20} color={theme.colors.health.spo2} />,
            accentColor: theme.colors.health.spo2,
            status: healthData.spo2 >= 95 ? "Normal" : "Low",
            statusColor: healthData.spo2 >= 95 ? theme.colors.accent : theme.colors.primary
        },
        {
            id: 'temp' as MetricType,
            title: "Temperature",
            value: `${healthData.temp.toFixed(1)}`,
            unit: "°C",
            icon: <Thermometer size={20} color={theme.colors.health.temperature} />,
            accentColor: theme.colors.health.temperature
        },
        {
            id: 'steps' as MetricType,
            title: "Steps",
            value: `${healthData.steps.toLocaleString()}`,
            icon: <Zap size={20} color={theme.colors.health.steps} />,
            accentColor: theme.colors.health.steps,
            status: "On Track",
            statusColor: theme.colors.accent
        },
        {
            id: 'calories' as MetricType,
            title: "Calories",
            value: `${healthData.calories}`,
            unit: "kcal",
            icon: <Flame size={20} color={theme.colors.health.calories} />,
            accentColor: theme.colors.health.calories
        },
        {
            id: 'stress' as MetricType,
            title: "Stress Level",
            value: healthData.stress,
            icon: <Brain size={20} color={theme.colors.health.stress} />,
            accentColor: theme.colors.health.stress,
            status: healthData.stress === 'Normal' ? 'OK' : 'Check',
            statusColor: healthData.stress === 'Relaxed' ? theme.colors.accent : (healthData.stress === 'Normal' ? theme.colors.status.info : theme.colors.primary)
        },
        {
            id: 'fatigue' as MetricType,
            title: "Fatigue",
            value: healthData.fatigue,
            icon: <Battery size={20} color={theme.colors.health.fatigue} />,
            accentColor: theme.colors.health.fatigue
        },
    ];

    const renderHeader = () => (
        <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.header}>
            <View>
                <Text style={[styles.greeting, { color: theme.colors.text.primary }]}>Hello, {userName}</Text>
                <Text style={[styles.subGreeting, { color: theme.colors.text.secondary }]}>
                    {isConnected ? 'Your vitals look good today.' : 'Please connect your watch.'}
                </Text>
            </View>
            <View style={[styles.deviceStatus, { backgroundColor: theme.colors.background.card }]}>
                <View style={[styles.indicator, { backgroundColor: isConnected ? theme.colors.accent : theme.colors.status.error }]} />
                <Text style={[styles.deviceText, { color: isConnected ? theme.colors.accent : theme.colors.status.error }]}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                </Text>
            </View>
        </Animated.View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
            <ScrollView
                contentContainerStyle={[
                    styles.scrollContent,
                    {
                        paddingTop: insets.top + 20,
                        paddingBottom: insets.bottom + 110 // Increased for floating tab bar clearance
                    }
                ]}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
            >
                {renderHeader()}

                <View style={styles.grid}>
                    {metricItems.map((item, index) => (
                        <Animated.View
                            key={index}
                            entering={FadeInDown.delay(200 + index * 50).duration(500)}
                        >
                            <MetricCard
                                {...item}
                                onPress={() => setSelectedMetric({
                                    type: item.id,
                                    value: item.value,
                                    icon: item.icon,
                                    accentColor: item.accentColor
                                })}
                            />
                        </Animated.View>
                    ))}

                    {/* Specialized Hydration Card */}
                    <Animated.View
                        entering={FadeInDown.delay(200 + metricItems.length * 50).duration(500)}
                    >
                        <HydrationCard
                            glasses={hydrationCount}
                            onPress={() => setHydrationModalVisible(true)}
                        />
                    </Animated.View>
                </View>
            </ScrollView>

            {selectedMetric && (
                <MetricModal
                    visible={!!selectedMetric}
                    onClose={() => setSelectedMetric(null)}
                    type={selectedMetric.type}
                    value={selectedMetric.value}
                    icon={selectedMetric.icon}
                    accentColor={selectedMetric.accentColor}
                />
            )}

            <HydrationModal
                visible={hydrationModalVisible}
                onClose={() => setHydrationModalVisible(false)}
                currentGlasses={hydrationCount}
                onUpdate={updateHydration}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    greeting: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    subGreeting: {
        fontSize: 14,
        marginTop: 4,
    },
    deviceStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    deviceText: {
        fontSize: 12,
        fontWeight: '600',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
});

export default Home;

