import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const detail = () => {
    const params = useLocalSearchParams();

    return (
        <View>
            <Text>
                {'aaa'}
            </Text>
        </View>
    );
};

export default detail;