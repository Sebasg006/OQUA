import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { Image, Text, View } from "react-native-web";

export default function SplashScreen({ navigation }) {
    useEffect(() => {
      setTimeout(() => {
        navigation.replace('Auth');
      }, 2000); // 2 segundos
    }, []);

    return (
        <View style={style.container}>
            <Image source={require('../assets/images/OQUA.svg')} style={styles.logo}/>
            <Text  style={styles.text}>OQUA</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#A6E3E9',
    },
    logo: { width: 100, height: 100, marginBottom: 20 },
    text: { fontSize: 32, fontWeight: 'bold', color: '#000' },


})