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
import i18n from '../localisation/localisation';
import { useTranslation } from 'react-i18next';

const screenWidth = Dimensions.get('window').width;
const numColumns = 2;
const itemSize = screenWidth / numColumns;

export default function MainMenu() {
  const router = useRouter();
  const { t } = useTranslation();
  const { theme, fontScale } = useThemeColors();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [meals, setMeals] = useState<Food[]>([]);
  const [fetchingFood, setFetchingFood] = useState(true);
  const [phrase, setPhrase] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [imageFetched, setImageFetched] = useState(false);
  const [searchNeeded, setSearchNeeded] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [fetchingSpecial, setFetchingSpecial] = useState(false);
  const [currentSpecial, setCurrentSpecial] = useState<Food | null>(null);
  const [role, setRole] = useState('');

  const getFilteredMeals = async () => {
    setFetchingFood(true);
    setMeals([]);

    try {
      const query = `?token=${getToken()}&phrase=${phrase}`;
      const cat_query = category ? `&category=${category}` : '';
      const url = `http://${getBaseUrl()}/dish${query}${cat_query}`;
      const response = await fetch(url, { method: 'GET' });
      const responseText = await response.text();
      const data = JSON.parse(responseText);

      if (!response.ok) {
        console.log('❌ Error response:', data.message);
        Alert.alert('Failed to load food: ', data.message);
        setMeals([]);
      } else {
        console.log('✅ Dish load successful:', data.dishes);
        if (Array.isArray(data.dishes)) {
          setMeals(data.dishes as Food[]);
        } else {
          console.error('Invalid food data');
        }
      }
    } catch (error) {
      console.error('🚨 Dish load error:', error.message);
      Alert.alert('Dish load Error', error.message);
      setMeals([]);
    }
    setFetchingFood(false);
    setImageFetched(false);
  };

  const fetchCurrentSpecial = async () => {
    try {
      setFetchingSpecial(true);
      const token = getToken();
      const response = await fetch(`http://${getBaseUrl()}/todays_special?token=${token}`);
      
      if (!response.ok) {
        setCurrentSpecial(null);
        return;
      }

      const data = await response.json();
      if (!data.dish_id) {
        setCurrentSpecial(null);
        return;
      }

      const specialResponse = await fetch(
        `http://${getBaseUrl()}/dish_full_info?token=${token}&dish_id=${data.dish_id}`
      );
      
      if (specialResponse.ok) {
        const specialData = await specialResponse.json();
        const specialDish = {
          ...specialData,
          image: specialData.pic ? `data:image/jpeg;base64,${specialData.pic}` : null
        };
        setCurrentSpecial(specialDish);
      }
    } catch (error) {
      console.error('Error fetching special:', error);
      setCurrentSpecial(null);
    } finally {
      setFetchingSpecial(false);
    }
  };

  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setCartCount(getTotalCount());
      fetchCurrentSpecial();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    fetchCurrentSpecial();
  }, []);

  useEffect(() => {
    setRole(getUserType());
    if (!checkFavePulled()) {
      pullFavs();
    }
  }, []);

  useEffect(() => {
    if (searchNeeded) {
      getFilteredMeals();
      setSearchNeeded(false);
    }
  }, [searchNeeded]);

  useEffect(() => {
    if (meals.length > 0 && !fetchingFood && !imageFetched) {
      loadImages();
      setImageFetched(true);
    }
  }, [meals]);

  const fetchWithTimeout = (url: string, timeout = 5000): Promise<Response> => {
    return Promise.race([
      fetch(url),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out')), timeout)
      )
    ]);
  };

  const convertToBase64 = (binaryData: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject('Error converting binary to base64');
      reader.readAsDataURL(binaryData);
    });
  };

  const loadImages = async () => {
    try {
      const updatedMeals = [...meals];
      for (let i = 0; i < updatedMeals.length; i++) {
        try {
          const meal = updatedMeals[i];
          const query = `/picture?dish=${meal.title}`;
          const url = `http://${getBaseUrl()}/dish${query}`;
          const response = await fetchWithTimeout(url, 1000);

          if (!response.ok) throw new Error(`Failed to fetch image for ${meal.title}`);
          
          const binaryData = await response.blob();
          const imageURI = await convertToBase64(binaryData);
          updatedMeals[i].image = imageURI;
        } catch (error) {
          console.error('Error loading image:', error);
        }
      }
      setMeals(updatedMeals);
    } catch (error) {
      console.error('Error loading images:', error);
    }
  };

  const renderItem = ({ item }) => {
    if (item === '**HEADER**') {
      return (
        <View style={{ width: '100%' }}>
          {renderHeader()}
        </View>
      );
    }
    if (item === '**STICKY_HEADER**') {
      return (
        <View style={{ width: '100%' }}>
          {renderStickyHeader()}
        </View>
      );
    }
    if (item === '**FILLER**') {
      return <View style={{ opacity: 0 }}></View>;
    }

    return (
      <TouchableOpacity
        onPress={() => {
          selectFood(item);
          router.push(role === 'admin' ? '/screens/item_edit' : '/screens/item_desc');
        }}
        style={{ backgroundColor: theme.surface, padding: 8, borderRadius: 8, width: '48%', alignItems: 'center' }}
      >
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.image} resizeMode="contain" />
        ) : (
          <Image source={require('../resources/images/beer.png')} style={styles.image} resizeMode="cover" />
        )}
        <Text
          numberOfLines={1}
          style={{ color: theme.text, marginTop: 4, fontSize: 14 * fontScale, textAlign: 'center' }}
        >
          {item.title}
        </Text>
      </TouchableOpacity>
    );
  };

  const toggleSidebar = () => setSidebarVisible((v) => !v);
  const closeSidebar = () => setSidebarVisible(false);

  const setCategoryFilter = (cat: string) => {
    setPhrase('');
    setCategory(current => current === cat ? null : cat);
    setSearchNeeded(true);
  };

  const Sidebar = () => (
    <TouchableWithoutFeedback onPress={closeSidebar}>
      <View style={styles.sidebarOverlay}>
        <TouchableWithoutFeedback>
          <View style={[styles.sidebarPanel, { 
            backgroundColor: `${theme.primary}CC`,
            borderRightWidth: 2,
            borderRightColor: theme.primary
          }]}>
            <View style={styles.section}>
              <Text style={[styles.sectionHeader, { color: theme.text }]}>{t('categories')}</Text>
              <TouchableOpacity onPress={() => setCategoryFilter('polievka')}>
                <MaterialCommunityIcons 
                  name="noodles" 
                  size={32} 
                  color={category === 'polievka' ? theme.background : theme.text} 
                  style={styles.sidebarIcon} 
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setCategoryFilter('hlavne')}>
                <MaterialCommunityIcons 
                  name="food-steak" 
                  size={32} 
                  color={category === 'hlavne' ? theme.background : theme.text} 
                  style={styles.sidebarIcon} 
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setCategoryFilter('drink')}>
                <MaterialCommunityIcons 
                  name="beer" 
                  size={32} 
                  color={category === 'drink' ? theme.background : theme.text} 
                  style={styles.sidebarIcon} 
                />
              </TouchableOpacity>
            </View>
            {(role === 'registered' || role === 'admin') && (
              <View style={styles.section}>
                <Text style={[styles.sectionHeader, { color: theme.text }]}>{t('your_space')}</Text>
                {role === 'registered' && (
                  <TouchableOpacity onPress={() => router.push('/screens/favourites')}>
                    <MaterialCommunityIcons 
                      name="silverware-fork-knife" 
                      size={32} 
                      color={theme.text} 
                      style={styles.sidebarIcon} 
                    />
                  </TouchableOpacity>
                )}
                {role === 'admin' && (
                  <TouchableOpacity onPress={() => router.push('screens/order_overview')}>
                    <MaterialIcons 
                      name="list-alt" 
                      size={32} 
                      color={theme.text} 
                      style={styles.sidebarIcon} 
                    />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  );

  const renderHeader = () => (
    <>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={{ position: 'absolute', top: 32, right: 1, zIndex: 10 }}>
          <TouchableOpacity onPress={() => router.push('/screens/account')}>
            <Ionicons name="person-circle" size={48} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ paddingTop: 0, paddingHorizontal: 16 }}>
        <Text style={{ color: theme.text, fontSize: 18 * fontScale, textAlign: 'center', paddingTop: 32 }}>
          {currentSpecial ? currentSpecial.title : t('today_special')}
        </Text>
        <TouchableOpacity 
          onPress={() => { 
            if (currentSpecial) {
              selectFood(currentSpecial);
              router.push({
                pathname: role === 'admin' ? '/screens/item_edit' : '/screens/item_desc',
                params: { dishId: currentSpecial.id }
              });
            }
          }}
          style={specialImageStyles.container}
        >
          {fetchingSpecial ? (
            <ActivityIndicator size="large" color={theme.accent} />
          ) : (
            <Image
              source={currentSpecial?.image ? 
                { uri: currentSpecial.image } : 
                require('../resources/images/beer.png')}
              style={specialImageStyles.image}
            />
          )}
        </TouchableOpacity>
      </View>
    </>
  );

  const renderStickyHeader = () => (
    <View style={{ backgroundColor: theme.background, paddingHorizontal: 16, paddingTop: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingTop: 20 }}>
        <TouchableOpacity onPress={toggleSidebar}>
          <Ionicons name="menu" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={[{ fontSize: 18 * fontScale, color: theme.text }]}>{t('menu')}</Text>
        <View style={{ position: 'relative' }}>
          <TouchableOpacity onPress={() => router.push('/screens/shopping_cart')}>
            <Ionicons name="cart" size={28} color={theme.accent} />
          </TouchableOpacity>
          {cartCount !== 0 && (
            <Text style={{ color: theme.secondary, fontSize: 10 * fontScale, position: 'absolute', right: -6, top: -6 }}>
              {cartCount}
            </Text>
          )}
        </View>
      </View>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.surface,
        borderRadius: 8,
        paddingHorizontal: 8,
        marginBottom: 12,
      }}>
        <TextInput
          placeholder={t('search')}
          placeholderTextColor={theme.text}
          style={{ flex: 1, color: theme.text, height: 40 }}
          value={phrase}
          onChangeText={setPhrase}
        />
        <TouchableOpacity onPress={getFilteredMeals}>
          <MaterialIcons name="search" size={24 /* fontScale*/} color={theme.accent} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const addItem = async () => {
    if (role === 'admin') router.push('/screens/item_add');
    else Alert.alert(t('unauthorized'), t('admin_only'));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {sidebarVisible && <Sidebar />}
      <FlatList
        data={['**HEADER**', '**FILLER**', '**STICKY_HEADER**', '**FILLER**', ...meals]}
        keyExtractor={(item) => typeof item === 'string' ? item : item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 12 }}
        contentContainerStyle={{ paddingBottom: 32, paddingHorizontal: 16 }}
        stickyHeaderIndices={[1]}
        renderItem={renderItem}
        ListFooterComponent={
          fetchingFood ? (
            <View style={{ paddingVertical: 20 }}>
              <ActivityIndicator size="large" color={theme.accent} />
            </View>
          ) : null
        }
      />
      {role === 'admin' && (
        <TouchableOpacity
          onPress={addItem}
          style={[styles.floatingButton, { backgroundColor: theme.accent }]}
        >
          <AntDesign name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const specialImageStyles = StyleSheet.create({
  container: {
    width: '100%',
    height: 200, // Fixed height!
    justifyContent: 'center',
    marginVertical: 8,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    resizeMode: 'contain',
  }
});

const styles = StyleSheet.create({
  sidebarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 100,
  },
  sidebarPanel: {
    width: 100,
    height: '100%',
    paddingVertical: 30,
    paddingHorizontal: 10,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 15,
    marginLeft: 5,
    color: '#fff',
  },
  section: {
    marginBottom: 30,
    alignItems: 'center',
  },
  sidebarIcon: {
    marginVertical: 15,
    alignSelf: 'center',
  },
  image: {
    width: '100%',
    height: 80,
    borderRadius: 6,
  },
  container: {
    flex: 1,
    paddingTop: 60,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});