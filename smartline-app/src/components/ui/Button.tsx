import React from 'react';
import {
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    ViewStyle,
    Pressable,
    View
} from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Text } from './Text';
import { LucideIcon } from 'lucide-react-native';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: ButtonVariant;
    size?: 's' | 'm' | 'l' | 'small' | 'medium' | 'large';
    loading?: boolean;
    disabled?: boolean;
    leftIcon?: LucideIcon;
    rightIcon?: LucideIcon;
    style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'l',
    loading = false,
    disabled = false,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    style,
}) => {
    const { colors, tokens } = useTheme();

    const getHeight = () => {
        switch (size) {
            case 's':
            case 'small': return 32;
            case 'm':
            case 'medium': return 40;
            case 'l':
            case 'large': return 48;
            default: return 48;
        }
    };

    const getBackgroundColor = (pressed: boolean) => {
        if (disabled) return colors.disabledBg;
        if (variant === 'primary') return pressed ? colors.primary + 'D9' : colors.primary; // slightly transparent on press
        if (variant === 'secondary') return pressed ? colors.surface3 : colors.surface2;
        if (variant === 'destructive') return pressed ? colors.danger + 'D9' : colors.danger;
        return 'transparent';
    };

    const getTextColor = () => {
        if (disabled) return colors.disabledText;
        if (variant === 'primary' || variant === 'destructive') return colors.primaryText;
        if (variant === 'secondary') return colors.textPrimary;
        return colors.primary; // ghost
    };

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled || loading}
            style={({ pressed }) => [
                styles.container,
                {
                    backgroundColor: getBackgroundColor(pressed),
                    borderRadius: tokens.radius.xl,
                    height: getHeight(),
                },
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor()} />
            ) : (
                <View style={styles.content}>
                    {LeftIcon && <LeftIcon size={20} color={getTextColor()} style={styles.iconLeft} />}
                    <Text
                        variant="h3" // using h3 for button text size logic
                        style={{
                            color: getTextColor(),
                            fontSize: 16,
                            fontWeight: '600'
                        }}
                    >
                        {title}
                    </Text>
                    {RightIcon && <RightIcon size={20} color={getTextColor()} style={styles.iconRight} />}
                </View>
            )}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconLeft: {
        marginRight: 8,
    },
    iconRight: {
        marginLeft: 8,
    },
});
