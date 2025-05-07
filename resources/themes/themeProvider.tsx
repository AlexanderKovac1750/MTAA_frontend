import React, { createContext, useContext, useState } from 'react';
import { Appearance } from 'react-native';
import Colors from './theme';

type ThemeType = 'light' | 'dark';

const ThemeContext = createContext<{
  theme: typeof Colors.light;
  mode: ThemeType;
  toggleTheme: () => void;
  fontScale: number;
  setFontScale: (scale: number) => void;
  highContrastMode: boolean;
  toggleHighContrast: () => void;
}>({
  theme: Colors.dark,
  mode: 'dark',
  toggleTheme: () => {},
  fontScale: 1.0,
  setFontScale: () => {},
  highContrastMode: false,
  toggleHighContrast: () => {},
});

export const useThemeColors = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemColorScheme = Appearance.getColorScheme();
  const initialMode: ThemeType = systemColorScheme === 'dark' ? 'dark' : 'dark'; // fallback to dark
  const [mode, setMode] = useState<ThemeType>(initialMode);
  const [fontScale, setFontScale] = useState(1.0);
  const [highContrastMode, setHighContrastMode] = useState(false);

  const toggleTheme = () => setMode(prev => (prev === 'light' ? 'dark' : 'light'));
  const toggleHighContrast = () => setHighContrastMode(prev => !prev);

  const theme = highContrastMode ? Colors.highContrast : mode === 'dark' ? Colors.dark : Colors.light;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        mode,
        toggleTheme,
        fontScale,
        setFontScale,
        highContrastMode,
        toggleHighContrast,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
