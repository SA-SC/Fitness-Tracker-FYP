import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-gifted-charts';
import { useTheme } from '../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import MetricModal, { MetricType } from '../components/MetricModal';
import { Heart, Activity, Thermometer, Flame, Brain, Battery, Zap, ChevronRight, Droplets } from 'lucide-react-native';
import { useBLE } from '../context/BLEContext';


const TABS = ['Heart Rate', 'Steps', 'Calories'];



const History = () => {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const [selectedTab, setSelectedTab] = useState('Heart Rate');
    const slideAnim = useSharedValue(1);

    //Educational Modal State
    const [selectedMetric, setSelectedMetric] = useState<{
        type: MetricType;
        title: string;
        icon: React.ReactNode;
    } | null>(null);

    const educationalMetrics: { type: MetricType; title: string; icon: React.ReactNode }[] = [
        { type: 'hr', title: 'Heart Rate', icon: <Heart size={20} color={theme.colors.health.heartRate} fill={theme.colors.health.heartRate} /> },
        { type: 'spo2', title: 'Oxygen Saturation (SpO2)', icon: <Activity size={20} color={theme.colors.health.spo2} /> },
        { type: 'temp', title: 'Body Temperature', icon: <Thermometer size={20} color={theme.colors.health.temperature} /> },
        { type: 'steps', title: 'Daily Steps', icon: <Zap size={20} color={theme.colors.health.steps} /> },
        { type: 'calories', title: 'Calories Burned', icon: <Flame size={20} color={theme.colors.health.calories} /> },
        { type: 'stress', title: 'Stress Level', icon: <Brain size={20} color={theme.colors.health.stress} /> },
        { type: 'fatigue', title: 'Fatigue Monitoring', icon: <Battery size={20} color={theme.colors.health.fatigue} /> },
    ];

    const { healthData } = useBLE();

    const getChartData = () => {
        const { hr, steps, timestamps } = healthData.history;

        //If no data, return minimal placeholder or empty
        if (hr.length === 0) return [{ value: 0, label: 'N/A' }];

        switch (selectedTab) {
            case 'Steps':
                return steps.map((val, idx) => ({ value: val, label: timestamps[idx] }));
            case 'Calories':
                return steps.map((val, idx) => ({ value: Math.round(val * 0.04), label: timestamps[idx] }));
            default: // Heart Rate
                return hr.map((val, idx) => ({ value: val, label: timestamps[idx] }));
        }
    };

    const getChartColor = () => {
        switch (selectedTab) {
            case 'Steps': return theme.colors.accent;
            case 'Calories': return theme.colors.secondary;
            default: return theme.colors.primary;
        }
    };

    const handleTabChange = (tab: string) => {
        slideAnim.value = withTiming(0, { duration: 0 });
        slideAnim.value = withTiming(1, { duration: 300 });
        setSelectedTab(tab);
    };

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: slideAnim.value,
            transform: [{ translateX: (1 - slideAnim.value) * 20 }],
        };
    });

    const data = getChartData();
    const color = getChartColor();

    const getThirdStatLabel = () => {
        if (selectedTab === 'Steps') return 'Total';
        return 'Average';
    };

    const getThirdStatValue = () => {
        const total = data.reduce((a, b) => a + b.value, 0);
        if (selectedTab === 'Steps') return total;
        return Math.round(total / data.length);
    };

    const renderHeader = () => (
        <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>Weekly History</Text>
            <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>Analyze your progress over the last 7 days.</Text>
        </Animated.View>
    );

    const renderTabs = () => (
        <Animated.View entering={FadeInDown.delay(200)} style={[styles.tabsContainer, { backgroundColor: theme.colors.background.card }]}>
            {TABS.map(tab => (
                <TouchableOpacity
                    key={tab}
                    style={[
                        styles.tab,
                        selectedTab === tab && { backgroundColor: color }
                    ]}
                    onPress={() => handleTabChange(tab)}
                >
                    <Text style={[
                        styles.tabText,
                        { color: theme.colors.text.secondary },
                        selectedTab === tab && styles.tabTextActive
                    ]}>{tab}</Text>
                </TouchableOpacity>
            ))}
        </Animated.View>
    );

    return (
        <View style={styles.container}>
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
                    {renderHeader()}
                    {renderTabs()}

                    <Animated.View style={[styles.chartCard, animatedStyle, { backgroundColor: theme.colors.background.card, borderColor: theme.colors.background.tertiary }]}>
                        <View style={styles.chartHeader}>
                            <Text style={[styles.chartTitle, { color: theme.colors.text.primary }]}>{selectedTab} Trend</Text>
                            <Text style={[styles.avgText, { color }]}>
                                Avg: {Math.round(data.reduce((a, b) => a + b.value, 0) / data.length)}
                            </Text>
                        </View>

                        <View style={{ overflow: 'hidden', paddingBottom: 10 }}>
                            <LineChart
                                data={data}
                                color={color}
                                thickness={3}
                                dataPointsColor={color}
                                startFillColor={color}
                                endFillColor={color}
                                startOpacity={0.4}
                                endOpacity={0.1}
                                areaChart
                                curved
                                height={220}
                                rulesColor={theme.colors.background.tertiary}
                                xAxisColor="transparent"
                                yAxisColor="transparent"
                                yAxisTextStyle={{ color: theme.colors.text.secondary, fontSize: 10 }}
                                xAxisLabelTextStyle={{ color: theme.colors.text.secondary, fontSize: 10 }}
                                pointerConfig={{
                                    pointerStripHeight: 160,
                                    pointerStripColor: theme.colors.text.secondary,
                                    pointerStripWidth: 2,
                                    pointerColor: theme.colors.text.secondary,
                                    radius: 6,
                                    pointerLabelWidth: 100,
                                    pointerLabelHeight: 90,
                                    activatePointersOnLongPress: true,
                                    autoAdjustPointerLabelPosition: false,
                                    pointerLabelComponent: (items: any) => {
                                        return (
                                            <View
                                                style={{
                                                    height: 90,
                                                    width: 100,
                                                    justifyContent: 'center',
                                                    alignItems: 'center'
                                                }}>
                                                <Text style={{ color: theme.colors.text.primary, fontSize: 14, marginBottom: 6, textAlign: 'center' }}>
                                                    {items[0].value}
                                                </Text>
                                            </View>
                                        );
                                    },
                                }}
                            />
                        </View>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(400)} style={styles.statsRow}>
                        <View style={[styles.statItem, { backgroundColor: theme.colors.background.card, borderColor: theme.colors.background.tertiary }]}>
                            <Text style={styles.statLabel}>Max</Text>
                            <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>{Math.max(...data.map(d => d.value))}</Text>
                        </View>
                        <View style={[styles.statItem, { backgroundColor: theme.colors.background.card, borderColor: theme.colors.background.tertiary }]}>
                            <Text style={styles.statLabel}>Min</Text>
                            <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>{Math.min(...data.map(d => d.value))}</Text>
                        </View>
                        <View style={[styles.statItem, { backgroundColor: theme.colors.background.card, borderColor: theme.colors.background.tertiary }]}>
                            <Text style={styles.statLabel}>{getThirdStatLabel()}</Text>
                            <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>{getThirdStatValue()}</Text>
                        </View>
                    </Animated.View>

                    {/* Standard Health Metrics Section */}
                    <Animated.View entering={FadeInDown.delay(500)} style={styles.educationSection}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Standard Health Metrics</Text>
                        <View style={styles.educationList}>
                            {educationalMetrics.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.educationCard, { backgroundColor: theme.colors.background.card, borderColor: theme.colors.background.tertiary }]}
                                    onPress={() => setSelectedMetric(item)}
                                >
                                    <Text style={[styles.educationCardText, { color: theme.colors.text.primary }]}>{item.title}</Text>
                                    <View style={[styles.educationIconBox, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }]}>
                                        {item.icon}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Animated.View>

                </ScrollView>
            </LinearGradient>

            {selectedMetric && (
                <MetricModal
                    visible={!!selectedMetric}
                    onClose={() => setSelectedMetric(null)}
                    type={selectedMetric.type}
                    value={healthData[selectedMetric.type as keyof typeof healthData]?.toString() || "0"}
                    icon={selectedMetric.icon}
                    accentColor={theme.colors.primary}

                    showMarker={false}
                    showExplanation={true}
                    hideDescription={true}
                />
            )}
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
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 14,
        marginTop: 4,
    },
    tabsContainer: {
        flexDirection: 'row',
        marginBottom: 24,
        borderRadius: 12,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    tabText: {
        fontWeight: '600',
        fontSize: 12,
    },
    tabTextActive: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    chartCard: {
        borderRadius: 24,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
    },
    chartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    avgText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    statItem: {
        flex: 1,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
    },
    statLabel: {
        fontSize: 12,
        color: '#808080', //Keep gray for label
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    educationSection: {
        marginTop: 32,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    educationList: {
        gap: 12,
    },
    educationCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 18,
        borderRadius: 20,
        borderWidth: 1,
    },
    educationCardText: {
        fontSize: 16,
        fontWeight: '600',
    },
    educationIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default History;
