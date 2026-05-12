import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { X, Info } from 'lucide-react-native';
import Animated, { FadeInDown, ZoomInEasyUp, FadeIn } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export type MetricType = 'hr' | 'spo2' | 'temp' | 'steps' | 'calories' | 'stress' | 'fatigue';

type RangeScaleProps = {
    min: number;
    max: number;
    current: number;
    ranges: { label: string; color: string; start: number; end: number }[];
    unit?: string;
    showMarker?: boolean;
};

const RangeScale = ({ min, max, current, ranges, unit, showMarker = true }: RangeScaleProps) => {
    const { theme } = useTheme();
    const totalRange = max - min;
    const markerPosition = ((Math.min(Math.max(current, min), max) - min) / totalRange) * 100;

    return (
        <View style={styles.scaleContainer}>
            <View style={[styles.scaleBar, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                {ranges.map((range, index) => (
                    <View
                        key={index}
                        style={[
                            styles.scaleSegment,
                            {
                                backgroundColor: range.color,
                                flex: (range.end - range.start) / totalRange,
                                borderTopLeftRadius: index === 0 ? 8 : 0,
                                borderBottomLeftRadius: index === 0 ? 8 : 0,
                                borderTopRightRadius: index === ranges.length - 1 ? 8 : 0,
                                borderBottomRightRadius: index === ranges.length - 1 ? 8 : 0,
                            }
                        ]}
                    />
                ))}
            </View>

            {showMarker && (
                <Animated.View entering={FadeIn.delay(400)} style={[styles.marker, { left: `${markerPosition}%` }]}>
                    <View style={[styles.markerPointer, { backgroundColor: theme.colors.text.primary }]} />
                    <View style={[styles.markerValueContainer, { backgroundColor: theme.colors.text.primary }]}>
                        <Text style={[styles.markerValue, { color: theme.colors.background.primary }]}>{current}{unit}</Text>
                    </View>
                </Animated.View>
            )}

            <View style={styles.rangeLabels}>
                {ranges.map((range, index) => (
                    <View key={index} style={styles.rangeLabelContainer}>
                        <Text style={[styles.rangeLabelText, { color: range.color }]}>
                            {range.label}
                        </Text>
                        <View style={styles.boundaryRow}>
                            <Text style={[styles.boundaryText, { color: theme.colors.text.tertiary }]}>{range.start}</Text>
                            {index === ranges.length - 1 && (
                                <>
                                    <View style={[styles.boundaryLine, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }]} />
                                    <Text style={[styles.boundaryText, { color: theme.colors.text.tertiary }]}>{range.end}</Text>
                                </>
                            )}
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
};

type MetricModalProps = {
    visible: boolean;
    onClose: () => void;
    type: MetricType;
    value: string;
    icon: React.ReactNode;
    accentColor: string;
    showMarker?: boolean;
    showExplanation?: boolean;
    hideDescription?: boolean;
};

const MetricModal = ({
    visible,
    onClose,
    type,
    value,
    icon,
    accentColor,
    showMarker = true,
    showExplanation = false,
    hideDescription = false
}: MetricModalProps) => {
    const { theme } = useTheme();

    const getMetricContent = () => {
        switch (type) {
            case 'hr':
                return {
                    title: "Heart Rate",
                    description: "Standard heart rate for adults is 60-100 BPM at rest.",
                    explanation: "A normal resting heart rate for adults ranges from 60 to 100 beats per minute. Very fit athletes may have resting rates as low as 40 BPM. Factors like fitness level, age, and emotional state can influence this.",
                    component: (
                        <RangeScale
                            min={40} max={140} current={parseInt(value)} unit="BPM" showMarker={showMarker}
                            ranges={[
                                { label: "Low", color: '#4A90E2', start: 40, end: 60 },
                                { label: "Normal", color: '#30D158', start: 60, end: 100 },
                                { label: "High", color: '#FF453A', start: 100, end: 140 },
                            ]}
                        />
                    )
                };
            case 'spo2':
                return {
                    title: "Oxygen Saturation",
                    description: "Normal SpO2 levels range from 95% to 100%.",
                    explanation: "Oxygen saturation measures the percentage of oxygen in your blood. Levels below 90% are considered critical and may indicate hypoxemia, requiring immediate medical attention.",
                    component: (
                        <RangeScale
                            min={85} max={100} current={parseInt(value)} unit="%" showMarker={showMarker}
                            ranges={[
                                { label: "Critical", color: '#FF453A', start: 85, end: 90 },
                                { label: "Caution", color: '#FF9F0A', start: 90, end: 94 },
                                { label: "Normal", color: '#30D158', start: 94, end: 100 },
                            ]}
                        />
                    )
                };
            case 'temp':
                return {
                    title: "Body Temperature",
                    description: "Standard body temperature is typically 36.1°C to 37.2°C.",
                    explanation: "Average body temperature is 36.6°C, but it can vary by individual and physical activity. A fever is generally defined as a temperature above 38°C.",
                    component: (
                        <RangeScale
                            min={34} max={40} current={parseFloat(value)} unit="°C" showMarker={showMarker}
                            ranges={[
                                { label: "Low", color: '#4A90E2', start: 34, end: 36 },
                                { label: "Normal", color: '#30D158', start: 36, end: 37.5 },
                                { label: "High", color: '#FF453A', start: 37.5, end: 40 },
                            ]}
                        />
                    )
                };
            case 'stress':
                return {
                    title: "Stress Level",
                    description: "Based on Heart Rate Variability (HRV).",
                    explanation: "Stress levels are calculated using Heart Rate Variability. Higher variability usually indicates better recovery and lower stress, while low variability may signal physical or mental strain.",
                    component: (
                        <RangeScale
                            min={0} max={100} current={value === 'Normal' ? 30 : 80} showMarker={false}
                            ranges={[
                                { label: "Relaxed", color: '#30D158', start: 0, end: 25 },
                                { label: "Normal", color: '#FF9F0A', start: 25, end: 75 },
                                { label: "High", color: '#FF453A', start: 75, end: 100 },
                            ]}
                        />
                    )
                };
            case 'fatigue':
                return {
                    title: "Fatigue Analysis",
                    description: "Current physical exhaustion level.",
                    explanation: "Fatigue is estimated by analyzing sleep quality, activity history, and heart rate patterns. High fatigue suggests a need for rest and recovery to prevent burnout.",
                    component: (
                        <RangeScale
                            min={0} max={100} current={value === 'Low' ? 20 : 70} showMarker={false}
                            ranges={[
                                { label: "Low", color: '#30D158', start: 0, end: 33 },
                                { label: "Medium", color: '#FF9F0A', start: 33, end: 66 },
                                { label: "High", color: '#FF453A', start: 66, end: 100 },
                            ]}
                        />
                    )
                };
            case 'steps':
                return {
                    title: "Steps Count",
                    description: "Your total steps taken today.",
                    explanation: "Walking 10,000 steps a day is a common goal for general health. It helps improve cardiovascular fitness, bone density, and overall mental well-being.",
                    component: (
                        <View style={styles.summaryContainer}>
                            <Text style={[styles.summaryValue, { color: theme.colors.text.primary }]}>{value}</Text>
                            <Text style={[styles.summarySubtext, { color: theme.colors.text.secondary }]}>Daily Goal: 10,000</Text>
                        </View>
                    )
                };
            case 'calories':
                return {
                    title: "Calories Burned",
                    description: "Estimated energy spent through active movements.",
                    explanation: "Calorie burn depends on your metabolic rate and physical activity. Monitoring active calories helps balance energy intake and expenditure for weight management.",
                    component: (
                        <View style={styles.summaryContainer}>
                            <Text style={[styles.summaryValue, { color: theme.colors.text.primary }]}>{value} <Text style={[styles.unitText, { color: theme.colors.text.secondary }]}>kcal</Text></Text>
                            <Text style={[styles.summarySubtext, { color: theme.colors.text.secondary }]}>Keep moving to burn more!</Text>
                        </View>
                    )
                };
            default:
                return { title: "", description: "", explanation: "", component: null };
        }
    };

    const content = getMetricContent();

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <TouchableOpacity
                    style={styles.modalBackdrop}
                    activeOpacity={1}
                    onPress={onClose}
                />
                <Animated.View
                    entering={ZoomInEasyUp.duration(400)}
                    style={[styles.modalContainer, { backgroundColor: theme.colors.background.card }]}
                >
                    <View style={styles.header}>
                        <View style={styles.titleRow}>
                            <View style={[styles.iconBox, { backgroundColor: `${accentColor}20` }]}>
                                {icon}
                            </View>
                            <Text style={[styles.title, { color: theme.colors.text.primary }]}>{content.title}</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color={theme.colors.text.secondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Only show info box if not explicitly hidden, OR if it's Steps/Calories which always show data context */}
                    {(!hideDescription || type === 'steps' || type === 'calories') && (
                        <View style={[styles.infoBox, { backgroundColor: theme.isDark ? 'rgba(10, 132, 255, 0.1)' : 'rgba(10, 132, 255, 0.05)' }]}>
                            <Info size={16} color={theme.colors.primary} />
                            <Text style={[styles.description, { color: theme.colors.text.secondary }]}>{content.description}</Text>
                        </View>
                    )}

                    <Animated.View entering={FadeInDown.delay(200)} style={styles.body}>
                        {content.component}
                    </Animated.View>

                    {showExplanation && content.explanation && (
                        <Animated.View entering={FadeInDown.delay(400)} style={[styles.explanationBox, { borderTopColor: theme.colors.background.tertiary }]}>
                            <Text style={[styles.explanationText, { color: theme.colors.text.secondary }]}>{content.explanation}</Text>
                        </Animated.View>
                    )}

                    <TouchableOpacity style={[styles.doneButton, { backgroundColor: theme.colors.primary }]} onPress={onClose}>
                        <Text style={styles.doneButtonText}>Got it</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    modalContainer: {
        width: '90%',
        borderRadius: 32,
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    iconBox: {
        padding: 8,
        borderRadius: 12,
    },
    closeButton: {
        padding: 4,
    },
    infoBox: {
        flexDirection: 'row',
        padding: 12,
        borderRadius: 12,
        gap: 10,
        alignItems: 'center',
        marginBottom: 32,
    },
    description: {
        fontSize: 14,
        flex: 1,
        lineHeight: 20,
    },
    body: {
        marginBottom: 32,
    },
    scaleContainer: {
        height: 100,
        justifyContent: 'center',
        position: 'relative',
        marginTop: 20,
    },
    scaleBar: {
        flexDirection: 'row',
        height: 12,
        width: '100%',
        borderRadius: 8,
    },
    scaleSegment: {
        height: '100%',
    },
    marker: {
        position: 'absolute',
        top: -40,
        alignItems: 'center',
        width: 60,
        marginLeft: -30,
    },
    markerPointer: {
        width: 2,
        height: 52,
        marginTop: 8,
    },
    markerValueContainer: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        position: 'absolute',
        top: 0,
    },
    markerValue: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    rangeLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    rangeLabelContainer: {
        flex: 1,
        alignItems: 'flex-start',
    },
    rangeLabelText: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    boundaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    boundaryText: {
        fontSize: 10,
        fontWeight: '600',
    },
    boundaryLine: {
        width: 4,
        height: 1,
    },
    summaryContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    summaryValue: {
        fontSize: 48,
        fontWeight: 'bold',
    },
    unitText: {
        fontSize: 20,
    },
    summarySubtext: {
        fontSize: 14,
        marginTop: 8,
    },
    explanationBox: {
        borderTopWidth: 1,
        paddingTop: 20,
        marginBottom: 32,
    },
    explanationTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    explanationText: {
        fontSize: 14,
        lineHeight: 22,
    },
    doneButton: {
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    doneButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default MetricModal;
