import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { AlertCircle } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

type ConfirmationModalProps = {
    visible: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    danger?: boolean;
};

const ConfirmationModal = ({
    visible,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    danger = false
}: ConfirmationModalProps) => {
    const { theme } = useTheme();

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={onCancel}
                />
                <Animated.View entering={FadeInDown.duration(300)} style={[styles.modalContainer, { backgroundColor: theme.colors.background.card }]}>
                    <View style={styles.iconContainer}>
                        <AlertCircle size={48} color={danger ? theme.colors.primary : theme.colors.accent} />
                    </View>

                    <Text style={[styles.title, { color: theme.colors.text.primary }]}>{title}</Text>
                    <Text style={[styles.message, { color: theme.colors.text.secondary }]}>{message}</Text>

                    <View style={styles.buttons}>
                        <TouchableOpacity style={[styles.cancelButton, { backgroundColor: theme.colors.background.tertiary }]} onPress={onCancel}>
                            <Text style={[styles.cancelButtonText, { color: theme.colors.text.secondary }]}>{cancelText}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.confirmButton, { backgroundColor: theme.colors.accent }, danger && { backgroundColor: theme.colors.primary }]}
                            onPress={onConfirm}
                        >
                            <Text style={[styles.confirmButtonText, { color: '#FFFFFF' }]}>{confirmText}</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    modalContainer: {
        width: '85%',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    buttons: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    confirmButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ConfirmationModal;
