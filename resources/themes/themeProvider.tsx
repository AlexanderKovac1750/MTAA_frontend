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
  setInitialMode: (newMode: ThemeType) => void;
}>({
  theme: Colors.dark,
  mode: 'dark',
  toggleTheme: () => {},
  fontScale: 1.0,
  setFontScale: () => {},
  highContrastMode: false,
  toggleHighContrast: () => {},
  setInitialMode: () => {},
});

export const useThemeColors = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemColorScheme = Appearance.getColorScheme();
  const [mode, setMode] = useState<ThemeType>(systemColorScheme === 'dark' ? 'dark' : 'light');
  const [fontScale, setFontScale] = useState(1.0);
  const [highContrastMode, setHighContrastMode] = useState(false);

  const toggleTheme = () => setMode(prev => (prev === 'light' ? 'dark' : 'light'));
  const toggleHighContrast = () => setHighContrastMode(prev => !prev);
  const setInitialMode = (newMode: ThemeType) => setMode(newMode); // allows external override

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
        setInitialMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
