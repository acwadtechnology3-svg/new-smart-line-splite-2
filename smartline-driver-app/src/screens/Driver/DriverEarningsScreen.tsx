import React, { useEffect, useState } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView, Alert, Platform } from 'react-native';
import { Colors } from '../../constants/Colors';
import { ArrowLeft, Wallet, TrendingUp, Calendar } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { Dimensions } from "react-native";
import { apiRequest } from '../../services/backend';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../theme/useTheme';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';

const screenWidth = Dimensions.get("window").width;

export default function DriverEarningsScreen() {
    const navigation = useNavigation<any>();
    const { t, isRTL } = useLanguage();
    const { colors, spacing, radius, shadow } = useTheme();
    const [totalEarnings, setTotalEarnings] = useState(0);
    const [todayEarnings, setTodayEarnings] = useState(0);
    const [tripCount, setTripCount] = useState(0);

    useEffect(() => {
        fetchEarnings();
    }, []);

    const fetchEarnings = async () => {
        try {
            const [walletData, tripsData] = await Promise.all([
                apiRequest<{ balance: number, today_earnings: number }>('/wallet/summary'),
                apiRequest<{ trips: any[] }>('/trips/driver/history')
            ]);

            setTotalEarnings(walletData.balance || 0);
            setTodayEarnings(walletData.today_earnings || 0);

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const todayTrips = (tripsData.trips || []).filter((t: any) =>
                new Date(t.created_at) >= today && t.status === 'completed'
            );

            setTripCount(todayTrips.length);
        } catch (error) {
            console.error('Error fetching earnings:', error);
        }
    };

    const rowStyle = { flexDirection: isRTL ? 'row-reverse' : 'row' } as any;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, rowStyle, { backgroundColor: colors.surface, borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { transform: [{ rotate: isRTL ? '180deg' : '0deg' }] }]}>
                    <ArrowLeft size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text variant="h2" style={{ color: colors.textPrimary }}>{t('earnings')}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Total Balance Card */}
                <View style={[styles.balanceCard, { backgroundColor: colors.primary, shadowColor: colors.primary }]}>
                    <Text variant="body" style={{ color: colors.textOnPrimary, opacity: 0.8 }}>{t('totalBalance')}</Text>
                    <Text variant="h1" style={{ color: colors.textOnPrimary, marginVertical: 8, fontSize: 32 }}>EGP {totalEarnings.toFixed(2)}</Text>
                    <View style={styles.payoutRow}>
                        <Text variant="caption" style={{ color: colors.textOnPrimary }}>{t('availableWithdrawal')}</Text>
                    </View>
                </View>

                {/* Quick Stats Grid */}
                <View style={[styles.statsGrid, rowStyle]}>
                    <Card style={styles.statBox}>
                        <View style={[styles.iconBg, { backgroundColor: colors.info + '20' }]}>
                            <TrendingUp size={20} color={colors.info} />
                        </View>
                        <Text variant="caption" style={{ color: colors.textSecondary }}>{t('today')}</Text>
                        <Text variant="h3" style={{ color: colors.textPrimary }}>EGP {todayEarnings}</Text>
                    </Card>
                    <Card style={styles.statBox}>
                        <View style={[styles.iconBg, { backgroundColor: colors.success + '20' }]}>
                            <Wallet size={20} color={colors.success} />
                        </View>
                        <Text variant="caption" style={{ color: colors.textSecondary }}>{t('trips')}</Text>
                        <Text variant="h3" style={{ color: colors.textPrimary }}>{tripCount}</Text>
                    </Card>
                    <Card style={styles.statBox}>
                        <View style={[styles.iconBg, { backgroundColor: colors.primary + '20' }]}>
                            <Calendar size={20} color={colors.primary} />
                        </View>
                        <Text variant="caption" style={{ color: colors.textSecondary }}>{t('hours')}</Text>
                        <Text variant="h3" style={{ color: colors.textPrimary }}>5.5</Text>
                    </Card>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: Platform.OS === 'android' ? 50 : 20,
        zIndex: 10
    },
    backButton: { padding: 4 },

    content: { padding: 20 },

    balanceCard: {
        borderRadius: 20, padding: 24, marginBottom: 24,
        alignItems: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8
    },
    payoutRow: { marginTop: 8, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },

    statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    statBox: {
        flex: 1, padding: 16, marginHorizontal: 4,
        alignItems: 'center'
    },
    iconBg: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
});
