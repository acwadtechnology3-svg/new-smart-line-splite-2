import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/useTheme';

interface CardProps extends ViewProps {
    variant?: 'elevated' | 'outlined' | 'flat';
    noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
    variant = 'elevated',
    noPadding = false,
    style,
    children,
    ...props
}) => {
    const { colors, tokens, resolvedScheme } = useTheme();

    // In dark mode, we often prefer borders or lighter surfaces over shadows
    const isDark = resolvedScheme === 'dark';

    const getVariantStyle = () => {
        switch (variant) {
            case 'elevated':
                return {
                    backgroundColor: colors.cardBg,
                    ...(isDark
                        ? { borderWidth: 1, borderColor: colors.border }
                        : tokens.shadows.sm),
                };
            case 'outlined':
                return {
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderColor: colors.border,
                };
            case 'flat':
                return {
                    backgroundColor: colors.surface2,
                };
            default:
                return {};
        }
    };

    return (
        <View
            style={[
                getVariantStyle(),
                {
                    borderRadius: tokens.radius.xl,
                    padding: noPadding ? 0 : tokens.layout.cardPadding,
                },
                style,
            ]}
            {...props}
        >
            {children}
        </View>
    );
};
