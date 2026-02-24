import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Screen } from '../../components/ui/Screen';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Check, Moon, Sun, Smartphone } from 'lucide-react-native';

export const AppearanceScreen = () => {
    const { mode, setMode, colors, tokens } = useTheme();

    const options = [
        { value: 'system', label: 'System Default', icon: Smartphone },
        { value: 'light', label: 'Light Mode', icon: Sun },
        { value: 'dark', label: 'Dark Mode', icon: Moon },
    ] as const;

    return (
        <Screen>
            <ScrollView contentContainerStyle={styles.content}>
                <Text variant="h1" style={styles.header}>Appearance</Text>
                <Text variant="body" color={colors.textSecondary} style={styles.subtext}>
                    Choose how SmartLine looks on your device.
                </Text>

                <View style={styles.optionsContainer}>
                    {options.map((option) => {
                        const isSelected = mode === option.value;
                        const Icon = option.icon;

                        return (
                            <TouchableOpacity
                                key={option.value}
                                onPress={() => setMode(option.value)}
                                activeOpacity={0.7}
                            >
                                <Card
                                    variant={isSelected ? 'elevated' : 'outlined'}
                                    style={[
                                        styles.optionCard,
                                        isSelected && { borderColor: colors.primary, borderWidth: 2 }
                                    ]}
                                >
                                    <View style={styles.optionRow}>
                                        <View style={[
                                            styles.iconContainer,
                                            { backgroundColor: isSelected ? colors.primary + '20' : colors.surface2 }
                                        ]}>
                                            <Icon
                                                size={24}
                                                color={isSelected ? colors.primary : colors.textMuted}
                                            />
                                        </View>

                                        <View style={styles.textContainer}>
                                            <Text variant="h3" style={{ marginBottom: 4 }}>
                                                {option.label}
                                            </Text>
                                            {isSelected && (
                                                <Text variant="caption" color={colors.primary}>
                                                    Active
                                                </Text>
                                            )}
                                        </View>

                                        {isSelected && (
                                            <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
                                                <Check size={16} color={colors.primaryText} />
                                            </View>
                                        )}
                                    </View>
                                </Card>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <View style={styles.previewContainer}>
                    <Text variant="h3" style={{ marginBottom: 12 }}>Preview</Text>
                    <Card>
                        <Text variant="h2">Theme Preview</Text>
                        <Text color={colors.textSecondary} style={{ marginTop: 8 }}>
                            This is how your cards and text will look with the current theme settings.
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
                            <View style={{
                                height: 40, width: 40, borderRadius: tokens.radius.full,
                                backgroundColor: colors.primary
                            }} />
                            <View style={{
                                height: 40, width: 40, borderRadius: tokens.radius.full,
                                backgroundColor: colors.accent
                            }} />
                            <View style={{
                                height: 40, width: 40, borderRadius: tokens.radius.full,
                                backgroundColor: colors.surface3
                            }} />
                        </View>
                    </Card>
                </View>
            </ScrollView>
        </Screen>
    );
};

const styles = StyleSheet.create({
    content: {
        padding: 20,
    },
    header: {
        marginBottom: 8,
    },
    subtext: {
        marginBottom: 24,
    },
    optionsContainer: {
        gap: 16,
        marginBottom: 32,
    },
    optionCard: {
        padding: 16,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    checkCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewContainer: {
        marginTop: 8,
    }
});
