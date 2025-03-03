"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native"
import { initializeSpellingWords } from "../firebase/initializeSpellingWords"
import { SafeAreaView } from "react-native-safe-area-context"

const AdminScreen = () => {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleInitializeDatabase = async () => {
    setLoading(true)
    try {
      const success = await initializeSpellingWords()
      setResult(success ? "Database initialized successfully!" : "Database already exists. No changes made.")
      Alert.alert(
        "Database Initialization",
        success ? "Spelling words have been added to the database!" : "Database already exists. No changes made.",
      )
    } catch (error) {
      console.error("Error:", error)
      setResult(`Error: ${error.message}`)
      Alert.alert("Error", `Failed to initialize database: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Admin Panel</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Database Management</Text>
          <Text style={styles.description}>
            Initialize your Firebase database with spelling words for the game. This will only add data if the database
            is empty.
          </Text>

          <TouchableOpacity style={styles.button} onPress={handleInitializeDatabase} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? "Initializing..." : "Initialize Spelling Words Database"}</Text>
          </TouchableOpacity>

          {result && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultText}>{result}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <Text style={styles.description}>
            1. Make sure you have set up your Firebase configuration correctly in firebaseConfig.js
          </Text>
          <Text style={styles.description}>
            2. Press the button above to initialize the database with spelling words
          </Text>
          <Text style={styles.description}>
            3. You only need to do this once. The script checks if data already exists.
          </Text>
          <Text style={styles.description}>
            4. To add more words, edit the spellingWords array in initializeSpellingWords.js
          </Text>
        </View>
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
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
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
    lineHeight: 20,
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  resultContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#e8f5e9",
    borderRadius: 5,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  resultText: {
    color: "#2e7d32",
  },
})

export default AdminScreen

