import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { Text } from '../../components/ui/Text';
import { Colors } from '../../constants/Colors';

export type ForceUpdateScreenProps = NativeStackScreenProps<RootStackParamList, 'ForceUpdate'>;

export default function ForceUpdateScreen({ route }: ForceUpdateScreenProps) {
    const { message, storeUrl } = route.params;

    const handleUpdate = async () => {
        if (storeUrl) {
            try {
                await Linking.openURL(storeUrl);
            } catch (error) {
                console.warn('[ForceUpdate] Failed to open store URL', error);
            }
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Image source={require('../../../assets/icon.png')} style={styles.appIcon} />
                <Text variant="h2" style={styles.title}>Update Required</Text>
                <Text variant="body" style={styles.message}>{message || 'Please update the app to continue.'}</Text>
                <TouchableOpacity style={styles.button} onPress={handleUpdate}>
                    <Text variant="body" weight="bold" style={styles.buttonText}>Update Now</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    card: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    appIcon: {
        width: 96,
        height: 96,
        borderRadius: 20,
        marginBottom: 16,
    },
    title: {
        color: Colors.primary,
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        color: '#374151',
        textAlign: 'center',
        marginBottom: 24,
    },
    button: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 16,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
});
