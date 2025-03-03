"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native"
import { getAuth, signOut } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../firebase/firebaseConfig"
import { SafeAreaView } from "react-native-safe-area-context"

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null)
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)

  const auth = getAuth()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser
        if (currentUser) {
          setUser(currentUser)

          // Fetch user progress from Firestore
          const userProgressRef = doc(db, "userProgress", currentUser.uid)
          const userProgressDoc = await getDoc(userProgressRef)

          if (userProgressDoc.exists()) {
            setProgress(userProgressDoc.data())
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [auth.currentUser]) // Added auth.currentUser as a dependency

  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigation.navigate("Home")
    } catch (error) {
      console.error("Error signing out:", error)
      Alert.alert("Error", "Failed to log out")
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.errorText}>You need to be logged in to view your profile.</Text>
          <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate("Login")}>
            <Text style={styles.loginButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{user.displayName ? user.displayName[0].toUpperCase() : "U"}</Text>
          </View>
          <Text style={styles.userName}>{user.displayName || "User"}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Game Progress</Text>
          {progress ? (
            <View>
              <View style={styles.progressItem}>
                <Text style={styles.progressLabel}>Current Level:</Text>
                <Text style={styles.progressValue}>{progress.level || "Not started"}</Text>
              </View>
              <View style={styles.progressItem}>
                <Text style={styles.progressLabel}>Score:</Text>
                <Text style={styles.progressValue}>{progress.score || 0}</Text>
              </View>
              <View style={styles.progressItem}>
                <Text style={styles.progressLabel}>Words Completed:</Text>
                <Text style={styles.progressValue}>{progress.wordsCompleted ? progress.wordsCompleted.length : 0}</Text>
              </View>
              <View style={styles.progressItem}>
                <Text style={styles.progressLabel}>Last Played:</Text>
                <Text style={styles.progressValue}>
                  {progress.lastUpdated ? new Date(progress.lastUpdated.toDate()).toLocaleString() : "Never"}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.noProgressText}>No game progress yet. Start playing to track your progress!</Text>
          )}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  loginButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 40,
    color: "white",
    fontWeight: "bold",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: "#666",
  },
  section: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  progressItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  progressLabel: {
    fontSize: 16,
    color: "#333",
  },
  progressValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4CAF50",
  },
  noProgressText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  logoutButton: {
    backgroundColor: "#FF5722",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
})

export default ProfileScreen

