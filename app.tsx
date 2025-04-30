
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import index from '.';
import login from './login';
import register from './register';
import main_menu from './main_menu';
import account from './account';

const Stack = createNativeStackNavigator();


export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="index" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" component={index} />
        <Stack.Screen name="Login" component={login} />
        <Stack.Screen name="Register" component={register} />
        <Stack.Screen name="Main_menu" component={main_menu} />
        <Stack.Screen name="Account" component={account} />
      </Stack.Navigator>
    </NavigationContainer>
  );

}
