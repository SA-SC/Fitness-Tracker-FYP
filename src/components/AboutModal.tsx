import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { User, GraduationCap, X } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

type AboutProps = {
    visible: boolean;
    onClose: () => void;
};

const AboutModal = ({ visible, onClose }: AboutProps) => {
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
                <Animated.View entering={FadeInDown.duration(300)} style={[styles.modalContainer, { backgroundColor: theme.colors.background.card }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.colors.text.primary }]}>About</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color={theme.colors.text.secondary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.infoSection}>
                        <View style={[styles.aboutCard, { backgroundColor: theme.colors.background.tertiary, borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                            <View style={styles.aboutItem}>
                                <View style={[styles.aboutIcon, { backgroundColor: theme.colors.background.card }]}>
                                    <User size={24} color={theme.colors.accent} />
                                </View>
                                <View style={styles.aboutItemText}>
                                    <Text style={[styles.aboutLabel, { color: theme.colors.text.secondary }]}>Developer</Text>
                                    <Text style={[styles.aboutValue, { color: theme.colors.text.primary }]}>Sannan Adil</Text>
                                    <Text style={[styles.aboutSubValue, { color: theme.colors.text.secondary }]}>Developed and Designed</Text>
                                </View>
                            </View>

                            <View style={[styles.divider, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]} />

                            <View style={styles.aboutItem}>
                                <View style={[styles.aboutIcon, { backgroundColor: theme.colors.background.card }]}>
                                    <GraduationCap size={24} color={theme.colors.secondary} />
                                </View>
                                <View style={styles.aboutItemText}>
                                    <Text style={[styles.aboutLabel, { color: theme.colors.text.secondary }]}>Supervisor</Text>
                                    <Text style={[styles.aboutValue, { color: theme.colors.text.primary }]}>DR. Mudassar Azam Sindhu</Text>
                                    <Text style={[styles.aboutSubValue, { color: theme.colors.text.secondary }]}>FYP Supervised</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.footer}>
                            <Text style={[styles.version, { color: theme.colors.text.secondary }]}>Version 1.0.0</Text>
                            <Text style={[styles.copyright, { color: theme.colors.text.tertiary }]}>© 2026 All rights reserved</Text>
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
        width: '90%',
        borderRadius: 24,
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 4,
    },
    infoSection: {
        marginTop: 8,
    },
    aboutCard: {
        borderRadius: 24,
        padding: 4,
        borderWidth: 1,
    },
    aboutItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        padding: 24,
    },
    aboutIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    aboutItemText: {
        flex: 1,
        justifyContent: 'center',
    },
    aboutLabel: {
        fontSize: 12,
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    aboutValue: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    aboutSubValue: {
        fontSize: 14,
        opacity: 0.9,
    },
    divider: {
        height: 1,
        marginHorizontal: 24,
    },
    footer: {
        alignItems: 'center',
        paddingTop: 24,
        paddingBottom: 8,
    },
    version: {
        fontSize: 14,
        marginBottom: 4,
    },
    copyright: {
        fontSize: 12,
    },
});

export default AboutModal;
