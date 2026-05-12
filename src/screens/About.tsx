import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { ArrowLeft, Heart, Award } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const About = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
            <LinearGradient
                colors={[theme.colors.background.primary, theme.colors.background.secondary]}
                style={styles.gradient}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    <TouchableOpacity style={[styles.backButton, { backgroundColor: theme.colors.background.card }]} onPress={() => navigation.goBack()}>
                        <ArrowLeft size={24} color={theme.colors.text.primary} />
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <View style={[styles.iconContainer, { backgroundColor: theme.colors.background.card }]}>
                            <Heart size={48} color={theme.colors.primary} fill={theme.colors.primary} />
                        </View>
                        <Text style={[styles.title, { color: theme.colors.text.primary }]}>About</Text>
                    </View>

                    <View style={[styles.infoCard, { backgroundColor: theme.colors.background.card }]}>
                        <View style={styles.section}>
                            <View style={[styles.sectionIcon, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                                <Award size={24} color={theme.colors.accent} />
                            </View>
                            <View style={styles.sectionContent}>
                                <Text style={[styles.sectionTitle, { color: theme.colors.text.tertiary }]}>Project</Text>
                                <Text style={[styles.sectionText, { color: theme.colors.text.primary }]}>Fitness tracker app by Sannan Adil</Text>
                            </View>
                        </View>

                        <View style={[styles.divider, { backgroundColor: theme.colors.background.tertiary }]} />

                        <View style={styles.section}>
                            <View style={[styles.sectionIcon, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                                <Award size={24} color={theme.colors.secondary} />
                            </View>
                            <View style={styles.sectionContent}>
                                <Text style={[styles.sectionTitle, { color: theme.colors.text.tertiary }]}>Supervisor</Text>
                                <Text style={[styles.sectionText, { color: theme.colors.text.primary }]}>FYP supervised by Dr. Mudassar Azam Sindhu</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: theme.colors.text.secondary }]}>Version 1.0.0</Text>
                        <Text style={[styles.footerSubtext, { color: theme.colors.text.tertiary }]}>© 2026 All rights reserved</Text>
                    </View>
                </ScrollView>
            </LinearGradient>
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
        paddingTop: 60,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    infoCard: {
        borderRadius: 20,
        padding: 24,
        marginBottom: 40,
    },
    section: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
    },
    sectionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionContent: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    sectionText: {
        fontSize: 16,
        lineHeight: 24,
    },
    divider: {
        height: 1,
        marginVertical: 20,
    },
    footer: {
        alignItems: 'center',
        paddingTop: 20,
    },
    footerText: {
        fontSize: 14,
        marginBottom: 4,
    },
    footerSubtext: {
        fontSize: 12,
    },
});

export default About;
