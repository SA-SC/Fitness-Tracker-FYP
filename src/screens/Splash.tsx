import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../navigation/types';
import { Watch, ChevronsRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    FadeInUp,
    FadeIn,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    runOnJS,
    interpolate,
    Extrapolate,
    withTiming,
    interpolateColor,
    withRepeat
} from 'react-native-reanimated';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';

type SplashNavProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

const BUTTON_WIDTH = Dimensions.get('window').width - 40;
const BUTTON_HEIGHT = 60;
const SWIPE_BUTTON_WIDTH = 140;
const SWIPEABLE_DIMENSIONS = BUTTON_HEIGHT - 10;
const CONTAINER_PADDING = 5;
const H_SWIPE_RANGE = BUTTON_WIDTH - SWIPE_BUTTON_WIDTH - (CONTAINER_PADDING * 2);

const Splash = () => {
    const { theme } = useTheme();
    const navigation = useNavigation<SplashNavProp>();
    const X = useSharedValue(0);
    const shimmerProgress = useSharedValue(0);
    const [toggled, setToggled] = useState(false);

    React.useEffect(() => {
        shimmerProgress.value = withRepeat(
            withTiming(1, { duration: 1500 }),
            -1,
            false
        );
    }, []);

    const handleComplete = () => {
        if (!toggled) {
            setToggled(true);
            navigation.replace('ProfileSetup');
        }
    };

    const animatedGestureHandler = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: X.value }],
        };
    });

    const animatedTextOpacity = useAnimatedStyle(() => {
        return {
            opacity: interpolate(X.value, [0, H_SWIPE_RANGE / 2], [1, 0], Extrapolate.CLAMP)
        }
    });

    //Animated gradient background based on progress
    const animatedTrackStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            X.value,
            [0, H_SWIPE_RANGE],
            [theme.isDark ? '#1A1A1A' : 'rgba(0,0,0,0.05)', theme.colors.primary]
        );
        return {
            backgroundColor,
        };
    });

    //Removed irregular glow effect

    const createArrowStyle = (index: number) => {
        return useAnimatedStyle(() => {
            const start = index * 0.2;
            const end = start + 0.4;
            const opacity = interpolate(
                shimmerProgress.value,
                [0, start, start + 0.2, end, 1],
                [0.2, 0.2, 1, 0.2, 0.2],
                Extrapolate.CLAMP
            );
            return {
                opacity: opacity * interpolate(X.value, [0, H_SWIPE_RANGE / 2], [1, 0], Extrapolate.CLAMP),
            };
        });
    };

    const arrowStyle1 = createArrowStyle(0);
    const arrowStyle2 = createArrowStyle(1);
    const arrowStyle3 = createArrowStyle(2);

    const onGestureEvent = (event: PanGestureHandlerGestureEvent) => {
        if (toggled) return;
        if (event.nativeEvent.translationX < 0) {
            X.value = 0;
        } else if (event.nativeEvent.translationX > H_SWIPE_RANGE) {
            X.value = H_SWIPE_RANGE;
        } else {
            X.value = event.nativeEvent.translationX;
        }
    };

    const onHandlerStateChange = (event: any) => {
        if (toggled) return;
        if (event.nativeEvent.state === 5) { // END state
            if (X.value > H_SWIPE_RANGE * 0.6) {
                X.value = withTiming(H_SWIPE_RANGE, {}, () => {
                    runOnJS(handleComplete)();
                });
            } else {
                X.value = withSpring(0);
            }
        }
    };

    return (
        <LinearGradient
            colors={[theme.colors.background.primary, theme.colors.background.secondary]}
            style={styles.container}
        >
            <View style={styles.content}>
                <Animated.View entering={FadeIn.duration(1000).delay(200)} style={[styles.iconContainer, { backgroundColor: theme.isDark ? 'rgba(230, 57, 70, 0.1)' : 'rgba(230, 57, 70, 0.05)', borderColor: theme.isDark ? 'rgba(230, 57, 70, 0.2)' : 'rgba(230, 57, 70, 0.1)' }]}>
                    <Watch size={100} color={theme.colors.primary} strokeWidth={1.5} />
                </Animated.View>
                <Animated.Text entering={FadeInUp.delay(500)} style={[styles.title, { color: theme.colors.text.primary }]}>Fitness Tracker</Animated.Text>
                <Animated.Text entering={FadeInUp.delay(700)} style={[styles.subtitle, { color: theme.colors.text.secondary }]}>Welcome to your health journey</Animated.Text>
            </View>

            <Animated.View entering={FadeIn.delay(1000)} style={styles.footerContainer}>
                <Animated.View style={[styles.swipeButtonContainer, animatedTrackStyle]}>
                    <Animated.View style={styles.arrowsContainer}>
                        <Animated.View style={arrowStyle1}>
                            <ChevronsRight size={24} color={theme.colors.text.primary} />
                        </Animated.View>
                        <Animated.View style={arrowStyle2}>
                            <ChevronsRight size={24} color={theme.colors.text.primary} />
                        </Animated.View>
                        <Animated.View style={arrowStyle3}>
                            <ChevronsRight size={24} color={theme.colors.text.primary} />
                        </Animated.View>
                    </Animated.View>

                    <PanGestureHandler onGestureEvent={onGestureEvent} onHandlerStateChange={onHandlerStateChange}>
                        <Animated.View style={[styles.swipeButton, animatedGestureHandler, { backgroundColor: theme.colors.primary }]}>
                            <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Swipe to Start</Text>
                        </Animated.View>
                    </PanGestureHandler>
                </Animated.View>
            </Animated.View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: 24,
        padding: 20,
        borderRadius: 50,
        borderWidth: 1,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 18,
        marginBottom: 40,
    },
    footerContainer: {
        marginBottom: 60,
        alignItems: 'center',
    },
    swipeButtonContainer: {
        width: BUTTON_WIDTH,
        height: BUTTON_HEIGHT,
        borderRadius: BUTTON_HEIGHT / 2,
        justifyContent: 'center',
        padding: 5,
        position: 'relative',
    },
    swipeButton: {
        width: 140,
        height: SWIPEABLE_DIMENSIONS,
        borderRadius: SWIPEABLE_DIMENSIONS / 2,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    buttonText: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    arrowsContainer: {
        position: 'absolute',
        right: 20,
        flexDirection: 'row',
        zIndex: 1,
        gap: 4,
    }
});

export default Splash;
