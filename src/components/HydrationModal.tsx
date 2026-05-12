import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Droplets, Plus, Minus, X } from 'lucide-react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

type HydrationModalProps = {
    visible: boolean;
    onClose: () => void;
    currentGlasses: number;
    onUpdate: (newCount: number) => void;
};

const HydrationModal = ({ visible, onClose, currentGlasses, onUpdate }: HydrationModalProps) => {
    const { theme } = useTheme();

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
                    entering={FadeInDown.duration(300)}
                    style={[styles.modalContainer, { backgroundColor: theme.colors.background.card }]}
                >
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.colors.text.primary }]}>Water Intake</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color={theme.colors.text.secondary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        <Animated.View entering={ZoomIn.delay(200)} style={[styles.iconContainer, { backgroundColor: theme.isDark ? 'rgba(74, 144, 226, 0.1)' : 'rgba(74, 144, 226, 0.05)' }]}>
                            <View style={[styles.glassContainer, { borderColor: theme.colors.health.hydration }]}>
                                <Droplets size={64} color={theme.colors.health.hydration} fill={theme.colors.health.hydration} />
                                <View style={[styles.waterLevel, { height: `${Math.min(currentGlasses * 10, 100)}%` }]} />
                            </View>
                        </Animated.View>

                        <Text style={[styles.countText, { color: theme.colors.text.primary }]}>{currentGlasses} <Text style={[styles.unitText, { color: theme.colors.text.secondary }]}>Glasses</Text></Text>
                        <Text style={[styles.goalText, { color: theme.colors.text.tertiary }]}>Daily Goal: 10 Glasses</Text>

                        <View style={styles.controls}>
                            <TouchableOpacity
                                style={[styles.btn, styles.minusBtn, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderColor: theme.colors.background.tertiary }]}
                                onPress={() => onUpdate(Math.max(0, currentGlasses - 1))}
                            >
                                <Minus size={28} color={theme.colors.text.primary} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.btn, styles.plusBtn, { backgroundColor: theme.colors.health.hydration }]}
                                onPress={() => onUpdate(currentGlasses + 1)}
                            >
                                <Plus size={28} color={theme.colors.text.primary} />
                            </TouchableOpacity>
                        </View>
                    </View>
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
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    modalContainer: {
        width: '85%',
        borderRadius: 32,
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 4,
    },
    content: {
        alignItems: 'center',
    },
    iconContainer: {
        width: 140,
        height: 140,
        borderRadius: 70,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        overflow: 'hidden',
    },
    glassContainer: {
        width: 80,
        height: 100,
        borderWidth: 3,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    waterLevel: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(74, 144, 226, 0.4)',
    },
    countText: {
        fontSize: 48,
        fontWeight: 'bold',
    },
    unitText: {
        fontSize: 20,
        fontWeight: 'normal',
    },
    goalText: {
        fontSize: 16,
        marginTop: 8,
        marginBottom: 32,
    },
    controls: {
        flexDirection: 'row',
        gap: 24,
    },
    btn: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    minusBtn: {
        borderWidth: 1,
    },
    plusBtn: {
    },
});

export default HydrationModal;
