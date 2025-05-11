import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Dimensions, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useThemeColors } from '../resources/themes/themeProvider';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { extractNumberFromMoneyString, getBaseUrl, getToken } from '../config';
import { getCartItems, getOrder_id, getOrder_price, getTotalCount, setOrder_id, setOrder_price, setOrder_type } from '../cart';
import { chooseDiscount, Discount, getChosenDiscount } from '../discount';

export default function DeliveryScreen() {
    const { theme, fontScale } = useThemeColors();
    const router = useRouter();

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

    const incrementGuests = () => {
        if (guestCount < maxGuests) setGuestCount(guestCount + 1);
        else Alert.alert('Upozornenie', 'Maximálny počet hostí je 8.');
    };

    const decrementGuests = () => {
        if (guestCount > 1) setGuestCount(guestCount - 1);
    };

    const formatDate = (rawDate: string | Date): string => {
        const date = new Date(rawDate);

        const day = String(date.getDate()).padStart(2, '0');        // DD
        const month = String(date.getMonth() + 1).padStart(2, '0');  // MM (0-indexed)
        const year = date.getFullYear();                             // YYYY

        return `${day}.${month}.${year}`;
    };

    const formatTime = (rawDate: string | Date): string => {
        const date = new Date(rawDate);

        const hours = String(date.getHours()).padStart(2, '0');   // HH
        const minutes = String(date.getMinutes()).padStart(2, '0'); // MM

        return `${hours}:${minutes}`;
    };

    const pay = () => {
        //create order
        const items = getCartItems().map(({ name, size, count }) => ({ name:name, size:size, count:count}));
        const discount: Discount|null = getChosenDiscount();

        const body:any ={
            "items": items,
        }

        if(true){
            if(tab==='delivery'){

                if(getTotalCount()===0){
                    Alert.alert('Shopping cart is empty, delivery requires items to deliver');
                    return;
                }

                if(street===''){
                    Alert.alert('please choose street');
                    return;
                }
                if(postcode===''){
                    Alert.alert('please choose post code');
                    return;
                }

                if(number===''){
                    Alert.alert('please choose house number');
                    return;
                }
                try{
                    const house_number:number = parseInt(number);

                    body['address']={
                            "postal code": postcode,
                            "street": street,
                            "number": house_number
                        }

                    console.log('requesting delivery', body);
                }
                catch{
                    Alert.alert('please choose valid house number');
                    return;
                }
                
            }
            if(tab==='reservation'){

                if(date===null){
                    Alert.alert('please choose day');
                    return;
                }
                if(timeFrom===null){
                    Alert.alert('please choose timeFrom');
                    return;
                }
                if(timeTo===null){
                    Alert.alert('please choose timeTo');
                    return;
                }

                body.people=guestCount;

                body["datetime"]= {
                    "date": formatDate(date),
                    "from": formatTime(timeFrom),
                    "until": formatTime(timeTo),
                    }

                console.log('making reservation', body);
            }
        }
        
        if(comment!==''){
            body.comment = comment;
        }
        if(discount!==null){
            body['discount used']=discount.id;
        }
        
        sendOrder(body, tab)
    }

    const sendOrder = async (body, type) => {
        try {
            const query = `?token=${getToken()}`;
            const url = `http://${getBaseUrl()}/${type}${query}`;
            
            const response = await fetch(`${url}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ body }), // wrapping inside an object is optional, depending on API
            });

            const result = await response.json();
            if(response.status<500 && response.status>=400){
                Alert.alert('reservation issue:',result.message);
            }
            console.log('Server response:', result.message);

            if(response.ok){
                const price_num=extractNumberFromMoneyString(result.price);
                setOrder_price(price_num);
                setOrder_id(result['order id']);
                setOrder_type(tab);
                console.log(`Order made [${getOrder_id()}] for ${getOrder_price()}`);       
                router.push('./payment');
            }
        } catch (error) {
            console.error('Error sending data:', error);
        }
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.container, { backgroundColor: theme.background }]}>

            <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
                <View style={styles.backTriangle} />
            </TouchableOpacity>

            <Text style={[styles.title, { color: theme.text }]}>spôsob doručenia</Text>

            <TouchableOpacity onPress={() => {console.log('Account pressed'); router.push('/screens/account'); }}>
                <Ionicons name="person-circle" size={36 * fontScale} color={theme.text} />
            </TouchableOpacity>
            </View>

            <View style={styles.row}>
            <Pressable style={[styles.option, tab === 'reservation' ? { backgroundColor: theme.primary } : { backgroundColor: theme.secondary }]} onPress={() => setTab('reservation')}>
                <Text style={{ color: tab === 'reservation' ? theme.background : theme.text }}>rezervácia</Text>
            </Pressable>
            <Pressable style={[styles.option, tab === 'delivery' ? { backgroundColor: theme.primary } : { backgroundColor: theme.secondary }]} onPress={() => setTab('delivery')}>
                <Text style={{ color: tab === 'delivery' ? theme.background : theme.text }}>donáška</Text>
            </Pressable>
            </View>

            {tab === 'delivery' && (
            <>
                <TextInput
                style={[styles.input, { backgroundColor: theme.card, color: theme.text }]} placeholder="ulica" placeholderTextColor={theme.placeholder} value={street} onChangeText={setStreet} />
                <View style={styles.row}>
                <TextInput
                    style={[styles.input, styles.halfInput, { backgroundColor: theme.card, color: theme.text }]} placeholder="číslo" placeholderTextColor={theme.placeholder} value={number} onChangeText={setNumber} />
                <TextInput
                    style={[styles.input, styles.halfInput, { backgroundColor: theme.card, color: theme.text }]} placeholder="PSČ" placeholderTextColor={theme.placeholder} value={postcode} onChangeText={setPostcode} />
                </View>

                {location && (
                <MapView
                    style={styles.map}
                    region={{
                    latitude: marker?.latitude || location.latitude,
                    longitude: marker?.longitude || location.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                    }}
                    onPress={(e) => handleMarkerDragEnd(e)}
                >
                    {marker && <Marker coordinate={marker} draggable onDragEnd={handleMarkerDragEnd} />}
                </MapView>
                )}

                <TextInput
                style={[styles.commentInput, { backgroundColor: theme.card, color: theme.text }]} placeholder="komentár" placeholderTextColor={theme.placeholder} value={comment} onChangeText={setComment} multiline />
            </>
            )}

            {tab === 'reservation' && (
            <>
                <View style={styles.row}>
                <TextInput
                    style={[styles.input, { flex: 1, backgroundColor: theme.card, color: theme.text }]} placeholder="Vyber dátum" placeholderTextColor={theme.placeholder} value={date ? date.toLocaleDateString() : ''} editable={false} />
                <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                    <Ionicons name="calendar" size={28 * fontScale} color={theme.text} style={{ marginLeft: 8, marginTop: 20 }} />
                </TouchableOpacity>
                </View>
                <View style={styles.row}>
                <TextInput
                    style={[styles.input, styles.halfInput, { backgroundColor: theme.card, color: theme.text }]} placeholder="od" placeholderTextColor={theme.placeholder} value={timeFrom ? timeFrom.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''} editable={false} />
                <TouchableOpacity onPress={() => setShowTimeFromPicker(true)}>
                    <Ionicons name="time" size={28 * fontScale} color={theme.text} style={{ marginTop: 20 }} />
                </TouchableOpacity>
                <TextInput
                    style={[styles.input, styles.halfInput, { backgroundColor: theme.card, color: theme.text }]} placeholder="do" placeholderTextColor={theme.placeholder} value={timeTo ? timeTo.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''} editable={false} />
                <TouchableOpacity onPress={() => setShowTimeToPicker(true)}>
                    <Ionicons name="time" size={28 * fontScale} color={theme.text} style={{ marginTop: 20 }} />
                </TouchableOpacity>
                </View>
                <View style={[styles.row, { alignItems: 'center', marginTop: 16 }]}>
                <Text style={{ color: theme.text }}>Počet hostí:</Text>
                <TouchableOpacity style={styles.option} onPress={decrementGuests}><Text>-</Text></TouchableOpacity>
                <Text style={{ color: theme.text }}>{guestCount}</Text>
                <TouchableOpacity style={styles.option} onPress={incrementGuests}><Text>+</Text></TouchableOpacity>
                </View>
                <TextInput
                style={[styles.commentInput, { backgroundColor: theme.card, color: theme.text }]} placeholder="komentár" placeholderTextColor={theme.placeholder} value={comment} onChangeText={setComment} multiline />
            </>
            )}

            {showDatePicker && (
            <DateTimePicker value={date || new Date()} mode="date" display="default" onChange={handleDateChange} />
            )}

            {showTimeFromPicker && (
            <DateTimePicker value={timeFrom || new Date()} mode="time" display="default" onChange={handleTimeFromChange} />
            )}

            {showTimeToPicker && (
            <DateTimePicker value={timeTo || new Date()} mode="time" display="default" onChange={handleTimeToChange} />
            )}

            <Pressable
            style={[styles.payBtn, { backgroundColor: theme.card }]}
            onPress={pay}
            >
            <Text style={{ color: theme.text }}>Zaplatiť</Text>
            </Pressable>

        </View>
        </KeyboardAvoidingView>
    );
}

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
        borderRightColor: '#f4e4d4',
    },
    title: {
        fontSize: 20,
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
        marginTop: 'auto',
        padding: 16,
        alignItems: 'center',
        borderRadius: 6,
        marginBottom: 16,
    },
});
