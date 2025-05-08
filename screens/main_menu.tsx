import { SafeAreaView, View, Text, TextInput, Image, FlatList, TouchableOpacity, ScrollView, 
  Dimensions, TouchableWithoutFeedback, StyleSheet} from 'react-native';
import { useThemeColors } from '../resources/themes//themeProvider';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';


const SCREEN_WIDTH = Dimensions.get('window').width;

export default function MainMenu() {

  const { theme } = useThemeColors();
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const dishes = [
    { id: '1', title: 'borsc po slovensky', image: require('../resources/images/beer.png') },
    { id: '2', title: 'Domáce bryndzov...', image: require('../resources/images/beer.png') },
    { id: '3', title: 'grilovane krídelká', image: require('../resources/images/beer.png') },
    { id: '4', title: 'bravčový steak', image: require('../resources/images/beer.png') },
    { id: '5', title: 'halušky s kapustou', image: require('../resources/images/beer.png') },
    { id: '6', title: 'zemiakové placky', image: require('../resources/images/beer.png') },
    { id: '7', title: 'pečené koleno', image: require('../resources/images/beer.png') },
    { id: '8', title: 'zemiakové placky', image: require('../resources/images/beer.png') },
    { id: '9', title: 'pečené koleno', image: require('../resources/images/beer.png') },
    { id: '10', title: 'zemiakové placky', image: require('../resources/images/beer.png') },
    { id: '11', title: 'pečené koleno', image: require('../resources/images/beer.png') },
  ];

  const toggleSidebar = () => setSidebarVisible((v) => !v);
  const closeSidebar = () => setSidebarVisible(false);

  const Sidebar = () => (
    <TouchableWithoutFeedback onPress={closeSidebar}>
      <View style={styles.sidebarOverlay}>
        <TouchableWithoutFeedback>
          <View style={[styles.sidebarPanel, { backgroundColor: theme.primary }]}>
            <MaterialCommunityIcons name="noodles" size={32} color={theme.text} style={styles.sidebarIcon} />
            <MaterialCommunityIcons name="food-steak" size={32} color={theme.text} style={styles.sidebarIcon} />
            <MaterialCommunityIcons name="beer" size={32} color={theme.text} style={styles.sidebarIcon} />
            <MaterialCommunityIcons name="silverware-fork-knife" size={32} color={theme.text} style={styles.sidebarIcon} />
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  );

  const renderHeader = () => (
    <>
      {/* Account icon top-left */}
      <View style={{ position: 'absolute', top: 32, right: 16, zIndex: 10 }}>
        <TouchableOpacity onPress={() => console.log('Account pressed')}>
          <Ionicons name="person-circle" size={48} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Special dish section */}
      <View style={{ paddingTop: 48, paddingHorizontal: 16 }}>
        <Text style={{ color: theme.text, fontSize: 18, textAlign: 'center', paddingTop: 32 }}>dnesna specialita</Text>
        <Image
          source={require('../resources/images/beer.png')}
          style={{ width: '100%', height: 140, borderRadius: 8, marginTop: 8 }}
          resizeMode="cover"
        />
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
          <Ionicons name="cart" size={28} color={theme.accent} />
          <View>
            <Text style={{ color: theme.surface, fontSize: 10, position: 'absolute', right: -6, top: -6,}}>1</Text>
          </View>
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
          style={{ flex: 1, color: theme.text, height: 40 }}
        />
        <TouchableOpacity>
          <MaterialIcons name="search" size={24} color={theme.accent} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {sidebarVisible && <Sidebar />}
      <ScrollView stickyHeaderIndices={[1]}>
        <View>
          {renderHeader()}
        </View>
        <View>
          {renderStickyHeader()}
        </View>
        <FlatList
        data={dishes}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 12 }}
        contentContainerStyle={{ paddingBottom: 32, paddingHorizontal: 16 }}

        //stickyHeaderIndices={[0]} // index within ListHeaderComponent (renderStickyHeader)
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              backgroundColor: theme.surface,
              padding: 8,
              borderRadius: 8,
              width: '48%',
              alignItems: 'center',
            }}
          >
            <Image
              source={item.image}
              style={{ width: '100%', height: 80, borderRadius: 6 }}
              resizeMode="cover"
            />
            <Text
              numberOfLines={1}
              style={{ color: theme.text, marginTop: 4, fontSize: 14, textAlign: 'center' }}
            >
              {item.title}
            </Text>
          </TouchableOpacity>
        )}
      />
      </ScrollView>
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sidebarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
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
});