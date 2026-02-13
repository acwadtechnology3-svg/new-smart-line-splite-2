import React, { useState, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Linking, FlatList, ActivityIndicator, Alert, Platform } from 'react-native';
import { Colors } from '../../constants/Colors';
import { ArrowLeft, Phone, MessageCircle, Plus, MessageSquare } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { apiRequest } from '../../services/backend';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../theme/useTheme';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

export default function DriverSupportScreen() {
    const navigation = useNavigation<any>();
    const { t, isRTL } = useLanguage();
    const { colors, spacing, radius, shadow } = useTheme();
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showNewTicketInput, setShowNewTicketInput] = useState(false);
    const [newSubject, setNewSubject] = useState('');

    useFocusEffect(
        useCallback(() => {
            fetchTickets();
        }, [])
    );

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const data = await apiRequest<{ tickets: any[] }>('/support/tickets');
            if (data.tickets) {
                setTickets(data.tickets);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTicket = async () => {
        if (!newSubject.trim()) {
            Alert.alert(t('error'), t('enterSubjectError'));
            return;
        }

        try {
            const data = await apiRequest<{ ticket: any }>('/support/tickets', {
                method: 'POST',
                body: JSON.stringify({ subject: newSubject })
            });

            setNewSubject('');
            setShowNewTicketInput(false);
            fetchTickets();
            navigation.navigate('SupportChat', { ticketId: data.ticket.id, subject: data.ticket.subject });
        } catch (e: any) {
            Alert.alert(t('error'), e.message);
        }
    };

    const openWhatsApp = () => Linking.openURL('whatsapp://send?phone=+201000000000');
    const callSupport = () => Linking.openURL('tel:+201000000000');

    const rowStyle = { flexDirection: isRTL ? 'row-reverse' : 'row' } as any;
    const textAlign = { textAlign: isRTL ? 'right' : 'left' } as any;

    const renderTicket = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.ticketCard, rowStyle, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}
            onPress={() => navigation.navigate('SupportChat', { ticketId: item.id, subject: item.subject })}
        >
            <View style={[styles.ticketIcon, { marginRight: isRTL ? 0 : 12, marginLeft: isRTL ? 12 : 0, backgroundColor: colors.primary + '15' }]}>
                <MessageSquare size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                <Text variant="body" weight="bold" style={{ color: colors.textPrimary, marginBottom: 4 }}>{item.subject}</Text>
                <Text variant="caption" style={{ color: colors.textSecondary }}>
                    {new Date(item.updated_at || item.created_at).toLocaleDateString()}
                </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: item.status === 'open' ? colors.success + '20' : colors.surfaceHighlight }]}>
                <Text variant="caption" weight="bold" style={{ color: item.status === 'open' ? colors.success : colors.textSecondary }}>
                    {item.status.toUpperCase()}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, rowStyle, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { transform: [{ rotate: isRTL ? '180deg' : '0deg' }] }]}>
                    <ArrowLeft size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text variant="h2" style={{ color: colors.textPrimary }}>{t('support')}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Instant Actions */}
                <Text variant="h3" style={[textAlign, { color: colors.textPrimary, marginBottom: 12 }]}>{t('contactUs')}</Text>
                <View style={[styles.actionGrid, rowStyle]}>
                    <TouchableOpacity style={[styles.actionCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]} onPress={callSupport}>
                        <View style={[styles.iconBox, { backgroundColor: '#DBEAFE' }]}>
                            <Phone size={24} color="#2563EB" />
                        </View>
                        <Text variant="body" weight="medium" style={{ color: colors.textPrimary, marginTop: 8 }}>{t('callUs')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.actionCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]} onPress={openWhatsApp}>
                        <View style={[styles.iconBox, { backgroundColor: '#DCFCE7' }]}>
                            <MessageCircle size={24} color="#166534" />
                        </View>
                        <Text variant="body" weight="medium" style={{ color: colors.textPrimary, marginTop: 8 }}>{t('whatsapp')}</Text>
                    </TouchableOpacity>
                </View>

                {/* My Tickets */}
                <View style={[styles.ticketsHeader, rowStyle]}>
                    <Text variant="h3" style={{ color: colors.textPrimary }}>{t('myRequests')}</Text>
                    <TouchableOpacity
                        style={[styles.newButton, { flexDirection: isRTL ? 'row-reverse' : 'row', backgroundColor: colors.primary }]}
                        onPress={() => setShowNewTicketInput(!showNewTicketInput)}
                    >
                        <Plus size={20} color={colors.textOnPrimary} />
                        <Text variant="small" weight="bold" style={{ color: colors.textOnPrimary }}>{t('newSupportRequest')}</Text>
                    </TouchableOpacity>
                </View>

                {showNewTicketInput && (
                    <View style={[styles.newTicketBox, { backgroundColor: colors.surface }]}>
                        <Text variant="body" weight="bold" style={[textAlign, { marginBottom: 12, color: colors.textPrimary }]}>{t('whatIsYourIssue')}</Text>
                        <Input
                            placeholder={t('enterSubject')}
                            value={newSubject}
                            onChangeText={setNewSubject}
                            containerStyle={{ marginBottom: 12 }}
                        />
                        <Button
                            title={t('startChat')}
                            onPress={handleCreateTicket}
                            size="small"
                        />
                    </View>
                )}

                {loading ? (
                    <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
                ) : tickets.length === 0 ? (
                    <View style={styles.emptyBox}>
                        <Text variant="body" style={{ color: colors.textSecondary }}>{t('noTickets')}</Text>
                    </View>
                ) : (
                    <View style={styles.ticketList}>
                        {tickets.map(ticket => <View key={ticket.id}>{renderTicket({ item: ticket })}</View>)}
                    </View>
                )}

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
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        zIndex: 10
    },
    backButton: { padding: 4 },
    content: { padding: 20 },

    actionGrid: { justifyContent: 'space-between', marginBottom: 32 },
    actionCard: {
        flex: 1, borderRadius: 16, padding: 16, marginHorizontal: 4,
        alignItems: 'center', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2
    },
    iconBox: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },

    ticketsHeader: { justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    newButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, alignItems: 'center', gap: 4 },

    ticketList: { gap: 12 },
    ticketCard: {
        alignItems: 'center', padding: 16, borderRadius: 12,
        marginBottom: 12, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1
    },
    ticketIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },

    newTicketBox: { padding: 16, borderRadius: 12, marginBottom: 20 },

    emptyBox: { alignItems: 'center', padding: 20 },
});
