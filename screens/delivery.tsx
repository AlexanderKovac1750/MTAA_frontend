import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Dimensions, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useThemeColors } from '../resources/themes/themeProvider';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getBaseUrl, getToken } from '../config';
import { getCartItems, getTotalCount, getCurrentOrder, clearCurrentOrder } from '../cart';
import { Discount, getChosenDiscount } from '../discount';
import { useTranslation } from 'react-i18next';

export default function DeliveryScreen() {
    const router = useRouter();
    const orderInfo = getCurrentOrder();
    // if (!orderInfo) {
    //     // Handle case where there's no order (maybe navigate back)
    //     router.back();
    //     return null;
    // }

    const { theme, fontScale } = useThemeColors();
    const { t } = useTranslation();

    // State management
    const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
    const [marker, setMarker] = useState<{ latitude: number; longitude: number } | null>(null);
    const [street, setStreet] = useState('');
    const [number, setNumber] = useState('');
    const [postcode, setPostcode] = useState('');
    const [comment, setComment] = useState('');
    const [tab, setTab] = useState<'delivery' | 'reservation'>('delivery');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimeFromPicker, setShowTimeFromPicker] = useState(false);
    const [showTimeToPicker, setShowTimeToPicker] = useState(false);
    const [date, setDate] = useState<Date | null>(null);
    const [timeFrom, setTimeFrom] = useState<Date | null>(null);
    const [timeTo, setTimeTo] = useState<Date | null>(null);
    const [guestCount, setGuestCount] = useState(1);
    const maxGuests = 8;

    // Location permissions and initial position
    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;
            
            let current = await Location.getCurrentPositionAsync({});
            setLocation(current.coords);
            setMarker({
                latitude: current.coords.latitude,
                longitude: current.coords.longitude,
            });
        })();
    }, []);

    // Geocoding for address inputs
    useEffect(() => {
        if (street && number && postcode) {
            (async () => {
                try {
                    const geocode = await Location.geocodeAsync(`${street} ${number}, ${postcode}`);
                    if (geocode.length > 0) {
                        const { latitude, longitude } = geocode[0];
                        setMarker({ latitude, longitude });
                    }
                } catch {}
            })();
        }
    }, [street, number, postcode]);

    // Map marker handling
    const handleMarkerDragEnd = async (e: any) => {
        const { latitude, longitude } = e.nativeEvent.coordinate;
        setMarker({ latitude, longitude });
        const result = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (result.length > 0) {
            const place = result[0];
            setStreet(place.street || '');
            setNumber(place.name || '');
            setPostcode(place.postalCode || '');
        }
    };

    // Date/time formatting helpers
    const formatDate = (date: Date): string => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    };

    const formatTime = (date: Date): string => {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    // Date/time picker handlers
    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) setDate(selectedDate);
    };

    const handleTimeFromChange = (event: any, selectedTime?: Date) => {
        setShowTimeFromPicker(false);
        if (selectedTime) setTimeFrom(selectedTime);
    };

    const handleTimeToChange = (event: any, selectedTime?: Date) => {
        setShowTimeToPicker(false);
        if (selectedTime) setTimeTo(selectedTime);
    };

    // Guest count controls
    const incrementGuests = () => {
        if (guestCount < maxGuests) setGuestCount(guestCount + 1);
        else Alert.alert(t('common.notice'), t('delivery.maxGuests', { count: maxGuests }));
    };

    const decrementGuests = () => {
        if (guestCount > 1) setGuestCount(guestCount - 1);
    };

    // Order submission logic
    const pay = () => {
        const orderInfo = getCurrentOrder();
        if (!orderInfo) {
            Alert.alert(t('common.error'), t('order.noActive'));
            return;
        }

        const cartItems = getCartItems();
        if (!cartItems.every(item => item.meal && item.meal.title)) {
            Alert.alert(t('common.error'), t('cart.invalidItems'));
            return;
        }

        const body: any = {
            items: cartItems.map(({ meal, size, count }) => ({
                name: meal.title,
                size,
                count
            })),
            comment: comment,
        };

        if (tab === 'delivery') {
            if (getTotalCount() === 0) {
                Alert.alert(t('common.error'), t('cart.empty'));
                return;
            }

            if (!street?.trim() || !postcode?.trim() || !number?.trim()) {
                Alert.alert(t('common.error'), t('delivery.addressRequired'));
                return;
            }

            const houseNumber = parseInt(number);
            if (isNaN(houseNumber)) {
                Alert.alert(t('common.error'), t('delivery.invalidNumber'));
                return;
            }

            body.address = {
                "postal code": postcode.trim(),
                street: street.trim(),
                number: houseNumber
            };
        } else if (tab === 'reservation') {
            const now = new Date();
            if (!date || !timeFrom || !timeTo) {
                Alert.alert(t('common.error'), t('reservation.timeRequired'));
                return;
            }

            if (date < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
                Alert.alert(t('common.error'), t('reservation.pastDate'));
                return;
            }

            if (timeFrom >= timeTo) {
                Alert.alert(t('common.error'), t('reservation.timeOrder'));
                return;
            }

            body.people = guestCount;
            body.datetime = {
                date: formatDate(date),
                from: formatTime(timeFrom),
                until: formatTime(timeTo),
            };
        }

        const discount = getChosenDiscount();
        if (discount) {
            body.discount_used = discount.id;
        }

        sendOrder(body, tab);
    };

    // API communication
    const sendOrder = async (body: any, type: 'delivery' | 'reservation') => {
        try {
            const orderInfo = getCurrentOrder();
            if (!orderInfo) {
                Alert.alert(t('common.error'), t('order.noActive'));
                return;
            }

            const token = getToken();
            if (!token) {
                Alert.alert(t('common.error'), t('auth.required'));
                return;
            }

            const response = await fetch(`http://${getBaseUrl()}/${type}?token=${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...body,
                    order_id: orderInfo.id
                }),
            });

            const result = await response.json();
            
            if (response.ok) {
                router.push('/screens/payment');
            } else {
                Alert.alert(t('common.error'), result.message || t('order.failed'));
            }
        } catch (error) {
            console.error('Error:', error);
            const errorMessage = error instanceof Error ? error.message : t('common.unknownError');
            Alert.alert(t('common.error'), errorMessage);
        }
    };


return (
    <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
    <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header Section */}
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
                <View style={[styles.backTriangle, { borderRightColor: theme.text }]} />
            </TouchableOpacity>

            <Text style={[
                styles.title, 
                { 
                    color: theme.text,
                    fontSize: 20 * fontScale
                }]}
            >
                {t('delivery.title')}
            </Text>

            <TouchableOpacity onPress={() => router.push('/screens/account')}>
                <Ionicons 
                    name="person-circle" 
                    size={36 * fontScale} 
                    color={theme.text} 
                />
            </TouchableOpacity>
        </View>

        {/* Delivery/Reservation Toggle */}
        <View style={styles.row}>
            <Pressable 
                style={[
                    styles.option, 
                    tab === 'reservation' ? 
                    { backgroundColor: theme.primary } : 
                    { backgroundColor: theme.secondary }
                ]} 
                onPress={() => setTab('reservation')}
            >
                <Text style={{ 
                    color: tab === 'reservation' ? theme.background : theme.text,
                    fontSize: 14 * fontScale
                }}>
                    {t('delivery.reservation')}
                </Text>
            </Pressable>
            <Pressable 
                style={[
                    styles.option, 
                    tab === 'delivery' ? 
                    { backgroundColor: theme.primary } : 
                    { backgroundColor: theme.secondary }
                ]} 
                onPress={() => setTab('delivery')}
            >
                <Text style={{ 
                    color: tab === 'delivery' ? theme.background : theme.text,
                    fontSize: 14 * fontScale
                }}>
                    {t('delivery.delivery')}
                </Text>
            </Pressable>
        </View>

        {tab === 'delivery' ? (
            <>
                {/* Delivery Address Inputs */}
                <TextInput
                    style={[
                        styles.input, 
                        { 
                            backgroundColor: theme.card, 
                            color: theme.text,
                            fontSize: 14 * fontScale
                        }
                    ]}
                    placeholder={t('delivery.street')}
                    placeholderTextColor={theme.placeholder}
                    value={street}
                    onChangeText={setStreet}
                />
                <View style={styles.row}>
                    <TextInput
                        style={[
                            styles.input, 
                            styles.halfInput, 
                            { 
                                backgroundColor: theme.card, 
                                color: theme.text,
                                fontSize: 14 * fontScale
                            }
                        ]}
                        placeholder={t('delivery.number')}
                        placeholderTextColor={theme.placeholder}
                        value={number}
                        onChangeText={setNumber}
                        keyboardType="numeric"
                    />
                    <TextInput
                        style={[
                            styles.input, 
                            styles.halfInput, 
                            { 
                                backgroundColor: theme.card, 
                                color: theme.text,
                                fontSize: 14 * fontScale
                            }
                        ]}
                        placeholder={t('delivery.postcode')}
                        placeholderTextColor={theme.placeholder}
                        value={postcode}
                        onChangeText={setPostcode}
                        keyboardType="numeric"
                    />
                </View>

                {/* Map View */}
                {location && (
                    <MapView
                        style={styles.map}
                        region={{
                            latitude: marker?.latitude || location.latitude,
                            longitude: marker?.longitude || location.longitude,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        }}
                        onPress={handleMarkerDragEnd}
                    >
                        {marker && (
                            <Marker 
                                coordinate={marker} 
                                draggable 
                                onDragEnd={handleMarkerDragEnd} 
                            />
                        )}
                    </MapView>
                )}
            </>
        ) : (
            <>
                {/* Reservation Controls */}
                <View style={styles.row}>
                    <TextInput
                        style={[
                            styles.input, 
                            { 
                                flex: 1, 
                                backgroundColor: theme.card, 
                                color: theme.text,
                                fontSize: 14 * fontScale
                            }
                        ]}
                        placeholder={t('reservation.date')}
                        placeholderTextColor={theme.placeholder}
                        value={date ? date.toLocaleDateString() : ''}
                        editable={false}
                    />
                    <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                        <Ionicons 
                            name="calendar" 
                            size={28 * fontScale} 
                            color={theme.text} 
                            style={{ marginLeft: 8, marginTop: 20 }}
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.row}>
                    <TextInput
                        style={[
                            styles.input, 
                            styles.halfInput, 
                            { 
                                backgroundColor: theme.card, 
                                color: theme.text,
                                fontSize: 14 * fontScale
                            }
                        ]}
                        placeholder={t('reservation.from')}
                        placeholderTextColor={theme.placeholder}
                        value={timeFrom ? formatTime(timeFrom) : ''}
                        editable={false}
                    />
                    <TouchableOpacity onPress={() => setShowTimeFromPicker(true)}>
                        <Ionicons 
                            name="time" 
                            size={28 * fontScale} 
                            color={theme.text} 
                            style={{ marginTop: 20 }}
                        />
                    </TouchableOpacity>

                    <TextInput
                        style={[
                            styles.input, 
                            styles.halfInput, 
                            { 
                                backgroundColor: theme.card, 
                                color: theme.text,
                                fontSize: 14 * fontScale
                            }
                        ]}
                        placeholder={t('reservation.to')}
                        placeholderTextColor={theme.placeholder}
                        value={timeTo ? formatTime(timeTo) : ''}
                        editable={false}
                    />
                    <TouchableOpacity onPress={() => setShowTimeToPicker(true)}>
                        <Ionicons 
                            name="time" 
                            size={28 * fontScale} 
                            color={theme.text} 
                            style={{ marginTop: 20 }}
                        />
                    </TouchableOpacity>
                </View>

                {/* Guest Counter */}
                <View style={[styles.row, { alignItems: 'center', marginTop: 16 }]}>
                    <Text style={{ 
                        color: theme.text,
                        fontSize: 14 * fontScale
                    }}>
                        {t('reservation.guests')}
                    </Text>
                    <TouchableOpacity 
                        style={[
                            styles.option,
                            { paddingHorizontal: 16 * fontScale }
                        ]} 
                        onPress={decrementGuests}
                    >
                        <Text style={{ fontSize: 16 * fontScale }}>-</Text>
                    </TouchableOpacity>
                    <Text style={{ 
                        color: theme.text,
                        fontSize: 16 * fontScale,
                        marginHorizontal: 8
                    }}>
                        {guestCount}
                    </Text>
                    <TouchableOpacity 
                        style={[
                            styles.option,
                            { paddingHorizontal: 16 * fontScale }
                        ]} 
                        onPress={incrementGuests}
                    >
                        <Text style={{ fontSize: 16 * fontScale }}>+</Text>
                    </TouchableOpacity>
                </View>
            </>
            )}

            {/* Comment Input */}
            <TextInput
                style={[
                    styles.commentInput, 
                    { 
                        backgroundColor: theme.card, 
                        color: theme.text,
                        fontSize: 14 * fontScale
                    }
                ]}
                placeholder={t('common.comment')}
                placeholderTextColor={theme.placeholder}
                value={comment}
                onChangeText={setComment}
                multiline
            />

            {/* DateTime Pickers */}
            {showDatePicker && (
                <DateTimePicker 
                    value={date || new Date()}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                />
            )}
            {showTimeFromPicker && (
                <DateTimePicker
                    value={timeFrom || new Date()}
                    mode="time"
                    display="default"
                    onChange={handleTimeFromChange}
                />
            )}
            {showTimeToPicker && (
                <DateTimePicker
                    value={timeTo || new Date()}
                    mode="time"
                    display="default"
                    onChange={handleTimeToChange}
                />
            )}

            {/* Payment Button */}
            <Pressable
                style={[
                    styles.payBtn, 
                    { 
                        backgroundColor: theme.card,
                        marginTop: 16 * fontScale
                    }
                ]}
                onPress={pay}
            >
                <Text style={{ 
                    color: theme.text,
                    fontSize: 16 * fontScale 
                }}>
                    {t('payment.pay')}
                </Text>
            </Pressable>
        </View>
    </KeyboardAvoidingView>
);
};

// Styles remain the same as previous implementation
const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backTriangle: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderTopWidth: 12,
        borderBottomWidth: 12,
        borderRightWidth: 18,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
    },
    title: {
        fontWeight: '600',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    option: {
        padding: 10,
        borderRadius: 6,
        alignItems: 'center',
        backgroundColor: '#ccc',
        minWidth: 40,
    },
    input: {
        marginTop: 16,
        borderRadius: 6,
        padding: 12,
    },
    halfInput: {
        flex: 1,
        marginHorizontal: 4,
    },
    map: {
        height: 250,
        width: '100%',
        marginTop: 16,
        borderRadius: 6,
    },
    commentInput: {
        marginTop: 16,
        borderRadius: 6,
        padding: 12,
        height: 100,
    },
    payBtn: {
        padding: 16,
        alignItems: 'center',
        borderRadius: 6,
        marginBottom: 16,
    },
});