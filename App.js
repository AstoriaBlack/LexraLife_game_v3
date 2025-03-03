import { StatusBar } from "react-native"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { SafeAreaProvider } from "react-native-safe-area-context"
import HomeScreen from "./src/screens/HomeScreen"
import GameScreen from "./src/screens/GameScreen"
import SpellingGameScreen from "./src/screens/SpellingGameScreen"
import AdminScreen from "./src/screens/AdminScreen"
import LoginScreen from "./src/screens/LoginScreen"
import RegisterScreen from "./src/screens/RegisterScreen"
import ProfileScreen from "./src/screens/ProfileScreen"

const Stack = createNativeStackNavigator()

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar barStyle="dark-content" />
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Lexera Life" }} />
          <Stack.Screen name="GameScreen" component={GameScreen} options={{ title: "Word Game" }} />
          <Stack.Screen name="SpellingGame" component={SpellingGameScreen} options={{ title: "Spelling Game" }} />
          <Stack.Screen name="Admin" component={AdminScreen} options={{ title: "Admin Panel" }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Login" }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "Register" }} />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: "Profile" }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}

