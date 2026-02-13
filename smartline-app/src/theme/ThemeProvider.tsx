import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Platform, ViewStyle, useColorScheme as _useColorScheme, Appearance } from 'react-native';
import { storage } from '../utils/storage';
import { lightColors, darkColors, ThemeColors } from './palettes';
import * as tokens from './tokens';

type ThemeMode = 'system' | 'light' | 'dark';

export interface ThemeContextType {
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
    resolvedScheme: 'light' | 'dark';
    isDark: boolean;
    colors: ThemeColors;
    tokens: typeof tokens;
    spacing: typeof tokens.spacing;
    radius: typeof tokens.radius;
    shadow: (level: keyof typeof tokens.shadows) => ViewStyle;
    isReady: boolean;
}

export const ThemeContext = createContext<ThemeContextType>({
    mode: 'system',
    setMode: () => { },
    resolvedScheme: 'light',
    isDark: false,
    colors: lightColors,
    tokens,
    spacing: tokens.spacing,
    radius: tokens.radius,
    shadow: () => ({}),
    isReady: false,
});

const THEME_STORAGE_KEY = 'app_theme_mode';

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const systemScheme = _useColorScheme();
    const [mode, setModeState] = useState<ThemeMode>('system');
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Load stored theme preference
        const loadTheme = async () => {
            const storedMode = await storage.getItem<ThemeMode>(THEME_STORAGE_KEY);
            if (storedMode) {
                setModeState(storedMode);
            }
            setIsReady(true);
        };
        loadTheme();
    }, []);

    const setMode = useCallback(async (newMode: ThemeMode) => {
        setModeState(newMode);
        await storage.setItem(THEME_STORAGE_KEY, newMode);
    }, []);

    const resolvedScheme = mode === 'system'
        ? (systemScheme || 'light')
        : mode;

    const isDark = resolvedScheme === 'dark';
    const colors = isDark ? darkColors : lightColors;

    const value = {
        mode,
        setMode,
        resolvedScheme,
        isDark,
        colors,
        tokens,
        spacing: tokens.spacing,
        radius: tokens.radius,
        shadow: (level: keyof typeof tokens.shadows) => tokens.shadows[level] || tokens.shadows.none,
        isReady,
    };

    if (!isReady) {
        return null; // or a splash screen component
    }

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
