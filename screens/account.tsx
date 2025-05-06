// app/screens/account.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '../resources/themes/themeProvider';
import { MaterialIcons, Feather } from '@expo/vector-icons';

export default function AccountScreen() {
  const router = useRouter();
  const { theme, toggleTheme, mode } = useThemeColors();
  const [accessExpanded, setAccessExpanded] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Row */}
      <View style={styles.topRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <MaterialIcons name="arrow-back-ios" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.nameText, { color: theme.text }]}>Peter Jamek</Text>
        <Feather name="user" size={30} color={theme.text} />
      </View>

      {/* Discount */}
      <View style={styles.discountSection}>
        <Text style={[styles.discountText, { color: theme.text }]}>zľava</Text>
        <Image
          source={require('../resources/images/beer.png')}
          style={styles.beerImage}
          resizeMode="contain"
        />
        <View>
          <Text style={[styles.discountStep, { color: theme.text }]}>20%</Text>
          <Text style={[styles.discountStep, { color: theme.text }]}>10%</Text>
          <Text style={[styles.discountStep, { color: theme.text }]}>5%</Text>
        </View>
      </View>

      {/* Sections */}
      <TouchableOpacity style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionText, { color: theme.text }]}>moje rezervácie</Text>
      </TouchableOpacity>

      {/* Dark Mode Toggle */}
      <View style={[styles.sectionRow, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionText, { color: theme.text }]}>temný mód</Text>
        <TouchableOpacity onPress={toggleTheme} style={styles.modeButton}>
          {mode === 'dark' ? (
            <Feather name="sun" size={24} color={theme.accent} />
          ) : (
            <Feather name="moon" size={24} color={theme.accent} />
          )}
        </TouchableOpacity>
      </View>

      {/* Language */}
      <View style={[styles.sectionRow, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionText, { color: theme.text }]}>jazyk</Text>
        <Text style={[styles.sectionText, { color: theme.accent }]}>slovenčina ▼</Text>
      </View>

      {/* Accessibility */}
      <TouchableOpacity
        style={[styles.sectionRow, { backgroundColor: theme.surface }]}
        onPress={() => setAccessExpanded(!accessExpanded)}
      >
        <Text style={[styles.sectionText, { color: theme.text }]}>prístupnosť</Text>
        <Text style={[styles.sectionText, { color: theme.accent }]}>
          {accessExpanded ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>

      {accessExpanded && (
        <>
          <View style={[styles.switchRow, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sectionText, { color: theme.text }]}>nastavenie 1</Text>
            <Switch value={true} />
          </View>
          <View style={[styles.switchRow, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sectionText, { color: theme.text }]}>nastavenie 2</Text>
            <Switch value={false} />
          </View>
          <View style={[styles.switchRow, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sectionText, { color: theme.text }]}>nastavenie 3</Text>
            <Switch value={true} />
          </View>
        </>
      )}

      {/* Password & Logout */}
      <TouchableOpacity style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionText, { color: theme.text }]}>zmena hesla</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton}>
        <Feather name="log-out" size={20} color="white" />
        <Text style={styles.logoutText}>odhlás sa</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    alignItems: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  iconButton: {
    padding: 5,
  },
  nameText: {
    fontSize: 20,
    fontWeight: '600',
  },
  discountSection: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    marginBottom: 30,
    justifyContent: 'space-between',
  },
  discountText: {
    fontSize: 18,
  },
  beerImage: {
    width: 60,
    height: 60,
  },
  discountStep: {
    fontSize: 16,
    marginVertical: 2,
  },
  section: {
    width: '90%',
    padding: 15,
    borderRadius: 10,
    marginVertical: 6,
  },
  sectionText: {
    fontSize: 16,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    padding: 15,
    borderRadius: 10,
    marginVertical: 6,
    alignItems: 'center',
  },
  modeButton: {
    padding: 5,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    padding: 15,
    borderRadius: 10,
    marginVertical: 4,
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#a33',
    marginTop: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    marginLeft: 10,
    fontSize: 16,
  },
});
