import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useThemeColors } from '../resources/themes/themeProvider';
import { useNavigation, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getChosenDiscount, Discount, chooseDiscount } from '../discount';
import { getBaseUrl, getToken } from '../config';
import { getOrder_id, getCurrentOrder, clearCurrentOrder } from '../cart';
import { useTranslation } from 'react-i18next';

export default function PaymentScreen() {
    const { theme, fontScale } = useThemeColors();
    const { t } = useTranslation();
    const router = useRouter();
    const navigation = useNavigation();

    const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvc, setCVC] = useState('');
    const [discount, setDiscount] = useState<Discount | null>(null);
    const [orderDetails, setOrderDetails] = useState<{
        total: number;
        itemsCount: number;
        deliveryType: 'delivery' | 'reservation';
    } | null>(null);

    useEffect(() => {
        const loadOrderDetails = () => {
            const order = getCurrentOrder();
            if (!order) {
                Alert.alert(t('common.error'), t('payment.noOrder'));
                router.back();
                return;
            }

            setOrderDetails({
                total: order.price,
                itemsCount: Number(order.items_end - order.items_start),
                deliveryType: order.id.startsWith('DEL') ? 'delivery' : 'reservation'
            });
        };

        const unsubscribe = navigation.addListener('focus', () => {
            setDiscount(getChosenDiscount());
            loadOrderDetails();
        });

        return unsubscribe;
    }, [navigation]);

    const handlePayment = async () => {
        if (paymentMethod === 'card' && (!cardNumber || !expiryDate || !cvc)) {
            Alert.alert(t('common.error'), t('payment.cardDetails'));
            return;
        }

        try {
            const query = `?token=${getToken()}&order_id=${getOrder_id()}`;
            const POD = paymentMethod === 'cash';
            const url = `http://${getBaseUrl()}/pay${query}&pay_on_delivery=${POD}`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    body: {
                        discount_used: discount?.id || null
                    }
                }),
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || t('payment.failed'));
            }

            // Clear application state
            chooseDiscount(null);
            setCartItems([]);
            clearCurrentOrder();
            
            router.push('/screens/confirmation');
        } catch (error) {
            console.error('Payment error:', error);
            Alert.alert(t('common.error'), error.message);
        }
    };

    if (!orderDetails) return null;

    const deliveryFee = orderDetails.deliveryType === 'delivery' ? 2.50 : 1.00;
    const discountValue = discount ? orderDetails.total * discount.effectivness : 0;
    const totalPrice = orderDetails.total + deliveryFee - discountValue;

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={28 * fontScale} color={theme.text} />
            </TouchableOpacity>

            <Text style={[styles.title, { color: theme.text, fontSize: 24 * fontScale }]}>
                {t('payment.title')}
            </Text>

            {/* Payment Method Selector */}
            <View style={styles.methodContainer}>
                {['card', 'cash'].map(method => (
                    <TouchableOpacity
                        key={method}
                        onPress={() => setPaymentMethod(method as 'card' | 'cash')}
                        style={[
                            styles.methodButton,
                            {
                                backgroundColor: paymentMethod === method ? theme.primary : theme.card,
                                borderColor: theme.border,
                            },
                        ]}
                    >
                        <Text style={[
                            styles.methodText,
                            { 
                                color: paymentMethod === method ? theme.background : theme.text,
                                fontSize: 16 * fontScale
                            }
                        ]}>
                            {t(`payment.methods.${method}`)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Card Details */}
            {paymentMethod === 'card' && (
                <View style={[styles.cardContainer, { backgroundColor: theme.card }]}>
                    <TextInput
                        style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                        placeholder={t('payment.cardNumber')}
                        placeholderTextColor={theme.placeholder}
                        keyboardType="numeric"
                        value={cardNumber}
                        onChangeText={setCardNumber}
                    />
                    
                    <View style={styles.row}>
                        <TextInput
                            style={[styles.input, styles.halfInput, { color: theme.text, borderColor: theme.border }]}
                            placeholder={t('payment.expiry')}
                            placeholderTextColor={theme.placeholder}
                            value={expiryDate}
                            onChangeText={setExpiryDate}
                        />
                        <TextInput
                            style={[styles.input, styles.halfInput, { color: theme.text, borderColor: theme.border }]}
                            placeholder={t('payment.cvc')}
                            placeholderTextColor={theme.placeholder}
                            keyboardType="numeric"
                            value={cvc}
                            onChangeText={setCVC}
                        />
                    </View>
                </View>
            )}

            {/* Order Summary */}
            <View style={[styles.summaryContainer, { backgroundColor: theme.card }]}>
                <Text style={[styles.summaryTitle, { color: theme.text, fontSize: 18 * fontScale }]}>
                    {t('payment.summary')}
                </Text>

                <View style={styles.summaryRow}>
                    <Text style={[styles.summaryText, { color: theme.text }]}>
                        {t('payment.items', { count: orderDetails.itemsCount })}
                    </Text>
                    <Text style={[styles.summaryText, { color: theme.text }]}>
                        {orderDetails.total.toFixed(2)} €
                    </Text>
                </View>

                {discount && (
                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryText, { color: theme.text }]}>
                            {t('payment.discount', { percent: discount.effectivness * 100 })}
                        </Text>
                        <Text style={[styles.summaryText, { color: theme.text }]}>
                            -{discountValue.toFixed(2)} €
                        </Text>
                    </View>
                )}

                <View style={styles.summaryRow}>
                    <Text style={[styles.summaryText, { color: theme.text }]}>
                        {t(`payment.${orderDetails.deliveryType}`)}
                    </Text>
                    <Text style={[styles.summaryText, { color: theme.text }]}>
                        {deliveryFee.toFixed(2)} €
                    </Text>
                </View>

                <View style={[styles.summaryRow, { borderTopWidth: 1, borderColor: theme.border }]}>
                    <Text style={[styles.summaryText, { fontWeight: 'bold', color: theme.text }]}>
                        {t('payment.total')}
                    </Text>
                    <Text style={[styles.summaryText, { fontWeight: 'bold', color: theme.text }]}>
                        {totalPrice.toFixed(2)} €
                    </Text>
                </View>
            </View>

            {/* Pay Button */}
            <TouchableOpacity
                style={[styles.payButton, { backgroundColor: theme.primary }]}
                onPress={handlePayment}
            >
                <Text style={[styles.payText, { color: theme.background, fontSize: 18 * fontScale }]}>
                    {t('payment.payButton')}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        zIndex: 1,
    },
    title: {
        textAlign: 'center',
        fontWeight: '600',
        marginTop: 60,
        marginBottom: 30,
    },
    methodContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    methodButton: {
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        minWidth: '40%',
        alignItems: 'center',
    },
    methodText: {
        fontWeight: '500',
    },
    cardContainer: {
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 15,
        fontSize: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfInput: {
        flex: 1,
        marginHorizontal: 5,
    },
    summaryContainer: {
        borderRadius: 10,
        padding: 20,
        marginBottom: 20,
    },
    summaryTitle: {
        fontWeight: '600',
        marginBottom: 15,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 5,
        paddingVertical: 5,
    },
    summaryText: {
        fontSize: 16,
    },
    payButton: {
        borderRadius: 10,
        padding: 18,
        alignItems: 'center',
        marginTop: 'auto',
    },
    payText: {
        fontWeight: '600',
    },
});

function setCartItems(arg0: never[]) {
    throw new Error('Function not implemented.');
}
