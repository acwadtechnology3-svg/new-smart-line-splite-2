import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, TextStyle } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { typography } from '../../theme/tokens';

type TypographyVariant = keyof typeof typography;

interface TextProps extends RNTextProps {
    variant?: TypographyVariant;
    color?: string;
    weight?: TextStyle['fontWeight'];
    align?: TextStyle['textAlign'];
}

export const Text: React.FC<TextProps> = ({
    variant = 'body',
    color,
    weight,
    align,
    style,
    children,
    ...props
}) => {
    const { colors, tokens } = useTheme();

    const variantStyle = tokens.typography[variant];
    const textColor = color || colors.textPrimary;

    return (
        <RNText
            style={[
                variantStyle,
                { color: textColor },
                weight && { fontWeight: weight },
                align && { textAlign: align },
                style,
            ]}
            {...props}
        >
            {children}
        </RNText>
    );
};
