
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import first_screen from './screens/first_screen';
import login from './screens/login';
import register from './screens/register';
import main_menu from './screens/main_menu';
import account from './screens/account';

const Stack = createNativeStackNavigator();


export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="index" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="first_screen" component={first_screen} />
        <Stack.Screen name="Login" component={login} />
        <Stack.Screen name="Register" component={register} />
        <Stack.Screen name="Main_menu" component={main_menu} />
        <Stack.Screen name="Account" component={account} />
      </Stack.Navigator>
    </NavigationContainer>
  );

}
