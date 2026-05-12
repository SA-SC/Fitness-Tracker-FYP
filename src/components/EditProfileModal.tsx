import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { X, User, Calendar, Scale, Ruler } from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import Animated, { FadeInDown } from 'react-native-reanimated';

type EditProfileModalProps = {
    visible: boolean;
    onClose: () => void;
    onSave: (name: string, age: number, weight: number, height: number) => void;
    currentData: {
        name: string;
        age: number;
        weight: number;
        height: number;
    };
};

const EditProfileModal = ({ visible, onClose, onSave, currentData }: EditProfileModalProps) => {
    const { theme } = useTheme();
    const [name, setName] = useState(currentData.name);
    const [age, setAge] = useState(currentData.age);
    const [weight, setWeight] = useState(currentData.weight);
    const [height, setHeight] = useState(currentData.height);

    //Sync state with props when modal becomes visible or data changes
    React.useEffect(() => {
        if (visible) {
            setName(currentData.name);
            setAge(currentData.age);
            setWeight(currentData.weight);
            setHeight(currentData.height);
        }
    }, [visible, currentData]);

    const handleSave = () => {
        if (!name.trim()) {
            return;
        }
        onSave(name.trim(), age, weight, height);
        onClose();
    };

    const handleClose = () => {
        //Reset to current data
        setName(currentData.name);
        setAge(currentData.age);
        setWeight(currentData.weight);
        setHeight(currentData.height);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.overlay}
            >
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={handleClose}
                />
                <Animated.View entering={FadeInDown.duration(300)} style={[styles.modalContainer, { backgroundColor: theme.colors.background.card }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.colors.text.primary }]}>Edit Profile</Text>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <X size={24} color={theme.colors.text.secondary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <View style={styles.inputLabel}>
                                <User size={20} color={theme.colors.accent} />
                                <Text style={[styles.labelText, { color: theme.colors.text.primary }]}>Name</Text>
                            </View>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.colors.background.tertiary, color: theme.colors.text.primary, borderColor: theme.colors.background.tertiary }]}
                                placeholder="Enter your name"
                                placeholderTextColor={theme.colors.text.tertiary}
                                value={name}
                                onChangeText={setName}
                            />
                        </View>

                        <View style={styles.sliderGroup}>
                            <View style={styles.sliderLabel}>
                                <Calendar size={20} color={theme.colors.primary} />
                                <Text style={[styles.labelText, { color: theme.colors.text.primary }]}>Age: {age} years</Text>
                            </View>
                            <Slider
                                style={styles.slider}
                                minimumValue={10}
                                maximumValue={100}
                                step={1}
                                value={age}
                                onValueChange={setAge}
                                minimumTrackTintColor={theme.colors.primary}
                                maximumTrackTintColor={theme.colors.background.tertiary}
                                thumbTintColor={theme.colors.primary}
                            />
                        </View>

                        <View style={styles.sliderGroup}>
                            <View style={styles.sliderLabel}>
                                <Scale size={20} color={theme.colors.accent} />
                                <Text style={[styles.labelText, { color: theme.colors.text.primary }]}>Weight: {weight} kg</Text>
                            </View>
                            <Slider
                                style={styles.slider}
                                minimumValue={30}
                                maximumValue={150}
                                step={1}
                                value={weight}
                                onValueChange={setWeight}
                                minimumTrackTintColor={theme.colors.accent}
                                maximumTrackTintColor={theme.colors.background.tertiary}
                                thumbTintColor={theme.colors.accent}
                            />
                        </View>

                        <View style={styles.sliderGroup}>
                            <View style={styles.sliderLabel}>
                                <Ruler size={20} color={theme.colors.secondary} />
                                <Text style={[styles.labelText, { color: theme.colors.text.primary }]}>Height: {height} cm</Text>
                            </View>
                            <Slider
                                style={styles.slider}
                                minimumValue={120}
                                maximumValue={220}
                                step={1}
                                value={height}
                                onValueChange={setHeight}
                                minimumTrackTintColor={theme.colors.secondary}
                                maximumTrackTintColor={theme.colors.background.tertiary}
                                thumbTintColor={theme.colors.secondary}
                            />
                        </View>
                    </View>

                    <View style={styles.buttons}>
                        <TouchableOpacity style={[styles.cancelButton, { backgroundColor: theme.colors.background.tertiary }]} onPress={handleClose}>
                            <Text style={[styles.cancelButtonText, { color: theme.colors.text.secondary }]}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.colors.primary }]} onPress={handleSave}>
                            <Text style={[styles.saveButtonText, { color: theme.colors.text.primary }]}>Save Changes</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalContainer: {
        width: '90%',
        maxHeight: '80%',
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
        fontSize: 22,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 4,
    },
    form: {
        gap: 24,
        marginBottom: 24,
    },
    inputGroup: {
        gap: 8,
    },
    inputLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    labelText: {
        fontSize: 16,
        fontWeight: '600',
    },
    input: {
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        borderWidth: 1,
    },
    sliderGroup: {
        gap: 12,
    },
    sliderLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    buttons: {
        flexDirection: 'row',
        gap: 12,
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
    saveButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default EditProfileModal;
