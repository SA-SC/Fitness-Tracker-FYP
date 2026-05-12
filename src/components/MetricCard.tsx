import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

type MetricCardProps = {
    title: string;
    value: string;
    unit?: string;
    icon: React.ReactNode;
    status?: string;
    statusColor?: string;
    accentColor: string;
    onPress?: () => void;
};

const MetricCard = ({ title, value, unit, icon, status, statusColor, accentColor, onPress }: MetricCardProps) => {
    const { theme } = useTheme();

    return (
        <TouchableOpacity
            style={[styles.cardContainer, { borderColor: theme.colors.background.tertiary }]}
            onPress={onPress}
            activeOpacity={0.85}
            disabled={!onPress}
        >
            <LinearGradient
                colors={[theme.colors.background.card, `${theme.colors.background.card}80`]}
                style={styles.card}
            >
                <View style={styles.header}>
                    <View style={[styles.iconContainer, { backgroundColor: `${accentColor}20` }]}>
                        {icon}
                    </View>
                    {status && (
                        <Text style={[styles.statusText, { color: statusColor || theme.colors.text.secondary }]}>
                            {status}
                        </Text>
                    )}
                </View>

                <View style={styles.content}>
                    <Text style={[styles.value, { color: theme.colors.text.primary }]}>
                        {value}
                        {unit && <Text style={[styles.unit, { color: theme.colors.text.secondary }]}> {unit}</Text>}
                    </Text>
                    <Text style={[styles.title, { color: theme.colors.text.secondary }]}>{title}</Text>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        width: CARD_WIDTH,
        height: 140,
        marginBottom: 16,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
    },
    card: {
        flex: 1,
        padding: 16,
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    iconContainer: {
        padding: 8,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    content: {
        gap: 4,
    },
    value: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    unit: {
        fontSize: 14,
        fontWeight: 'normal',
    },
    title: {
        fontSize: 14,
    },
});

export default MetricCard;
