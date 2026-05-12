import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Droplets } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    interpolate,
    Extrapolate
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

type HydrationCardProps = {
    glasses: number;
    onPress: () => void;
};

const HydrationCard = ({ glasses, onPress }: HydrationCardProps) => {
    const { theme } = useTheme();
    const progress = useSharedValue(0);
    const goal = 10;
    const percentage = Math.min((glasses / goal) * 100, 100);

    useEffect(() => {
        progress.value = withSpring(percentage / 100, { damping: 15 });
    }, [glasses]);

    const waterStyle = useAnimatedStyle(() => {
        return {
            height: `${progress.value * 100}%`,
        };
    });

    return (
        <TouchableOpacity
            style={[styles.cardContainer, { borderColor: theme.colors.background.tertiary }]}
            onPress={onPress}
            activeOpacity={0.9}
        >
            <LinearGradient
                colors={theme.isDark
                    ? [theme.colors.background.card, 'rgba(255,255,255,0.03)']
                    : [theme.colors.background.card, 'rgba(0,0,0,0.01)']
                }
                style={styles.card}
            >
                {/* Water Level Animation Background */}
                <View style={styles.waterBackground}>
                    <Animated.View style={[styles.waterFill, waterStyle]}>
                        <LinearGradient
                            colors={['rgba(74, 144, 226, 0.4)', 'rgba(74, 144, 226, 0.1)']}
                            style={StyleSheet.absoluteFill}
                        />
                    </Animated.View>
                </View>

                <View style={styles.header}>
                    <View style={[styles.iconContainer, { backgroundColor: `${theme.colors.health.hydration}20` }]}>
                        <Droplets size={20} color={theme.colors.health.hydration} fill={glasses > 0 ? theme.colors.health.hydration : 'transparent'} />
                    </View>
                    <Text style={[styles.statusText, { color: theme.colors.health.hydration }]}>
                        {percentage}%
                    </Text>
                </View>

                <View style={styles.content}>
                    <Text style={[styles.value, { color: theme.colors.text.primary }]}>
                        {glasses}
                        <Text style={[styles.unit, { color: theme.colors.text.secondary }]}> /{goal}</Text>
                    </Text>
                    <Text style={[styles.title, { color: theme.colors.text.secondary }]}>Hydration</Text>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        width: CARD_WIDTH,
        height: 140,
        marginBottom: 16,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
    },
    card: {
        flex: 1,
        padding: 16,
        justifyContent: 'space-between',
    },
    waterBackground: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
        zIndex: -1,
    },
    waterFill: {
        width: '100%',
        backgroundColor: 'rgba(74, 144, 226, 0.15)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    iconContainer: {
        padding: 8,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    content: {
        gap: 2,
    },
    value: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    unit: {
        fontSize: 14,
        fontWeight: 'normal',
    },
    title: {
        fontSize: 14,
    },
});

export default HydrationCard;
