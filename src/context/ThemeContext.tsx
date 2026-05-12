import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkTheme, lightTheme, Theme } from '../theme';
import { useColorScheme } from 'react-native';

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    themeType: ThemeType;
    toggleTheme: () => void;
    setTheme: (type: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [themeType, setThemeType] = useState<ThemeType>(systemColorScheme === 'light' ? 'light' : 'dark');

    useEffect(() => {
        loadTheme();
    }, []);

    //Also sync with system theme if it changes and no user preference is set
    useEffect(() => {
        const checkSystemTheme = async () => {
            const savedTheme = await AsyncStorage.getItem('userTheme');
            if (!savedTheme && systemColorScheme) {
                setThemeType(systemColorScheme);
            }
        };
        checkSystemTheme();
    }, [systemColorScheme]);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('userTheme');
            if (savedTheme === 'light' || savedTheme === 'dark') {
                setThemeType(savedTheme);
            } else if (systemColorScheme) {
                setThemeType(systemColorScheme);
            }
        } catch (error) {
            console.error('Error loading theme:', error);
        }
    };

    const toggleTheme = () => {
        const newType = themeType === 'light' ? 'dark' : 'light';
        setThemeType(newType);
        AsyncStorage.setItem('userTheme', newType);
    };

    const setTheme = (type: ThemeType) => {
        setThemeType(type);
        AsyncStorage.setItem('userTheme', type);
    };

    const theme = themeType === 'light' ? lightTheme : darkTheme;

    return (
        <ThemeContext.Provider value={{ theme, themeType, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
