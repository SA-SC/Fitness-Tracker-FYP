//Centralized theme configuration for fitness app
//Based on best practices from top fitness apps like Apple Health

const commonTheme = {
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
    },
    borderRadius: {
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
        full: 9999,
    },
    fontSize: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 20,
        xl: 24,
        xxl: 32,
        xxxl: 48,
    },
    fontWeight: {
        regular: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
    },
    animation: {
        duration: {
            fast: 200,
            normal: 300,
            slow: 500,
        },
        easing: {
            linear: 'linear' as const,
            easeIn: 'ease-in' as const,
            easeOut: 'ease-out' as const,
            easeInOut: 'ease-in-out' as const,
        },
    },
};

export const darkTheme = {
    ...commonTheme,
    isDark: true,
    colors: {
        primary: '#E63946',
        secondary: '#F77F00',
        accent: '#06D6A0',
        background: {
            primary: '#0A0A0A',
            secondary: '#1A1A1A',
            tertiary: '#2A2A2A',
            card: '#1E1E1E',
        },
        text: {
            primary: '#FFFFFF',
            secondary: '#B0B0B0',
            tertiary: '#808080',
            disabled: '#4A4A4A',
        },
        status: {
            success: '#06D6A0',
            warning: '#F77F00',
            error: '#E63946',
            info: '#4A90E2',
        },
        health: {
            heartRate: '#E63946',
            spo2: '#4A90E2',
            temperature: '#F77F00',
            steps: '#06D6A0',
            calories: '#F77F00',
            stress: '#9D4EDD',
            fatigue: '#808080',
            hydration: '#4A90E2',
        },
        gradients: {
            primary: ['#E63946', '#F77F00'],
            success: ['#06D6A0', '#4A90E2'],
            energy: ['#F77F00', '#E63946'],
        },
    },
    shadows: {
        sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 2 },
        md: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4.65, elevation: 4 },
        lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.37, shadowRadius: 7.49, elevation: 8 },
    },
};

export const lightTheme = {
    ...commonTheme,
    isDark: false,
    colors: {
        primary: '#E63946',
        secondary: '#F77F00',
        accent: '#06D6A0',
        background: {
            primary: '#F8F9FA',
            secondary: '#FFFFFF',
            tertiary: '#E9ECEF',
            card: '#FFFFFF',
        },
        text: {
            primary: '#212529',
            secondary: '#6C757D',
            tertiary: '#ADB5BD',
            disabled: '#CED4DA',
        },
        status: {
            success: '#06D6A0',
            warning: '#F77F00',
            error: '#E63946',
            info: '#0D6EFD',
        },
        health: {
            heartRate: '#E63946',
            spo2: '#0D6EFD',
            temperature: '#F77F00',
            steps: '#198754',
            calories: '#F77F00',
            stress: '#6F42C1',
            fatigue: '#6C757D',
            hydration: '#0D6EFD',
        },
        gradients: {
            primary: ['#E63946', '#F77F00'],
            success: ['#06D6A0', '#0D6EFD'],
            energy: ['#F77F00', '#E63946'],
        },
    },
    shadows: {
        sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
        md: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 3 },
        lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
    },
};

export const theme = darkTheme; //Default export for backwards compatibility
export type Theme = typeof darkTheme;
