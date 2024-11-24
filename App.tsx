import * as React from 'react';
import { useCallback } from 'react';
import {useRef, useState,  useEffect} from 'react';
import RNFS from 'react-native-fs';

import { 
  Button, 
  Image, 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  FlatList,
  SectionList,
  StatusBar, 
  TouchableOpacity,
  Alert,
  DrawerLayoutAndroid,
  ActivityIndicator,
  TextInput , 
  PermissionsAndroid, 
  Platform,
  Switch,
} from 'react-native';

import { NavigationContainer } from '@react-navigation/native';

import * as GoogleGenerativeAI from "@google/generative-ai";

import { useFocusEffect } from '@react-navigation/native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

const styles = StyleSheet.create({
  navigationContainer: { backgroundColor: '#ecf0f1', },
  item: { backgroundColor: '#f9c2ff', padding: 20, marginVertical: 8, },
  title: { fontSize: 24, },
  container: { flex: 1, backgroundColor: "#ffff", marginTop: 50 },
  smallcontainer: { flex: 0.5, padding: 10, backgroundColor: "#ffff", marginTop: 50 },
  messageContainer: { padding: 10, marginVertical: 5 },
  messageText: { fontSize: 16 },
  inputContainer: { flexDirection: "row", alignItems: "center", padding: 10 },
  input: { flex: 1, padding: 10, backgroundColor: "#131314", borderRadius: 10, height: 50, color: "white", },
});

let DATA = [];

// Define the file path for the recipes
const recipesFilePath = `${RNFS.DocumentDirectoryPath}/recipes.json`;

// Function to save DATA to a file
const saveDataToFile = async () => {
  try {
    await RNFS.writeFile(recipesFilePath, JSON.stringify(DATA), 'utf8');
    console.log('DATA saved to file.');
  } catch (error) {
    console.log('Error saving DATA:', error);
  }
};

// Function to load DATA from a file
const loadDataFromFile = async () => {
  try {
    const fileExists = await RNFS.exists(recipesFilePath);
    if (fileExists) {
      const fileContent = await RNFS.readFile(recipesFilePath, 'utf8');
      DATA = JSON.parse(fileContent);
      console.log('DATA loaded from file:', DATA);
    }
  } catch (error) {
    console.log('Error loading DATA:', error);
  }
};

function AIScreen ({ navigation }) {

  let isRecipe = false;
  const GeminiChat = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  
  const [loading, setLoading] = useState(false);
  const API_KEY = "";//replace with your own api key
  
    const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          "Day 1 recipes": {
            type: "string"
          },
          "Day 2 recipes": {
            type: "string"
          },
          "Day 3 recipes": {
            type: "string"
          },
          "Day 4 recipes": {
            type: "string"
          },
          "Day 5 recipes": {
            type: "string"
          }
        }}}
    
    useEffect(() => {
      const startChat = async () => {
      let prompt = "You are a nutritionist who helps people plan their diet to achieve their health goals. When people ask you questions, you should help them plan five healthy daily recipes based on their needs. Please use the following template to generate recipes. Please note that the following template only represents your style, not that you can only use a few dishes in each recipe.\n<1.[Food in the first diet plan]>\n<2.[Food in the second diet plan]>\n<3.[Food in the third diet plan]\n[Food in the third diet plan]>\n<4.[Food in the fourth diet plan]>\n<5.[Food in the fifth diet plan]>\nWhen people ask questions that are not related to health and diet, please do not answer and say:\nAs a nutrition-related AI, I do not have the ability to answer these questions"
  ;
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      console.log(text);   


      setMessages([
        {
          text,
          user: false,
        },
      ]);
    };
    // function call
    startChat();
  }, []);

    const sendMessage = async () => {
      setLoading(true);
      const userMessage = { text: userInput, user: true };
      
      //ClearMessage();

      if (messages.length != 0) {
        setMessages([userMessage]);
        isRecipe = true;
      } else {
        setMessages([messages, userMessage]);
      }
        
      const prompt = userMessage.text;

      const result = await model.generateContent("You are a nutritionist who helps people plan their diet to achieve their health goals. When people ask you questions, you should help them plan five healthy daily recipes based on their needs. Please use the following template to generate recipes. Please note that the following template only represents your style, not that you can only use a few dishes in each recipe.\n<1.[Food in the first diet plan]>\n<2.[Food in the second diet plan]>\n<3.[Food in the third diet plan]\n[Food in the third diet plan]>\n<4.[Food in the fourth diet plan]>\n<5.[Food in the fifth diet plan]>\nWhen people ask questions that are not related to health and diet, please do not answer and say:\nAs a nutrition-related AI, I do not have the ability to answer these questions \n The following will be questions, please answer:" 
        + prompt + "My BMR is " + BMR, generationConfig);
      const response = result.response;
      const text = response.text();
      setMessages([messages, { text, user: false }]);
      setLoading(false);
      setUserInput("");
    };
  
  
    const ClearMessage = () => {
      setMessages("");
    };
  
    const renderMessage = ({ item }) => (
      <View style={styles.messageContainer}>
        <Text style={[styles.messageText, item.user && styles.userMessage]}>
          {item.text}
        </Text>
      </View>
    );

    const saveRecipe = () => {
      
      //DATA.push(messages); // Add the comma to separate the arguments
      console.log(DATA);
      //DATA.push("organge");
      console.log(messages);
      const messageText = messages[1]?.text; // Use optional chaining to avoid errors if messages is empty

      if (messageText) {
        DATA.push(messageText);
        saveDataToFile();
      }
      console.log(DATA);
      isRecipe = false;
    };

    return (
      <View style={styles.container}>
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.text}
          //inverted
        />
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Type a message"
            onChangeText={setUserInput}
            value={userInput}
            onSubmitEditing={sendMessage}
            style={styles.input}
            placeholderTextColor="#fff"
          />
        </View>
        <View style={styles.inputContainer}>
        <Button title="Save recipe" onPress={() => {
      if (isRecipe) {
        saveRecipe();
      }
    }} />
      </View>
      </View>
    );
  };

  return (

    <View style={styles.container}>
      <GeminiChat />
    </View>

  );  

}

/*
const [data, setData] = useState([{ title: 'Main dishes', data: ['Pizza', 'Burger', 'Risotto'] },]);

*/
function RecipesScreen({ navigation }) {
  const [data, setData] = React.useState(DATA);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const fileExists = await RNFS.exists(recipesFilePath);
        if (fileExists) {
          const fileContent = await RNFS.readFile(recipesFilePath, 'utf8');
          const loadedData = JSON.parse(fileContent);
          setData(loadedData);
          DATA = loadedData; // Update global DATA as well
          console.log('DATA loaded on mount:', loadedData);
        }
      } catch (error) {
        console.log('Error loading DATA:', error);
      }
    };
    loadInitialData(); // Load data when component mounts
  }, []);

  // Use useFocusEffect to refresh the data when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const loadDataFromFile = async () => {
        try {
          const fileExists = await RNFS.exists(recipesFilePath);
          if (fileExists) {
            const fileContent = await RNFS.readFile(recipesFilePath, 'utf8');
            const loadedData = JSON.parse(fileContent);
            setData(loadedData);
          }
        } catch (error) {
          console.log('Error loading DATA:', error);
        }
      };
      loadDataFromFile();
    }, [])
  );

  // Handle double-tap to delete item
  let tapTimeout = null;

  const handleItemPress = (index) => {
    if (tapTimeout) {
      clearTimeout(tapTimeout);
      tapTimeout = null;
      confirmDelete(index); // Double-tap detected
    } else {
      tapTimeout = setTimeout(() => {
        clearTimeout(tapTimeout);
        tapTimeout = null;
      }, 300); // Set delay for detecting double-tap
    }
  };

  const confirmDelete = (index) => {
    Alert.alert(
      'Delete Recipe',
      'Are you sure you want to delete this recipe?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteRecipe(index),
        },
      ],
      { cancelable: true }
    );
  };

  const deleteRecipe = async (index) => {
    try {
      const updatedData = [...data];
      updatedData.splice(index, 1); // Remove item from the list
      setData(updatedData); // Update state to refresh list

      // Save updated data to file
      await RNFS.writeFile(recipesFilePath, JSON.stringify(updatedData), 'utf8');
    } catch (error) {
      console.log('Error deleting recipe:', error);
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.fixToText}>
        <Button
          title="Go to BMR Calculator"
          onPress={() => navigation.navigate('BMR Calculator')}
        />
      </View>
      <Text>Saved Recipes - double click to delete a recipe</Text>
      <FlatList
        data={data}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => handleItemPress(index)}
          >
            <Text style={styles.title}>{item}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    </SafeAreaView>
  );
}

let BMR = -1;

function BMRScreen({ navigation }) {

  const [text, onChangeText] = React.useState('');//height
  const [number, onChangeNumber] = React.useState('');//weight
  const [age, whenChangeNumber] = React.useState('');

  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  return (

   
    <SafeAreaView style={styles.smallcontainer}>
      <TextInput
        style={styles.input}
        onChangeText={onChangeText}
        value={text}
        placeholder="Please enter your height in cm"
        placeholderTextColor="#FFFFFF"
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        onChangeText={onChangeNumber}
        value={number}
        placeholder="Please enter your weight in kg"
        placeholderTextColor="#FFFFFF"
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        onChangeText={whenChangeNumber}
        value={age}
        placeholder="Please enter your age"
        placeholderTextColor="#FFFFFF"
        keyboardType="numeric"
      />
    <Text> What is your biological sexes</Text>
    <Text> Male</Text>
    <View style={{ flexDirection: 'row' }}>
      <Switch
        trackColor={{false: '#767577', true: '#81b0ff'}}
        thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
        ios_backgroundColor="#3e3e3e"
        onValueChange={toggleSwitch}
        value={isEnabled}
      />
    </View>
    <Text> Female</Text>
      
      <Button

      title="Please fill out above info to proceed"
      onPress={() => {
        console.log(text +","+ number + ","+ age);
        if (text && number && age) {
          console.log(isEnabled);
          if(!isEnabled)
            BMR = 10 * parseInt(number,10) + 6.25 * parseInt(text,10) - 5 * parseInt(age,10) + 5;
          else
            BMR = 10 * parseInt(number,10) + 6.25 * parseInt(text,10) - 5 * parseInt(age,10) + 161;
          console.log(BMR);
          navigation.navigate('Your Nutrition Assistant');
        }
      }}
      //onPress={() => navigation.navigate('Home')}

      />
      
  </SafeAreaView>

  );  

}



const Stack = createNativeStackNavigator();




function App() {

  useEffect(() => {
    loadDataFromFile();
  }, []);

  return (

    <NavigationContainer>

      <Stack.Navigator>

        <Stack.Screen name="Recipes" component={RecipesScreen} />

        <Stack.Screen name="BMR Calculator" component={BMRScreen} />

        <Stack.Screen name="Your Nutrition Assistant" component={AIScreen} />

        
      </Stack.Navigator>

    </NavigationContainer>

  );  

}




export default App;
