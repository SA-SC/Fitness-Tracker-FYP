import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../navigation/types';
import { ChevronRight, Ruler, Scale, Calendar, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

type ProfileSetupNavProp = NativeStackNavigationProp<RootStackParamList, 'ProfileSetup'>;

const ProfileSetup = () => {
    const { theme } = useTheme();
    const navigation = useNavigation<ProfileSetupNavProp>();

    //States
    const [name, setName] = useState('');
    const [age, setAge] = useState(25);
    const [weight, setWeight] = useState(70); // kg
    const [height, setHeight] = useState(170); // cm

    const handleNext = async () => {
        //Save profile data to AsyncStorage
        try {
            await AsyncStorage.setItem('userName', name || 'User');
            await AsyncStorage.setItem('userAge', age.toString());
            await AsyncStorage.setItem('userWeight', weight.toString());
            await AsyncStorage.setItem('userHeight', height.toString());
        } catch (error) {
            console.error('Error saving profile:', error);
        }
        navigation.navigate('DevicePairing');
    };

    const renderSlider = (
        label: string,
        icon: React.ReactNode,
        value: number,
        setValue: (val: number) => void,
        min: number,
        max: number,
        unit: string
    ) => (
        <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
                <View style={styles.labelLeft}>
                    {icon}
                    <Text style={[styles.labelText, { color: theme.colors.text.primary }]}>{label}</Text>
                </View>
                <Text style={[styles.valueText, { color: theme.colors.primary }]}>{value} <Text style={[styles.unitText, { color: theme.colors.text.secondary }]}>{unit}</Text></Text>
            </View>
            <Slider
                style={styles.slider}
                minimumValue={min}
                maximumValue={max}
                step={1}
                value={value}
                onValueChange={setValue}
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor={theme.colors.background.tertiary}
                thumbTintColor={theme.colors.primary}
            />
        </View>
    );

    return (
        <LinearGradient
            colors={[theme.colors.background.primary, theme.colors.background.secondary]}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.header, { color: theme.colors.text.primary }]}>Let's get to know you</Text>
                <Text style={[styles.subHeader, { color: theme.colors.text.secondary }]}>Please enter your details for accurate health metrics.</Text>

                <View style={styles.form}>
                    {/* Name Input */}
                    <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                            <View style={styles.labelLeft}>
                                <User size={20} color={theme.colors.accent} />
                                <Text style={[styles.labelText, { color: theme.colors.text.primary }]}>Name</Text>
                            </View>
                        </View>
                        <TextInput
                            style={[styles.textInput, { backgroundColor: theme.colors.background.card, color: theme.colors.text.primary, borderColor: theme.colors.background.tertiary }]}
                            placeholder="Enter your name"
                            placeholderTextColor={theme.colors.text.tertiary}
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    {renderSlider(
                        "Age",
                        <Calendar size={20} color={theme.colors.primary} />,
                        age, setAge, 10, 100, "years"
                    )}

                    {renderSlider(
                        "Weight",
                        <Scale size={20} color={theme.colors.accent} />,
                        weight, setWeight, 30, 200, "kg"
                    )}

                    {renderSlider(
                        "Height",
                        <Ruler size={20} color={theme.colors.secondary} />,
                        height, setHeight, 100, 250, "cm"
                    )}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={[styles.button, { backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary }]} onPress={handleNext}>
                    <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Continue</Text>
                    <ChevronRight color="#FFFFFF" size={24} />
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 24,
        paddingTop: 60,
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subHeader: {
        fontSize: 16,
        marginBottom: 40,
        lineHeight: 24,
    },
    form: {
        gap: 32,
    },
    inputGroup: {
        gap: 16,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    labelLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    labelText: {
        fontSize: 18,
        fontWeight: '500',
    },
    valueText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    unitText: {
        fontSize: 16,
        fontWeight: 'normal',
    },
    textInput: {
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        borderWidth: 1,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    footer: {
        padding: 24,
        paddingBottom: 40,
    },
    button: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
        borderRadius: 30,
        gap: 8,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default ProfileSetup;
