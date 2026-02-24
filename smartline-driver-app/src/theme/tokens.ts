import { Platform, ViewStyle } from 'react-native';

export const spacing = {
    xs: 4,
    s: 8,
    m: 12,
    l: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};

export const radius = {
    s: 4,
    m: 8,
    l: 10,
    xl: 12,
    xxl: 16,
    full: 999,
};

export const typography = {
    h1: {
        fontSize: 28,
        lineHeight: 34,
        fontWeight: '600' as const,
    },
    h2: {
        fontSize: 22,
        lineHeight: 28,
        fontWeight: '600' as const,
    },
    h3: {
        fontSize: 18,
        lineHeight: 24,
        fontWeight: '600' as const,
    },
    body: {
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '400' as const,
    },
    bodyMedium: {
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '500' as const,
    },
    small: {
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '400' as const,
    },
    caption: {
        fontSize: 12,
        lineHeight: 16,
        fontWeight: '400' as const,
    },
};

export const layout = {
    screenPadding: spacing.l,
    cardPadding: spacing.l,
    headerHeight: 60,
};

export const shadows = {
    none: {},
    s: Platform.select({
        ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
        },
        android: {
            elevation: 2,
        },
    }) as ViewStyle,
    m: Platform.select({
        ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
        },
        android: {
            elevation: 4,
        },
    }) as ViewStyle,
    l: Platform.select({
        ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
        },
        android: {
            elevation: 8,
        },
    }) as ViewStyle,
    sm: Platform.select({
        ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
        },
        android: {
            elevation: 2,
        },
    }) as ViewStyle,
    md: Platform.select({
        ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
        },
        android: {
            elevation: 4,
        },
    }) as ViewStyle,
    lg: Platform.select({
        ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
        },
        android: {
            elevation: 8,
        },
    }) as ViewStyle,
};
