import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Alert} from 'react-native';
import { useThemeColors } from '../resources/themes/themeProvider';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getChosenDiscount, Discount, getDPs, getAvaiableDiscounts, chooseDiscount } from '../discount';

export default function PaymentScreen() {
    const { theme, fontScale } = useThemeColors();
    const router = useRouter();

    // MOCKED DATA
    const isRegisteredUser = true;
    const orderId = 'ORD12345';
    const totalPrice = 27.40;
    const itemCount = 5;
    const deliveryType = 'delivery';
    //const discount = 0.10;

    const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvc, setCVC] = useState('');
    const [discount, setDiscount] = useState<Discount|null>(null);
    const [discountOptions, setDiscountOptions] = useState<Discount[]>([]);
    const [availableDPs, setAvailableDPs] = useState<number>(0);

    useEffect(() => {
        setDiscount(getChosenDiscount());
        setDiscountOptions(getAvaiableDiscounts());
        setAvailableDPs(getDPs());
    },);

    const handlePayment = () => {
        if (paymentMethod === 'card' && (!cardNumber || !expiryDate || !cvc)) {
            Alert.alert('Chyba', 'Prosím, vyplňte všetky údaje o karte.');
            return;
        }

        if (paymentMethod === 'cash' && !isRegisteredUser) {
            Alert.alert('Iba pre registrovaných', 'Platba po doručení je dostupná len pre registrovaných používateľov.');
            return;
        }

        Alert.alert('Platba prebehla úspešne!', `ID objednávky: ${orderId}`);
        router.push('/screens/account');
    };

    const discountedPrice = totalPrice - totalPrice * (discount? discount.effectivness: 0);
    const deliveryFee = deliveryType === 'delivery' ? 2.50 : 0;

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Top bar */}
            <TouchableOpacity onPress={() => router.back()} style={styles.backTriangle} />
            <View style={styles.accountIcon}>
                <TouchableOpacity onPress={() => router.push('/screens/account')}>
                    <Ionicons name="person-circle" size={44} color={theme.text} />
                </TouchableOpacity>
            </View>

            <Text style={[styles.title, { color: theme.text, fontSize: 20 * fontScale }]}>Platba</Text>

            {/* Payment Method Selector */}
            <View style={styles.methodSelector}>
                {['card', 'cash'].map((method) => (
                    <TouchableOpacity
                        key={method}
                        onPress={() => setPaymentMethod(method as 'card' | 'cash')}
                        style={[
                            styles.methodButton,
                            {
                                backgroundColor: paymentMethod === method ? theme.primary : theme.secondary,
                                borderColor: theme.border,
                            },
                        ]}
                    >
                        <Text style={{ color: paymentMethod === method ? theme.background : theme.text }}>
                            {method === 'card' ? 'Kartou' : 'Po doručení'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Card Payment Fields */}
            {paymentMethod === 'card' && (
                <View style={[styles.cardSection, { backgroundColor: theme.card }]}>
                    <View style={styles.cardHeader}>
                        <Text style={[styles.cardLabel, { color: theme.text }]}>Údaje o karte</Text>
                        <Image
                            source={require('../resources/images/card_icon.png')}
                            style={styles.cardIcons}
                            resizeMode="contain"
                        />
                    </View>
                    <TextInput
                        style={[styles.input, { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border }]}
                        placeholder="Číslo karty"
                        placeholderTextColor={theme.placeholder}
                        keyboardType="numeric"
                        value={cardNumber}
                        onChangeText={setCardNumber}
                    />
                    <View style={styles.row}>
                        <TextInput
                            style={[styles.input, styles.halfInput, { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border }]}
                            placeholder="Platnosť (MM/YY)"
                            placeholderTextColor={theme.placeholder}
                            value={expiryDate}
                            onChangeText={setExpiryDate}
                        />
                        <TextInput
                            style={[styles.input, styles.halfInput, { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border }]}
                            placeholder="CVC"
                            placeholderTextColor={theme.placeholder}
                            keyboardType="numeric"
                            value={cvc}
                            onChangeText={setCVC}
                        />
                    </View>
                </View>
            )}

            {/* Summary Section */}
            <View style={[styles.summarySection,{flexDirection: 'row', justifyContent: 'space-between'}]}>
                <View>
                    <Text style={[styles.summaryText, { color: theme.text }]}>Počet položiek: {itemCount}</Text>
                    <Text style={[styles.summaryText, { color: theme.text }]}>Cena: {totalPrice.toFixed(2)} €</Text>
                    {discount && (
                        <Text style={[styles.summaryText, { color: theme.text }]}>Zľava: -{(discount.effectivness * 100).toFixed(0)}%</Text>
                    )}
                    <Text style={[styles.summaryText, { color: theme.text }]}>
                        {deliveryType === 'delivery' ? 'Doručenie: 2.50 €' : 'Rezervácia: 1.00 €'}
                    </Text>
                    <Text style={[styles.summaryText, { color: theme.text, fontWeight: 'bold' }]}>
                        Spolu: {(discountedPrice + deliveryFee).toFixed(2)} €
                    </Text>
                </View>

                <View style={styles.discountColumn}>
                            {discountOptions.map((discOpt) => (
                                
                                <TouchableOpacity
                                    key={discOpt.id}
                                onPress = {()=>{
                                    if(getChosenDiscount() && getChosenDiscount()!.id===discOpt.id){
                                        chooseDiscount(null);
                                        setDiscount(null);
                                    }
                                    else{
                                        chooseDiscount(discOpt);
                                        setDiscount(discOpt);
                                        console.log('discount chosen',discOpt.id);
                                    }
                                }}>
                                    <Text
                                        
                                        style={[
                                        styles.discountText,
                                        {
                                            opacity: availableDPs >= discOpt.cost ? 1 : 0.4,
                                            color: theme.text,
                                            fontSize: 14 * fontScale,
                                            fontWeight: (discount ? 'bold' : 'normal'),
                                        },
                                        ]}
                                    >
                                        zľava {discOpt.effectivness.toFixed(2)}%
                                    </Text>
                                </TouchableOpacity>
                            ))}
                          </View>
            </View>


            {/* QR Section - just in case!!!*/}
            {paymentMethod === 'cash' && isRegisteredUser && (
                <View style={[styles.qrContainer, { borderWidth: 1, borderColor: theme.border, borderRadius: 8, padding: 10 }]}>
                    <Text style={[styles.summaryText, { color: theme.text }]}>Vaše potvrdenie:</Text>
                    <Image
                        source={require('../resources/images/beer.png')}
                        style={styles.qrImage}
                        resizeMode="contain"
                    />
                </View>
            )}

            {/* Pay Button  */}
            <View style={{ marginTop: 'auto' }}>
                <TouchableOpacity
                    onPress={() => {
                        handlePayment();
                        if (isRegisteredUser) {
                            router.push('/screens/add_bonus');
                        }
                    }}
                    style={[styles.payButton, { backgroundColor: theme.primary }]}
                >
                    <Text style={[styles.payText, { fontSize: 16 * fontScale }]}>Zaplatiť</Text>
                </TouchableOpacity>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 70,
        paddingHorizontal: 20,
    },
    backTriangle: {
        position: 'absolute',
        top: 42,
        left: 16,
        width: 0,
        height: 0,
        borderStyle: 'solid',
        borderTopWidth: 12,
        borderBottomWidth: 12,
        borderRightWidth: 18,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        borderRightColor: '#f4e4d4',
    },
    accountIcon: {
        position: 'absolute',
        top: 38,
        right: 16,
    },
    title: {
        textAlign: 'center',
        fontWeight: '600',
        marginBottom: 20,
    },
    methodSelector: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginBottom: 20,
    },
    methodButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        borderWidth: 1,
    },
    cardSection: {
        padding: 16,
        borderRadius: 10,
        marginBottom: 24,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfInput: {
        flex: 1,
        marginHorizontal: 4,
    },
    cardIcons: {
        width: 60,
        height: 40,
    },
    summarySection: {
        marginBottom: 20,
    },
    summaryText: {
        fontSize: 16,
        marginVertical: 2,
    },
    qrContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    qrImage: {
        width: 100,
        height: 100,
        marginTop: 10,
    },
    payButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 4,
    },
    payText: {
        fontWeight: '600',
        color: 'white',
    },
    discountColumn: {
      marginRight: 10,
      alignItems: 'flex-end',
    },
    discountText: {
      marginVertical: 4,
    },
});
