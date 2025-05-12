import { useEffect, useState } from "react";
import { View, Text, FlatList, useWindowDimensions, StyleSheet } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { io, Socket } from "socket.io-client";
import { getBaseUrl } from "../config";
import { Reservation } from "../reservation";
import { useThemeColors } from "../resources/themes/themeProvider";

import i18n from '../localisation/localisation';
import { useTranslation } from 'react-i18next';

export default function ReservationsScreen() {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  useEffect(() => {
    console.log("is tablet: ",isTablet);
    console.log("trying to connect socket");
    const socket: Socket = io(`ws://${getBaseUrl()}`);

    socket.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    socket.on("reservation_update", (data: Reservation) => {
      console.log("Received reservation:", data);
      setReservations((prev) => [...prev, data]);
    });

    return () => {
      socket.disconnect();
      console.log("Socket disconnected");
    };
  }, []); // 👈 empty dependency array ensures this runs only once

  const { theme } = useThemeColors(); // Use theme from context

  const renderItem = ({ item }: { item: Reservation }) => (
    <View
      style={{
        backgroundColor: theme.background,
        padding: 12,
        marginVertical: 6,
        marginHorizontal: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.border,
        flex: 1,
      }}
    >
      <Text style={{ fontSize: 20, color: theme.text }}>
        Id: {item.id}
      </Text>
      <Text style={{ fontSize: 16, color: theme.text }}>
        date: {item.date}
      </Text>
      <Text style={{ fontSize: 16, color: theme.text, marginBottom: 4 }}>
        from: {item.from}
      </Text>
      <Text style={{ fontSize: 16, color: theme.text }}>
        to: {item.until}
      </Text>
      <Text style={{ fontSize: 16, color: theme.text }}>
        people: {item.people}
      </Text>
      <Text style={{ fontSize: 16, color: theme.text }}>
        table: {item.table}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Reservations</Text>
      <FlatList
        key={isTablet ? 'tablet' : 'mobile'}
        data={reservations}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        numColumns={isTablet ? 3 : 2}
        columnWrapperStyle={isTablet ? styles.row : undefined}
        contentContainerStyle={{
          gap: 12,
          paddingHorizontal: 12,
          paddingVertical: isTablet ? 16 : 12,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Full screen usage
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center", // Center the title
  },
  card: {
    flex: 1,
    padding: 16,
    margin: 6,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    elevation: 2,
    // Ensure the card takes up all available space horizontally
    minHeight: 120, // Ensure cards have a height, especially on mobile
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
  },
  row: {
    justifyContent: "space-between", // Ensure proper horizontal alignment for tablet
  },
});