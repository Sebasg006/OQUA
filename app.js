import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigaor } from '@react-navigation/native-stack';
import { Stack } from 'expo-router';
import React from 'react';
import { AuthScreen } from './Screens/AuthScreen';
import { SplashScreen } from './Screens/SplashScreen';

const Stacl = createNativeStackNavigaor();

export default function App() {
    return (
        <NavigationContainer>
    <Stack.Navigator>
        <Stack.Screen name='Splash' component={SplashScreen} />
        <Stack.Screen name='Auth' component={AuthScreen}/>
    </Stack.Navigator>
        </NavigationContainer>
    )
}