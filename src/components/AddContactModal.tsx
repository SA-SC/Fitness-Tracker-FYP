import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { X, User, Phone } from 'lucide-react-native';

type AddContactModalProps = {
    visible: boolean;
    onClose: () => void;
    onAdd: (name: string, number: string) => void;
};

const AddContactModal = ({ visible, onClose, onAdd }: AddContactModalProps) => {
    const { theme } = useTheme();
    const [name, setName] = useState('');
    const [number, setNumber] = useState('');
    const [error, setError] = useState('');

    const validateAndAdd = () => {
        //Validate name
        if (!name.trim()) {
            setError('Please enter a name');
            return;
        }

        //Validate 11-digit phone number
        const cleanNumber = number.replace(/\D/g, '');
        if (cleanNumber.length !== 11) {
            setError('Phone number must be exactly 11 digits');
            return;
        }

        //Add contact
        onAdd(name.trim(), cleanNumber);

        //Reset and close
        setName('');
        setNumber('');
        setError('');
        onClose();
    };

    const handleClose = () => {
        setName('');
        setNumber('');
        setError('');
        onClose();
    };

    const formatPhoneNumber = (text: string) => {
        //Remove all non-digits
        const cleaned = text.replace(/\D/g, '');
        //Limit to 11 digits
        const limited = cleaned.slice(0, 11);
        setNumber(limited);
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
                <View style={[styles.modalContainer, { backgroundColor: theme.colors.background.card }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.colors.text.primary }]}>Add Emergency Contact</Text>
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
                                placeholder="Enter contact name"
                                placeholderTextColor={theme.colors.text.tertiary}
                                value={name}
                                onChangeText={setName}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <View style={styles.inputLabel}>
                                <Phone size={20} color={theme.colors.primary} />
                                <Text style={[styles.labelText, { color: theme.colors.text.primary }]}>Phone Number</Text>
                            </View>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.colors.background.tertiary, color: theme.colors.text.primary, borderColor: theme.colors.background.tertiary }]}
                                placeholder="Enter 11-digit number"
                                placeholderTextColor={theme.colors.text.tertiary}
                                value={number}
                                onChangeText={formatPhoneNumber}
                                keyboardType="phone-pad"
                                maxLength={11}
                            />
                            <Text style={[styles.hint, { color: theme.colors.text.tertiary }]}>{number.length}/11 digits</Text>
                        </View>

                        {error ? <Text style={[styles.error, { color: theme.colors.status.error }]}>{error}</Text> : null}
                    </View>

                    <View style={styles.buttons}>
                        <TouchableOpacity style={[styles.cancelButton, { backgroundColor: theme.colors.background.tertiary }]} onPress={handleClose}>
                            <Text style={[styles.cancelButtonText, { color: theme.colors.text.secondary }]}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.colors.primary }]} onPress={validateAndAdd}>
                            <Text style={[styles.addButtonText, { color: theme.colors.text.primary }]}>Add Contact</Text>
                        </TouchableOpacity>
                    </View>
                </View>
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
        width: '85%',
        borderRadius: 20,
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 4,
    },
    form: {
        gap: 20,
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
    hint: {
        fontSize: 12,
        marginLeft: 4,
    },
    error: {
        fontSize: 14,
        marginTop: -8,
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
    addButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    addButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default AddContactModal;
