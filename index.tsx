/*{import TaskRow from "@/components/TaskRow";
import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  View,
  Button
} from "react-native";
import { ExpoRouter } from "expo-router";

export type Task = {
  id: number;
  title: string;
  done: boolean;
};

// const sampleTodos: Task[] = [
//   // sample data - nepouzivame, getujeme data z webu
//   { id: 1, title: "Kupit maslo", done: true },
//   { id: 2, title: "Umyt dlazku", done: false },
//   { id: 3, title: "Vyvencit psa", done: true },
//   { id: 4, title: "Uvarit obed", done: false },
// ];

export default function Index() {
  const router = useRouter();
  const [todos, setTodos] = useState<Task[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<TextInput>(null);
  const inputPrevRef = useRef<TextInput>(null);
  

  const onPressAddTask = useCallback(() => {
    const inputs = [...todos];
    inputs.push({ id: Date.now(), title: input, done: false });
    setTodos(inputs);
    setInput("");
  }, [input, todos]);

  const onPressDone = (task: Task) => {
    const inputs = [...todos];
    inputs.map((t) => {
      if (t.id === task.id) {
        t.done = !t.done;
      }
    });
    setTodos(inputs);
  };
{/*}
  const onPressItem = (task: Task) => {
    const inputs = [...todos];
    inputs.map((t) => {
      if (t.id === task.id) {
        t.done = !t.done;
      }
    });
    setTodos(inputs);
  };*//*{}

  useEffect(() => {
    setLoading(true)
    fetch("https://dummyjson.com/todos?limit=150&delay=3000")
      .then((res) => res.json())
      .then((data) => {
        const inputs = data.todos.map((todo: any) => ({
          id: todo.id,
          title: todo.todo,
          done: todo.completed,
        }));
        setTodos(inputs);
      })
      .catch((err) => {
        console.log(err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const currentLength = input.length
    if (currentLength > 20 && inputPrevRef.current.length<currentLength) {
      alert("Príliš dlhý názov úlohy");
    }
    inputPrevRef.current=input;
  }, [input]);

  if(loading){
    return (<ActivityIndicator size={'large'} color={'green'}/>)
  }

  if(error) {
    return (
      <View>
        <Text>
          {error}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, paddingTop: 10 }}>
      <Stack.Screen
        options={{
          title: "Home",
          headerStyle: { backgroundColor: "#eeffff" },
        }}
      />
      <Button 
        title={"aa"}
        onPress={()=> inputRef.current?.focus()}
        />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Čo si odložím na neskôr?"
          value={input}
          autoCorrect={false}
          onChangeText={setInput}
        />
        <TouchableOpacity style={{ padding: 10 }} onPress={onPressAddTask}>
          <MaterialIcons name="arrow-forward" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <FlatList<Task>
        contentInsetAdjustmentBehavior="automatic"
        data={todos}
        renderItem={({ item }) => (
          <TaskRow 
            onPressItem={(task)=> router.push({
              pathname: "/detail", 
              params: { 
                id: task.id,
                title: task.title,
                done: task.done
              },
            })}
            onPressDone={onPressDone} task={item} 
          />
        )}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    flex: 1,
    fontSize: 16,
    padding: 15,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 20,
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: "#ffffff",
    borderColor: "#aaaaaa",
  },
});}*/

import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';


export default function App() {
  const [message, setMessage] = useState('Welcome to My First React Native App!');

  

  

  const getMovies = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/store');
      const json = await response.json();
    } catch (error) {
      console.error(error);
    } finally {
    }
  };

  useEffect(() => {
    getMovies();
  }, []);

  const changeMessage = () => {
    setMessage('You clicked the button!');
    getMovies();
  };
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      <Button title="Click Me" onPress={changeMessage} />
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  message: {
    fontSize: 20,
    marginBottom: 20,
  },
});