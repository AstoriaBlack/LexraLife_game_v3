"use client"
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth"
import { useState, useEffect } from "react"

const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState(null)
  const auth = getAuth()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })

    return () => unsubscribe()
  }, [auth]) // Added auth to dependencies

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error("Error signing out: ", error)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Image source={require("../../assets/logo.png")} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>Lexera Life</Text>
          {user ? (
            <View style={styles.userContainer}>
              <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate("Profile")}>
                <Text style={styles.profileButtonText}>Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.authButtons}>
              <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate("Login")}>
                <Text style={styles.loginButtonText}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate("Register")}>
                <Text style={styles.registerButtonText}>Register</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Text style={styles.welcomeText}>Welcome to Lexera Life, a learning platform designed for dyslexic users!</Text>

        <View style={styles.gamesContainer}>
          <Text style={styles.sectionTitle}>Games</Text>

          <TouchableOpacity style={styles.gameCard} onPress={() => navigation.navigate("GameScreen")}>
            <Image source={require("../../assets/word-game.png")} style={styles.gameImage} resizeMode="cover" />
            <View style={styles.gameInfo}>
              <Text style={styles.gameTitle}>Word Game</Text>
              <Text style={styles.gameDescription}>Practice word recognition and improve reading skills</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gameCard} onPress={() => navigation.navigate("SpellingGame")}>
            <Image source={require("../../assets/spelling-game.png")} style={styles.gameImage} resizeMode="cover" />
            <View style={styles.gameInfo}>
              <Text style={styles.gameTitle}>Spelling Game</Text>
              <Text style={styles.gameDescription}>Improve your spelling skills with interactive exercises</Text>
            </View>
          </TouchableOpacity>
        </View>

        {user && user.email === "admin@lexeralife.com" && (
          <TouchableOpacity style={styles.adminButton} onPress={() => navigation.navigate("Admin")}>
            <Text style={styles.adminButtonText}>Admin Panel</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  logo: {
    width: 50,
    height: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  userContainer: {
    flexDirection: "row",
  },
  profileButton: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
    marginRight: 8,
  },
  profileButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "#FF5722",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
  },
  logoutButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  authButtons: {
    flexDirection: "row",
  },
  loginButton: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
    marginRight: 8,
  },
  loginButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  registerButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
  },
  registerButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  welcomeText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  gamesContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  gameCard: {
    backgroundColor: "white",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gameImage: {
    width: "100%",
    height: 150,
  },
  gameInfo: {
    padding: 15,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  gameDescription: {
    fontSize: 14,
    color: "#666",
  },
  adminButton: {
    backgroundColor: "#673AB7",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  adminButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
})

export default HomeScreen

