import { SafeAreaView, View, Text, TextInput, Image, FlatList, TouchableOpacity, ScrollView, 
  Dimensions, TouchableWithoutFeedback, StyleSheet,
  ActivityIndicator, Alert} from 'react-native';
import { useThemeColors } from '../resources/themes//themeProvider';
import { AntDesign, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { useNavigation, useRouter } from 'expo-router';
import { Food, pullFavs } from '../food';
import { checkFavePulled, getBaseUrl, getToken, getUserType, selectFood } from '../config';
import { getTotalCount } from '../cart';
import { useTranslation } from 'react-i18next';


const screenWidth = Dimensions.get('window').width;
const numColumns = 2;
const itemSize = screenWidth / numColumns;

export default function MainMenu() {
  const router = useRouter();
  const { t } = useTranslation();
  const { theme, fontScale } = useThemeColors();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [meals, setMeals] = useState<Food[]>([])
  const [fetchingFood, setFetchingFood] = useState(true);
  const [phrase, setPhrase] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [imageFetched, setImageFetched] = useState(false);
  const [searchNeeded, setSearchNeeded] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  // const [role, setRole] = useState(getUserType());
   const [role, setRole] = useState('registered');
  //const [role, setRole] = useState('admin');

  const getFilteredMeals= async () => {
    setFetchingFood(true);
    setMeals([]);
    
    try {
      const query = `?token=${getToken()}&phrase=${phrase}`;
      const cat_query = (category===null) ? ``: `&category=${category}`;
      const url = `http://${getBaseUrl()}/dish${query}${cat_query}`;
      const response = await fetch(url, {
        method: 'GET',
      });
        
      const responseText = await response.text(); 
      const data: any = JSON.parse(responseText);
        
      if (!response.ok) {
        console.log('❌ Error response:', data.message);
        Alert.alert('failed to load food: ', data.message);
        setMeals([]);
      }
      else{
        console.log('✅ dish load successful !!:', data.dishes);

        if (Array.isArray(data.dishes)) {
          setMeals(data.dishes as Food[]);
        } else {
          console.error('Invalid food data');
        }
      }
            
              
    } catch (error) {
      console.error('🚨 dish load error:', error.message);
      Alert.alert('dish load Error', error.message);
      setMeals([]);
    }

    setFetchingFood(false);
    setImageFetched(false);
  };

  const navigation = useNavigation();
    
    useEffect(() => {
      const unsubscribe = navigation.addListener('focus', () => {
        console.log('📌 item desc is focused');
        setCartCount(getTotalCount()); 
      });
      return unsubscribe;
  }, [navigation]);

  useEffect(()=> {
    setRole(getUserType());
    if(!checkFavePulled()){
      pullFavs();
    }
  })

  useEffect(() => {
    if(searchNeeded){
      getFilteredMeals();
      setSearchNeeded(false);
    }
  }, [searchNeeded]);

  useEffect(() => {
    if(meals.length>0 && !fetchingFood && !imageFetched){
      loadImages();
      setImageFetched(true);
    }
  },  [meals])

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
    try {
      // Create a copy of the photos array to update with image URIs
      const updatedMeals = [...meals];

      for (let i = 0; i < updatedMeals.length; i++) {
        try{
          const meal = updatedMeals[i];
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
          
          updatedMeals[i].image = imageURI;
        } catch (error) {
          console.error('Error loading 1 image:', error);
        }
      }

      // Update the state once all images are loaded
      setMeals(updatedMeals);
    } catch (error) {
      console.error('Error loading images:', error);
    }
  };
  
  const renderItem = ({item}) => {
    if(item==='__HEADER__'){
      return (
        <View style={{width:'100%'}}>
          {renderHeader()}
        </View>
      );
    }
    if(item==='__STICKY__HEADER__'){
      return (
        <View style={{width:'100%'}}>
          {renderStickyHeader()}
        </View>
      );
    }
    if(item==='__FILLER__'){
      return(
        <View style={{opacity: 0}}></View>
      );
    }
    
    const temp_item : Food = item;
    const imageURI = item.image;
    return (
      <TouchableOpacity
        onPress={() => { selectFood(item); if(role === 'admin') router.push('/screens/item_edit'); else router.push('/screens/item_desc'); }}
        style={{ backgroundColor: theme.surface, padding: 8, borderRadius: 8, width: '48%', alignItems: 'center' }}>
        {item.image ? (
              <Image
              source={{ uri: imageURI }}
              style={styles.image}
              resizeMode="contain"
              />      
            ) : (
              <Image
              source={require('../resources/images/beer.png')}
              style={styles.image}
              resizeMode="cover"
            />
            )}

        <Text
          numberOfLines={1}
          style={{ color: theme.text, marginTop: 4, fontSize: 14 * fontScale, textAlign: 'center' }}
        >
          {item.title}
        </Text>
      </TouchableOpacity>
    );
  }

  const toggleSidebar = () => setSidebarVisible((v) => !v);
  const closeSidebar = () => setSidebarVisible(false);

  const setCategoryFilter = (cat : string) => {
    setPhrase('');
    if(category===cat){
      setCategory(null);
    }
    else{
      setCategory(cat);
    }
    setSearchNeeded(true);
  }

  const Sidebar = () => (
    <TouchableWithoutFeedback onPress={closeSidebar}>
      <View style={styles.sidebarOverlay}>
        <TouchableWithoutFeedback>
          <View style={[styles.sidebarPanel, { backgroundColor: theme.primary }]}>
            <TouchableOpacity onPress={() => setCategoryFilter('polievka')}>
              <MaterialCommunityIcons name="noodles" size={32} color={category==='polievka'?theme.background:theme.text} style={styles.sidebarIcon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setCategoryFilter('hlavne')}>
              <MaterialCommunityIcons name="food-steak" size={32} color={category==='hlavne'?theme.background:theme.text} style={styles.sidebarIcon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setCategoryFilter('drink')}>
              <MaterialCommunityIcons name="beer" size={32} color={category==='drink'?theme.background:theme.text} style={styles.sidebarIcon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {if(role === 'registered') router.push('/screens/favourites')}}>
              <MaterialCommunityIcons name="silverware-fork-knife" size={32} color={theme.text} style={styles.sidebarIcon} />
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  );

  const renderHeader = () => (
    <>
      {/* Account icon top-left */}
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={{ position: 'absolute', top: 32, right: 1, zIndex: 10 }}>
          <TouchableOpacity onPress={() => {console.log('Account pressed'); router.push('/screens/account'); }}>
            <Ionicons name="person-circle" size={48} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Special dish section */}
      <View style={{ paddingTop: 0, paddingHorizontal: 16 }}>
        <Text style={{ color: theme.text, fontSize: 18 * fontScale, textAlign: 'center', paddingTop: 32 }}>dnesna specialita</Text>
        <TouchableOpacity onPress={() => { if(role === 'admin') router.push('/screens/item_edit'); else router.push('/screens/item_desc'); }}>
          <Image
            source={require('../resources/images/beer.png')}
            style={{ width: '100%', height: 140, borderRadius: 8, marginTop: 8 }}
            resizeMode="cover"
          />
        </TouchableOpacity>
       
      </View>
    </>
  );

  const renderStickyHeader = () => (
    <View style={{ backgroundColor: theme.background, paddingHorizontal: 16, paddingTop: 12 }}>
      {/* Menu row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingTop: 20 }}>
        <TouchableOpacity onPress={toggleSidebar}>
          <Ionicons name="menu" size={28} color={theme.text} />
        </TouchableOpacity> 

        <Text style={[{ fontSize: 18, color: theme.text }]}>menu</Text>

        <View style={{ position: 'relative' }}>
          <TouchableOpacity onPress={() => router.push('/screens/shopping_cart')}>
          <Ionicons name="cart" size={28} color={theme.accent} />
          </TouchableOpacity>
          
          {cartCount!=0 && <View>
            <Text style={{ color: theme.secondary, fontSize: 10, position: 'absolute', right: -6, top: -6,}}>
              {cartCount}
            </Text>
          </View>}
        </View>
      </View>

      {/* Search bar */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.surface,
          borderRadius: 8,
          paddingHorizontal: 8,
          marginBottom: 12,
        }}
      >
        <TextInput
          placeholder="Search"
          placeholderTextColor={theme.text}
          style={{ flex: 1, color: theme.text, height: 40}}
          value={phrase}
          onChangeText={setPhrase}
        />
        <TouchableOpacity onPress={getFilteredMeals}>
          <MaterialIcons name="search" size={24 * fontScale} color={theme.accent} />
        </TouchableOpacity>
      </View>
    </View>
  
  );

  const addItem = async () => {
    if (role === 'admin') router.push('/screens/item_add');
    else Alert.alert(t('unauthorized'), t('admin_only'));
    // router.push('/screens/item_add');   // For testing purposes, remove later
    };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        {sidebarVisible && <Sidebar />}
        <FlatList
          data={['__HEADER__', '__FILLER__', '__STICKY__HEADER__', '__FILLER__', ...meals]}
          keyExtractor={(item) => typeof item === 'string' ? item : item.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 12 }}
          contentContainerStyle={{ paddingBottom: 32, paddingHorizontal: 16 }}
          stickyHeaderIndices={[1]}

          renderItem={renderItem} 
          ListFooterComponent={
            fetchingFood ? (
              <View style={{ paddingVertical: 20 }}>
                <ActivityIndicator size="large" color={theme.accent}/>
              </View>
            ) : null
          }
          />

        {/* Floating Plus Button */}
        <TouchableOpacity
          onPress={addItem}
          style={[styles.floatingButton, { backgroundColor: theme.accent }]}
        >
          <AntDesign name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sidebarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: screenWidth,
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 100,
  },
  sidebarPanel: {
    width: 80,
    height: '100%',
    paddingVertical: 40,
    alignItems: 'center',
  },
  sidebarIcon: {
    marginVertical: 20,
  },
  image: {
    width: '100%', 
    height: 80, 
    borderRadius: 6 ,
  },
  container: {
    flex: 1,
    paddingTop: 60,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    // backgroundColor is dynamically set in the component
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5, // For Android
    shadowColor: '#000', // For iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});