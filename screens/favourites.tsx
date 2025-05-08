import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '../resources/themes/themeProvider';
import { Feather, Ionicons, FontAwesome } from '@expo/vector-icons';

const windowWidth = Dimensions.get('window').width;

const dummyFavourites = [
    {
        id: 1,
        name: 'Zemiaky na smotane',
        image: require('../resources/images/sample-dish.jpg'),
        discount: '-20%',
    },
    {
        id: 2,
        name: 'Bryndzové halušky',
        image: require('../resources/images/sample-dish.jpg'),
        discount: '-10%',
    },
    {
        id: 3,
        name: 'Vyprážaný syr',
        image: require('../resources/images/sample-dish.jpg'),
        discount: '-15%',
    },
];

export default function FavouriteMealsScreen() {
    const { theme, fontScale } = useThemeColors();
    const router = useRouter();

    const [favourites, setFavourites] = useState(dummyFavourites);

    const removeFromFavourites = (id: number) => {
        setFavourites(prev => prev.filter(item => item.id !== id));
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background, paddingTop: 50 }]}>
        
        {/* Triangle Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={{ fontSize: 36 * fontScale, color: theme.text }}>◀</Text>
        </TouchableOpacity>

        {/* Profile Icon */}
        <TouchableOpacity style={styles.profileIcon} onPress={() => router.push('./screens/account')}>
            <Feather name="user" size={28 * fontScale} color={theme.text} />
        </TouchableOpacity>

        {/* Title */}
        <Text style={[styles.title, { color: theme.text, fontSize: 20 * fontScale }]}>
            Obľúbené jedlá ({favourites.length})
        </Text>

        {/* Scrollable Favourites */}
        <ScrollView contentContainerStyle={styles.scrollArea}>
            {favourites.map(item => (
            <View key={item.id} style={[styles.card, { backgroundColor: theme.card }]}>
                <View style={styles.imageWrapper}>
                <Image source={item.image} style={styles.image} resizeMode="cover" />
                
                {/* Discount Overlay */}
                <View style={styles.discountTag}>
                    <Text style={styles.discountText}>{item.discount}</Text>
                </View>

                {/* Star Icon (Remove) */}
                <TouchableOpacity onPress={() => removeFromFavourites(item.id)} style={styles.starIcon}>
                    <FontAwesome name="star" size={28 * fontScale} color="#FFD700" />
                </TouchableOpacity>
                </View>

                <Text style={[styles.dishName, { color: theme.text }]}>{item.name}</Text>
            </View>
            ))}
        </ScrollView>

        {/* Add More Favourites Button */}
        <TouchableOpacity
            onPress={() => router.push('/screens/main_menu')}
            style={[styles.addMoreBtn, { backgroundColor: theme.surface }]}
        >
            <Image
            source={require('../resources/images/favourites.png')}
            style={{ width: 30, height: 30, opacity: 0.8 }}
            />
        </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 2,
    },
    profileIcon: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 2,
    },
    title: {
        textAlign: 'center',
        marginTop: 20,
        fontWeight: 'bold',
    },
    scrollArea: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 100,
    },
    card: {
        marginBottom: 30,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2,
    },
    imageWrapper: {
        width: '100%',
        height: 200,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    discountTag: {
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: '#ffcc00',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    discountText: {
        fontWeight: 'bold',
        color: '#3e2b1f',
    },
    starIcon: {
        position: 'absolute',
        bottom: 10,
        right: 10,
    },
    dishName: {
        padding: 12,
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
    },
    addMoreBtn: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 60,
        height: 60,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
    },
});
