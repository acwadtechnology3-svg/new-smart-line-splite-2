import React, { useState } from 'react';
import {
    TextInput,
    View,
    StyleSheet,
    TextInputProps,
    ViewStyle,
    TouchableOpacity
} from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Text } from './Text';
import { LucideIcon } from 'lucide-react-native';

interface InputProps extends TextInputProps {
    label?: string;
    helperText?: string;
    error?: string;
    leftIcon?: LucideIcon;
    rightIcon?: LucideIcon;
    onRightIconPress?: () => void;
    containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
    label,
    helperText,
    error,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    onRightIconPress,
    containerStyle,
    style,
    ...props
}) => {
    const { colors, tokens } = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    const borderColor = error
        ? colors.danger
        : isFocused
            ? colors.primary
            : colors.inputBorder;

    const backgroundColor = colors.inputBg;

    return (
        <View style={[styles.container, containerStyle]}>
            {label && (
                <Text
                    variant="small"
                    color={colors.textSecondary}
                    style={styles.label}
                >
                    {label}
                </Text>
            )}

            <View style={[
                styles.inputContainer,
                {
                    backgroundColor,
                    borderColor,
                    borderRadius: tokens.radius.l,
                    borderWidth: 1,
                },
                isFocused && {
                    // simple focus ring simulation
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 2,
                }
            ]}>
                {LeftIcon && (
                    <View style={styles.leftIcon}>
                        <LeftIcon size={20} color={colors.textMuted} />
                    </View>
                )}

                <TextInput
                    style={[
                        styles.input,
                        {
                            color: colors.textPrimary,
                            paddingLeft: LeftIcon ? 40 : 12,
                            paddingRight: RightIcon ? 40 : 12,
                        },
                        style,
                    ]}
                    placeholderTextColor={colors.textMuted}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                />

                {RightIcon && (
                    <TouchableOpacity
                        onPress={onRightIconPress}
                        disabled={!onRightIconPress}
                        style={styles.rightIcon}
                    >
                        <RightIcon size={20} color={colors.textMuted} />
                    </TouchableOpacity>
                )}
            </View>

            {(error || helperText) && (
                <Text
                    variant="caption"
                    color={error ? colors.danger : colors.textMuted}
                    style={styles.helperText}
                >
                    {error || helperText}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        marginBottom: 6,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 16,
    },
    leftIcon: {
        position: 'absolute',
        left: 12,
        zIndex: 1,
    },
    rightIcon: {
        position: 'absolute',
        right: 12,
        zIndex: 1,
    },
    helperText: {
        marginTop: 4,
        marginLeft: 4,
    },
});
