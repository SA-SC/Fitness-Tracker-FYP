import React, { useEffect } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    interpolateColor,
    withTiming
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';

interface SmoothToggleProps {
    value: boolean;
    onValueChange: (value: boolean) => void;
    activeColor?: string;
    inactiveColor?: string;
}

const TOGGLE_WIDTH = 50;
const TOGGLE_HEIGHT = 28;
const KNOB_SIZE = 22;
const KNOB_MARGIN = 3;
const CROSS_DIST = TOGGLE_WIDTH - KNOB_SIZE - KNOB_MARGIN * 2;

const SmoothToggle = ({
    value,
    onValueChange,
    activeColor,
    inactiveColor
}: SmoothToggleProps) => {
    const { theme } = useTheme();
    const translateX = useSharedValue(value ? CROSS_DIST : 0);

    const finalActiveColor = activeColor || theme.colors.primary;
    const finalInactiveColor = inactiveColor || theme.colors.background.tertiary;

    useEffect(() => {
        translateX.value = withSpring(value ? CROSS_DIST : 0, {
            damping: 15,
            stiffness: 150,
        });
    }, [value]);

    const animatedTrackStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            translateX.value,
            [0, CROSS_DIST],
            [finalInactiveColor, finalActiveColor]
        );
        return { backgroundColor };
    });

    const animatedKnobStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }],
        };
    });

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onValueChange(!value)}
        >
            <Animated.View style={[styles.track, animatedTrackStyle]}>
                <Animated.View style={[styles.knob, animatedKnobStyle]} />
            </Animated.View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    track: {
        width: TOGGLE_WIDTH,
        height: TOGGLE_HEIGHT,
        borderRadius: TOGGLE_HEIGHT / 2,
        padding: KNOB_MARGIN,
        justifyContent: 'center',
    },
    knob: {
        width: KNOB_SIZE,
        height: KNOB_SIZE,
        borderRadius: KNOB_SIZE / 2,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },
});

export default SmoothToggle;
