"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Animated,
  Vibration,
  Platform,
  SafeAreaView,
} from "react-native"
import { Audio } from "expo-av"
import * as Speech from "expo-speech"
import LottieView from "lottie-react-native"
import { GameEngine } from "react-native-game-engine"
import Slider from "@react-native-community/slider"
import * as Font from "expo-font"
import * as Haptics from "expo-haptics"
import { db } from "../firebase/firebaseConfig"
import { collection, getDocs, doc, setDoc, getDoc, updateDoc } from "firebase/firestore"
import { getAuth } from "firebase/auth"

// Game engine systems
const MovementSystem = (entities, { touches }) => {
  touches
    .filter((t) => t.type === "move")
    .forEach((t) => {
      const finger = entities.finger
      if (finger && finger.position) {
        finger.position = [t.event.pageX, t.event.pageY]
      }
    })
  return entities
}

const SpellingGame = ({ navigation }) => {
  // State variables
  const [fontsLoaded, setFontsLoaded] = useState(false)
  const [words, setWords] = useState([])
  const [currentWord, setCurrentWord] = useState(null)
  const [currentLevel, setCurrentLevel] = useState("easy")
  const [loading, setLoading] = useState(true)
  const [score, setScore] = useState(0)
  const [usedWords, setUsedWords] = useState([])
  const [correctSound, setCorrectSound] = useState(null)
  const [incorrectSound, setIncorrectSound] = useState(null)
  const [wordSound, setWordSound] = useState(null)
  const [animationVisible, setAnimationVisible] = useState(false)
  const [animationSource, setAnimationSource] = useState(null)
  const [speechRate, setSpeechRate] = useState(1.0)
  const [gameEntities, setGameEntities] = useState({
    finger: { position: [100, 100], renderer: <View style={styles.finger} /> },
  })
  const [userProgress, setUserProgress] = useState({
    level: "easy",
    score: 0,
    wordsCompleted: [],
  })
  const [isOffline, setIsOffline] = useState(false)
  const [preloadedAssets, setPreloadedAssets] = useState({})

  const gameEngineRef = useRef(null)
  const animationRef = useRef(null)
  const scoreAnimation = useRef(new Animated.Value(0)).current

  // Load fonts
  useEffect(() => {
    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          OpenDyslexic: require("../../assets/fonts/OpenDyslexic-Regular.otf"),
          "OpenDyslexic-Bold": require("../../assets/fonts/OpenDyslexic-Bold.otf"),
        })
        setFontsLoaded(true)
      } catch (error) {
        console.error("Error loading fonts:", error)
        // Fallback to system font if OpenDyslexic can't be loaded
        setFontsLoaded(true)
      }
    }
    loadFonts()
  }, [])

  // Load words from Firebase
  useEffect(() => {
    const fetchWords = async () => {
      try {
        // Get all words from the 'words' collection
        const wordsCollection = collection(db, "words")
        const querySnapshot = await getDocs(wordsCollection)

        if (querySnapshot.empty) {
          console.warn("No words found in Firebase. Using local data.")
          setIsOffline(true)
          setWords(getLocalWordData())

          // Optionally initialize the database if it's empty
          // Uncomment the next line if you want to auto-initialize
          // await initializeSpellingWords();
        } else {
          const fetchedWords = querySnapshot.docs.map((doc) => doc.data())
          console.log(`Fetched ${fetchedWords.length} words from Firebase`)
          setWords(fetchedWords)
        }

        // Load user progress
        await loadUserProgress()

        setLoading(false)
      } catch (error) {
        console.error("Error fetching words:", error)
        // Fallback to local data if offline or error
        setIsOffline(true)
        setWords(getLocalWordData())
        setLoading(false)
      }
    }

    fetchWords()
  }, [])

  // Load sounds
  useEffect(() => {
    const loadSounds = async () => {
      try {
        const { sound: correct } = await Audio.Sound.createAsync(require("../../assets/correct.wav"))
        const { sound: incorrect } = await Audio.Sound.createAsync(require("../../assets/incorrect.mp3"))
        setCorrectSound(correct)
        setIncorrectSound(incorrect)
      } catch (error) {
        console.error("Error loading sounds:", error)
      }
    }
    loadSounds()
  }, [])

  // Cleanup sounds on unmount
  useEffect(() => {
    return () => {
      if (correctSound) correctSound.unloadAsync()
      if (incorrectSound) incorrectSound.unloadAsync()
      if (wordSound) wordSound.unloadAsync()
      Object.values(preloadedAssets).forEach((asset) => {
        if (asset.sound) asset.sound.unloadAsync()
      })
    }
  }, [correctSound, incorrectSound, wordSound, preloadedAssets])

  // Load user progress from Firebase
  const loadUserProgress = async () => {
    try {
      const auth = getAuth()
      const user = auth.currentUser

      if (user) {
        const userDocRef = doc(db, "userProgress", user.uid)
        const userDoc = await getDoc(userDocRef)

        if (userDoc.exists()) {
          const userData = userDoc.data()
          setUserProgress(userData)
          setCurrentLevel(userData.level || "easy")
          setScore(userData.score || 0)
          setUsedWords(userData.wordsCompleted || [])
        } else {
          // Create new user progress document
          const initialProgress = {
            level: "easy",
            score: 0,
            wordsCompleted: [],
            lastUpdated: new Date(),
          }
          await setDoc(userDocRef, initialProgress)
          setUserProgress(initialProgress)
        }
      } else {
        console.log("No user logged in. Using default progress.")
      }
    } catch (error) {
      console.error("Error loading user progress:", error)
    }
  }

  // Save user progress to Firebase
  const saveUserProgress = async () => {
    try {
      const auth = getAuth()
      const user = auth.currentUser

      if (user) {
        const userDocRef = doc(db, "userProgress", user.uid)
        await updateDoc(userDocRef, {
          level: currentLevel,
          score: score,
          wordsCompleted: usedWords,
          lastUpdated: new Date(),
        })
        console.log("User progress saved successfully")
      } else {
        console.log("No user logged in. Progress not saved.")
      }
    } catch (error) {
      console.error("Error saving user progress:", error)
    }
  }

  // Fetch a random word based on current level
  const fetchRandomWord = useCallback(() => {
    // Filter words by current level and not used yet
    const levelWords = words.filter((w) => w.difficulty === currentLevel && !usedWords.includes(w.word))

    if (levelWords.length === 0) {
      // Level completed, move to next level
      const levels = ["easy", "medium", "hard", "expert"]
      const currentIndex = levels.indexOf(currentLevel)

      if (currentIndex < levels.length - 1) {
        setCurrentLevel(levels[currentIndex + 1])
        // Show level up animation
        setAnimationSource(require("../../assets/levelup.json"))
        setAnimationVisible(true)
        setTimeout(() => {
          setAnimationVisible(false)
          fetchRandomWord()
        }, 2500)
      } else {
        // Game completed
        setAnimationSource(require("../../assets/gamecomplete.json"))
        setAnimationVisible(true)
      }
      return
    }

    const randomIndex = Math.floor(Math.random() * levelWords.length)
    const word = levelWords[randomIndex]
    setCurrentWord(word)

    // Preload and play word sound
    playWordSound(word)
  }, [words, currentLevel, usedWords])

  // Play word sound with adjustable speed
  const playWordSound = async (word) => {
    try {
      // Check if we have preloaded the sound
      if (preloadedAssets[word.word] && preloadedAssets[word.word].sound) {
        const sound = preloadedAssets[word.word].sound
        await sound.setRateAsync(speechRate, true)
        await sound.playAsync()
      } else if (word.sound) {
        // Try to load and play the sound
        try {
          const { sound } = await Audio.Sound.createAsync({ uri: word.sound })
          await sound.setRateAsync(speechRate, true)
          await sound.playAsync()
          setWordSound(sound)
        } catch (error) {
          console.warn(`Error playing sound for ${word.word}:`, error)
          // Fallback to speech synthesis
          Speech.speak(word.word, {
            language: "en-US",
            rate: speechRate,
            pitch: 1.0,
          })
        }
      } else {
        // Fallback to speech synthesis
        Speech.speak(word.word, {
          language: "en-US",
          rate: speechRate,
          pitch: 1.0,
        })
      }
    } catch (error) {
      console.error("Error playing word sound:", error)
      // Fallback to speech synthesis
      Speech.speak(word.word, {
        language: "en-US",
        rate: speechRate,
        pitch: 1.0,
      })
    }
  }

  // Handle answer selection
  const handleAnswer = (selectedOption) => {
    if (!currentWord) return

    const isCorrect = selectedOption === currentWord.word

    if (isCorrect) {
      setScore(score + 10)
      setAnimationSource(require("../../assets/correct.json"))
      playSound(true)
      triggerHapticFeedback("success")

      // Animate score
      Animated.sequence([
        Animated.timing(scoreAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scoreAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      setAnimationSource(require("../../assets/incorrect.json"))
      playSound(false)
      triggerHapticFeedback("error")
    }

    setAnimationVisible(true)
    setTimeout(() => {
      setAnimationVisible(false)

      if (isCorrect) {
        setUsedWords([...usedWords, currentWord.word])
        saveUserProgress()
        fetchRandomWord()
      }
    }, 2000)
  }

  // Play sound effect
  const playSound = async (isCorrect) => {
    try {
      if (isCorrect && correctSound) {
        await correctSound.replayAsync()
      } else if (!isCorrect && incorrectSound) {
        await incorrectSound.replayAsync()
      }
    } catch (error) {
      console.error("Error playing sound:", error)
    }
  }

  // Trigger haptic feedback
  const triggerHapticFeedback = (type) => {
    try {
      if (Platform.OS === "ios") {
        switch (type) {
          case "success":
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            break
          case "error":
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
            break
          default:
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        }
      } else {
        // Android fallback
        Vibration.vibrate(type === "success" ? 100 : 300)
      }
    } catch (error) {
      console.warn("Haptic feedback error:", error)
    }
  }

  // Repeat word pronunciation
  const repeatWord = () => {
    if (currentWord) {
      playWordSound(currentWord)
      triggerHapticFeedback("light")
    }
  }

  // Change speech rate
  const changeSpeechRate = (rate) => {
    setSpeechRate(rate)
  }

  // Start the game
  useEffect(() => {
    if (!loading && words.length > 0 && !currentWord) {
      fetchRandomWord()
    }
  }, [loading, words, currentWord, fetchRandomWord])

  // Reset game
  const resetGame = () => {
    setCurrentLevel("easy")
    setScore(0)
    setUsedWords([])
    setCurrentWord(null)
    saveUserProgress()
    fetchRandomWord()
  }

  // Fallback local word data for offline mode
  const getLocalWordData = () => {
    return [
      {
        id: "word1",
        word: "cat",
        options: ["cat", "kat", "cet", "caat"],
        image: "https://source.unsplash.com/featured/?cat",
        difficulty: "easy",
      },
      {
        id: "word2",
        word: "dog",
        options: ["dog", "dogg", "doog", "dag"],
        image: "https://source.unsplash.com/featured/?dog",
        difficulty: "easy",
      },
      {
        id: "word3",
        word: "run",
        options: ["run", "runn", "roon", "rann"],
        image: "https://source.unsplash.com/featured/?running",
        difficulty: "easy",
      },
      {
        id: "word4",
        word: "jump",
        options: ["jump", "jamp", "jomp", "jumb"],
        image: "https://source.unsplash.com/featured/?jumping",
        difficulty: "easy",
      },
      {
        id: "word5",
        word: "play",
        options: ["play", "plai", "pley", "pllay"],
        image: "https://source.unsplash.com/featured/?playing",
        difficulty: "easy",
      },
      {
        id: "word6",
        word: "apple",
        options: ["apple", "aple", "appel", "apel"],
        image: "https://source.unsplash.com/featured/?apple",
        difficulty: "medium",
      },
      {
        id: "word7",
        word: "banana",
        options: ["banana", "bananna", "banena", "bananaa"],
        image: "https://source.unsplash.com/featured/?banana",
        difficulty: "medium",
      },
      {
        id: "word8",
        word: "orange",
        options: ["orange", "orenge", "orang", "oranj"],
        image: "https://source.unsplash.com/featured/?orange",
        difficulty: "medium",
      },
    ]
  }

  if (loading || !fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={[styles.loadingText, fontsLoaded ? { fontFamily: "OpenDyslexic" } : null]}>Loading game...</Text>
      </View>
    )
  }

  const scoreScale = scoreAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.2, 1],
  })

  return (
    <SafeAreaView style={styles.container}>
      {/* Game header */}
      <View style={styles.header}>
        <Animated.Text style={[styles.scoreText, { transform: [{ scale: scoreScale }] }]}>Score: {score}</Animated.Text>
        <Text style={styles.levelText}>Level: {currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1)}</Text>
      </View>

      {/* Game content */}
      <View style={styles.gameContainer}>
        {currentWord && (
          <>
            <Image source={{ uri: currentWord.image }} style={styles.wordImage} resizeMode="cover" />

            <View style={styles.controlsContainer}>
              <TouchableOpacity
                style={styles.repeatButton}
                onPress={repeatWord}
                accessibilityLabel="Repeat word pronunciation"
              >
                <Text style={styles.repeatButtonText}>🔊 Hear Word</Text>
              </TouchableOpacity>

              <View style={styles.speedContainer}>
                <Text style={styles.speedLabel}>Speed: {speechRate.toFixed(1)}x</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0.5}
                  maximumValue={1.5}
                  step={0.1}
                  value={speechRate}
                  onValueChange={changeSpeechRate}
                  minimumTrackTintColor="#4CAF50"
                  maximumTrackTintColor="#000000"
                  thumbTintColor="#4CAF50"
                  accessibilityLabel="Adjust speech rate"
                />
              </View>
            </View>

            <Text style={styles.instructionText}>Select the correct spelling:</Text>

            <View style={styles.optionsContainer}>
              {currentWord.options &&
                currentWord.options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.optionButton}
                    onPress={() => handleAnswer(option)}
                    accessibilityLabel={`Option ${index + 1}: ${option}`}
                  >
                    <Text style={styles.optionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
            </View>
          </>
        )}

        {/* Game Engine for interactive elements */}
        <GameEngine ref={gameEngineRef} style={styles.gameEngine} systems={[MovementSystem]} entities={gameEntities} />

        {/* Animation overlay */}
        {animationVisible && (
          <View style={styles.animationContainer}>
            <LottieView ref={animationRef} source={animationSource} autoPlay loop={false} style={styles.animation} />
          </View>
        )}
      </View>

      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${(usedWords.filter((w) => words.find((word) => word.word === w)?.difficulty === currentLevel).length / (words.filter((w) => w.difficulty === currentLevel).length || 1)) * 100}%`,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {usedWords.filter((w) => words.find((word) => word.word === w)?.difficulty === currentLevel).length} /
          {words.filter((w) => w.difficulty === currentLevel).length} words
        </Text>
      </View>

      {/* Reset button */}
      <TouchableOpacity style={styles.resetButton} onPress={resetGame} accessibilityLabel="Reset game">
        <Text style={styles.resetButtonText}>Reset Game</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const { width, height } = Dimensions.get("window")

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: "#333",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#4CAF50",
  },
  scoreText: {
    fontSize: 22,
    fontFamily: "OpenDyslexic-Bold",
    color: "white",
  },
  levelText: {
    fontSize: 20,
    fontFamily: "OpenDyslexic",
    color: "white",
  },
  gameContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  wordImage: {
    width: width * 0.8,
    height: height * 0.25,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "#4CAF50",
  },
  controlsContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  repeatButton: {
    backgroundColor: "#2196F3",
    padding: 10,
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  repeatButtonText: {
    color: "white",
    fontFamily: "OpenDyslexic",
    fontSize: 16,
  },
  speedContainer: {
    flex: 1,
    marginLeft: 15,
  },
  speedLabel: {
    fontFamily: "OpenDyslexic",
    fontSize: 14,
    color: "#333",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  instructionText: {
    fontSize: 22,
    fontFamily: "OpenDyslexic-Bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  optionsContainer: {
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
  },
  optionButton: {
    backgroundColor: "#673AB7",
    padding: 15,
    borderRadius: 10,
    marginVertical: 8,
    width: "90%",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  optionText: {
    color: "white",
    fontSize: 24,
    fontFamily: "OpenDyslexic",
  },
  gameEngine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  finger: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  animationContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 10,
  },
  animation: {
    width: 200,
    height: 200,
  },
  progressContainer: {
    padding: 15,
    backgroundColor: "#E0E0E0",
  },
  progressBar: {
    height: 15,
    backgroundColor: "#BDBDBD",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
  },
  progressText: {
    marginTop: 5,
    textAlign: "center",
    fontFamily: "OpenDyslexic",
    fontSize: 14,
    color: "#333",
  },
  resetButton: {
    backgroundColor: "#FF5722",
    padding: 12,
    margin: 15,
    borderRadius: 10,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  resetButtonText: {
    color: "white",
    fontFamily: "OpenDyslexic-Bold",
    fontSize: 16,
  },
})

export default SpellingGame

