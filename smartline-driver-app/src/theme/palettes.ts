export type ThemeColors = {
    background: string;
    surface: string;
    surface2: string;
    surface3: string;
    surfaceHighlight: string;

    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    textInverse: string;

    border: string;
    divider: string;

    primary: string;
    primaryText: string;
    textOnPrimary: string; // alias for likely backward compat
    accent: string;

    success: string;
    warning: string;
    danger: string;
    info: string;

    cardBg: string;
    inputBg: string;
    inputBorder: string;
    tabBarBg: string;
    headerBg: string;

    pressedOverlay: string;
    focusRing: string;
    disabledBg: string;
    disabledText: string;

    shadow: string;
};

export const lightColors: ThemeColors = {
    background: '#F9FAFB', // cool gray 50
    surface: '#FFFFFF',
    surface2: '#F3F4F6', // cool gray 100
    surface3: '#E5E7EB', // cool gray 200
    surfaceHighlight: '#EFF6FF', // blue 50

    textPrimary: '#111827', // cool gray 900
    textSecondary: '#4B5563', // cool gray 600
    textMuted: '#9CA3AF', // cool gray 400
    textInverse: '#FFFFFF',

    border: '#E5E7EB',
    divider: '#F3F4F6',

    primary: '#2563EB', // blue 600
    primaryText: '#FFFFFF',
    textOnPrimary: '#FFFFFF',
    accent: '#7C3AED', // violet 600

    success: '#10B981', // emerald 500
    warning: '#F59E0B', // amber 500
    danger: '#EF4444', // red 500
    info: '#3B82F6', // blue 500

    cardBg: '#FFFFFF',
    inputBg: '#F9FAFB',
    inputBorder: '#D1D5DB', // cool gray 300
    tabBarBg: '#FFFFFF',
    headerBg: '#FFFFFF',

    pressedOverlay: 'rgba(0, 0, 0, 0.1)',
    focusRing: 'rgba(37, 99, 235, 0.2)', // primary with opacity
    disabledBg: '#E5E7EB',
    disabledText: '#9CA3AF',

    shadow: '#000000',
};

export const darkColors: ThemeColors = {
    background: '#111827', // cool gray 900
    surface: '#1F2937', // cool gray 800
    surface2: '#374151', // cool gray 700
    surface3: '#4B5563', // cool gray 600
    surfaceHighlight: '#374151', // same as surface2

    textPrimary: '#F9FAFB', // cool gray 50
    textSecondary: '#D1D5DB', // cool gray 300
    textMuted: '#9CA3AF', // cool gray 400
    textInverse: '#111827',

    border: '#374151',
    divider: '#1F2937',

    primary: '#3B82F6', // blue 500
    primaryText: '#FFFFFF',
    textOnPrimary: '#FFFFFF',
    accent: '#8B5CF6', // violet 500

    success: '#34D399', // emerald 400
    warning: '#FBBF24', // amber 400
    danger: '#F87171', // red 400
    info: '#60A5FA', // blue 400

    cardBg: '#1F2937',
    inputBg: '#111827',
    inputBorder: '#374151',
    tabBarBg: '#1F2937',
    headerBg: '#111827',

    pressedOverlay: 'rgba(255, 255, 255, 0.1)',
    focusRing: 'rgba(59, 130, 246, 0.3)',
    disabledBg: '#374151',
    disabledText: '#6B7280',

    shadow: '#000000',
};
