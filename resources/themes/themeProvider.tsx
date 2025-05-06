import React, { createContext, useContext, useState } from 'react';
import { Appearance } from 'react-native';
import Colors from './theme';

type ThemeType = 'light' | 'dark';

const ThemeContext = createContext<{
  theme: typeof Colors.light;
  mode: ThemeType;
  toggleTheme: () => void;
}>({
  theme: Colors.dark,
  mode: 'dark',
  toggleTheme: () => {},
});

export const useThemeColors = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Force fallback to 'dark' if system mode is null/undefined
  const systemColorScheme = Appearance.getColorScheme();
  const initialMode: ThemeType = systemColorScheme === 'dark' ? 'dark' : 'dark'; // <== always dark fallback
  const [mode, setMode] = useState<ThemeType>(initialMode);

  const toggleTheme = () => setMode(prev => (prev === 'light' ? 'dark' : 'light'));
  const theme = mode === 'dark' ? Colors.dark : Colors.light;

  return (
    <ThemeContext.Provider value={{ theme, mode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
