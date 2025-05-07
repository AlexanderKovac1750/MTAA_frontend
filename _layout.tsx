import { Stack } from "expo-router";
import { useEffect } from "react";
import { Platform, StatusBar } from "react-native";
import { ThemeProvider } from "./resources/themes/themeProvider";


import React from "react";

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === "android") {
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor("transparent");
    }
  }, []);

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
