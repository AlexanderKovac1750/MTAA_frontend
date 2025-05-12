import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Dimensions, Alert } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { useThemeColors } from '../resources/themes/themeProvider';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { Food, removeFavourite, setFavs } from '../food';
import { getBaseUrl, getOfflineMode, getToken, selectFood } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

import i18n from '../localisation/localisation';
import { useTranslation } from 'react-i18next';

const dummyFavourites = [
    {
        id: 1,
        name: 'Zemiaky na smotane',
        image: require('../resources/images/sample-dish.png'),
        discount: '-20%',
    },
    {
        id: 2,
        name: 'Bryndzové halušky',
        image: require('../resources/images/sample-dish.png'),
        discount: '-10%',
    },
    {
        id: 3,
        name: 'Vyprážaný syr',
        image: require('../resources/images/sample-dish.png'),
        discount: '-15%',
    },
];



export default function FavouriteMealsScreen() {
    const { theme, fontScale } = useThemeColors();
    const router = useRouter();
    const [favourites, setFavourites] = useState<Food[]>([]);
    const [fetchingFood, setFetchingFood] = useState(true);
    const [imageFetched, setImageFetched] = useState(false);
    const [isOffline, setIsOfline] = useState(false);

    const navigation = useNavigation();

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            getFavourites()
            console.log('📌 Screen is focused');
        });

        return unsubscribe;
    }, [navigation]);

    const getFavourites = async () => {
        setFetchingFood(true);
        setFavourites([]);
        
        if(getOfflineMode()){
            console.log('reading favourites from local storage');
            try{
                const storedFAVS = await AsyncStorage.getItem('FAVS');
                if(storedFAVS){
                    const fav2 = JSON.parse(storedFAVS) as Food[];
                    setFavourites(fav2);
                    console.log("success in loading favourites");
                }
                
            }
            catch{
                console.warn("failed to load favourites");
            }
            setFetchingFood(false);
            return;
        }
        
        try {
            const query = `?token=${getToken()}`;
            const url = `http://${getBaseUrl()}/favourite${query}`;
            const response = await fetch(url, {
                method: 'GET',
            });
                
            const responseText = await response.text(); 
            const data: any = JSON.parse(responseText);
            
            if (!response.ok) {
                console.log('❌ Error response:', data.message);
                Alert.alert('failed to load favourites: ', data.message);
                setFavourites([]);
            }
            else{
                console.log('✅ favourites load successful !!:', data.dishes);
        
                if (Array.isArray(data.dishes)) {
                    setFavourites(data.dishes as Food[]);
                    setFavs(data.dishes as Food[]);
                    
                } else {
                console.error('Invalid food data');
                }
            }
                
                  
        } catch (error) {
            console.error('🚨 favourites load error:', error.message);
            Alert.alert('favourites load Error', error.message);
            setFavourites([]);
        }
    
        setImageFetched(false);
        setFetchingFood(false);
    };

    useEffect(() => {
        //getFavourites();
        setIsOfline(getOfflineMode());
      }, []);

    useEffect(() => {
        if(favourites.length>0 && !fetchingFood && !imageFetched){
            loadImages();
            setImageFetched(true);
        }
        else{
            console.log('dsda',favourites.length);
        }
      },  [favourites])

    useEffect(()=>{
        console.log("FAVS");
        if(!fetchingFood && imageFetched){
            //is done fetching, save
            saveFAVS();
        }
    }, [imageFetched])

    const saveFAVS = async() =>{
        if(getOfflineMode()){
            return;
        }
        try{
            const copy = JSON.stringify(favourites);
            await AsyncStorage.setItem('FAVS', copy);
            console.log("success in storing favourites");
        }
        catch{
            console.warn("failed to save favourites");
        }
    };

    const removeFromFavourites = (favourite_meal : Food) => {
        setFavourites(prev => prev.filter(item => item.id !== favourite_meal.id));
        removeFavourite(favourite_meal);
    };

    const fetchWithTimeout = (url: string, timeout = 5000): Promise<Response> => {
        return Promise.race([
          fetch(url),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Request timed out')), timeout)
          )
        ]);
      };
    
      // Convert binary data to base64
      const convertToBase64 = (binaryData: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string); // The result is the base64 string
          };
          reader.onerror = () => {
            reject('Error converting binary to base64');
          };
          reader.readAsDataURL(binaryData); // Convert the binary Blob to base64
        });
      };
    
      // Load image URIs for the fetched photo names
      const loadImages = async () => {
        if(getOfflineMode()){
            console.log('favlen',favourites.length);
            setFavourites(favourites)
            return;
        }


        try {
          // Create a copy of the photos array to update with image URIs
          const updatedFavourites = [...favourites];
    
          for (let i = 0; i < updatedFavourites.length; i++) {
            try{
              const meal = updatedFavourites[i];
              const query = `/picture?dish=${meal.title}`;
              const url = `http://${getBaseUrl()}/dish${query}`;
              const response = await fetchWithTimeout(url,1000);
    
              if (!response.ok) {
                throw new Error(`Failed to fetch image for ${meal.title}`);
              }
    
              // The response should return binary data (e.g., a Blob)
              const binaryData = await response.blob();
    
              // Convert binary data to base64
              const imageURI = await convertToBase64(binaryData);
    
              // Update the imageURI of the corresponding photo
              
              updatedFavourites[i].image = imageURI;
            } catch (error) {
              console.error('Error loading 1 image:', error);
            }
          }
    
          // Update the state once all images are loaded
          setFavourites(updatedFavourites);
        } catch (error) {
          console.error('Error loading images:', error);
        }
      };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Back triangle top-left */}
        <View style={styles.topBar}>
            <TouchableOpacity style={styles.backTriangle} onPress={() => router.back()} />
        </View>

        {/* Account icon top-right */}
        <View style={{ position: 'absolute', top: 32, right: 16, zIndex: 10 }}>
            <TouchableOpacity
            onPress={() => {
                console.log('Account pressed');
                router.push('/screens/account');
            }}
            >
            <Ionicons name="person-circle" size={48} color={theme.text} />
            </TouchableOpacity>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: theme.text, fontSize: 20 * fontScale }]}>
            Obľúbené jedlá ({favourites.length})
        </Text>

        {/* Scrollable favourites list */}
        <ScrollView contentContainerStyle={styles.scrollArea}>
            {favourites.map(item => (
            <View key={item.id} style={[styles.card, { backgroundColor: theme.card }]}>
                <View style={styles.imageWrapper}>
                    <TouchableOpacity onPress={() =>{selectFood(item); router.push('/screens/item_desc');}}>                 
                
                <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
                </TouchableOpacity>
                {/* Discount tag */}
                <View style={styles.discountTag}>
                    <Text style={styles.discountText}>{item.discount_base}</Text>
                </View>

                {/* Remove from favourites icon */}
                <TouchableOpacity
                    onPress={() => removeFromFavourites(item)}
                    style={styles.starIcon}
                >
                    <FontAwesome name="star" size={28 * fontScale} color="#FFD700" />
                </TouchableOpacity>
                </View>

                <Text style={[styles.dishName, { color: theme.text }]}>{item.title}</Text>
            </View>
            ))}
        </ScrollView>

        {/* Add More Button */}
        {!isOffline && <TouchableOpacity
            onPress={() => router.push('/screens/main_menu')}
            style={[styles.addMoreBtn, { backgroundColor: theme.surface }]}
        >
            <Image
            source={require('../resources/images/favourites.png')}
            style={{ width: 30, height: 30, opacity: 0.8 }}
            />
        </TouchableOpacity>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
    },
    topBar: {
        position: 'absolute',
        top: 36,
        left: 16,
        zIndex: 10,
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
