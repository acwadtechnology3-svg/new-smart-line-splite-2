import React from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    View,
    ViewProps
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/useTheme';

interface ScreenProps extends ViewProps {
    unsafe?: boolean;
    keyboardAvoiding?: boolean;
    fixed?: boolean; // if true, does not wrap in scrollview (handled by children)
}

export const Screen: React.FC<ScreenProps> = ({
    unsafe = false,
    keyboardAvoiding = false,
    children,
    style,
    ...props
}) => {
    const { colors, resolvedScheme } = useTheme();
    const insets = useSafeAreaInsets();

    const Container = keyboardAvoiding ? KeyboardAvoidingView : View;

    const behavior = Platform.OS === 'ios' ? 'padding' : undefined;

    return (
        <Container
            behavior={behavior}
            style={[
                styles.container,
                {
                    backgroundColor: colors.background,
                    paddingTop: unsafe ? 0 : insets.top,
                    paddingBottom: unsafe ? 0 : insets.bottom,
                    paddingLeft: unsafe ? 0 : insets.left,
                    paddingRight: unsafe ? 0 : insets.right,
                },
                style,
            ]}
            {...props}
        >
            <StatusBar
                barStyle={resolvedScheme === 'dark' ? 'light-content' : 'dark-content'}
                backgroundColor={colors.background}
            />
            {children}
        </Container>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
