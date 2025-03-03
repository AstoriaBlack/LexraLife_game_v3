import { db } from "./firebaseConfig"
import { collection, doc, setDoc, getDocs } from "firebase/firestore"

// Spelling words data structure
const spellingWords = [
  {
    id: "word1",
    word: "cat",
    options: ["cat", "kat", "cet", "caat"],
    image: "https://source.unsplash.com/featured/?cat",
    sound: null, // We'll use speech synthesis instead of audio files
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
  {
    id: "word9",
    word: "school",
    options: ["school", "scool", "skool", "schol"],
    image: "https://source.unsplash.com/featured/?school",
    difficulty: "medium",
  },
  {
    id: "word10",
    word: "friend",
    options: ["friend", "freind", "frend", "frind"],
    image: "https://source.unsplash.com/featured/?friends",
    difficulty: "medium",
  },
  {
    id: "word11",
    word: "beautiful",
    options: ["beautiful", "beutiful", "beautifull", "beautful"],
    image: "https://source.unsplash.com/featured/?beautiful",
    difficulty: "hard",
  },
  {
    id: "word12",
    word: "elephant",
    options: ["elephant", "elefant", "elephent", "elefent"],
    image: "https://source.unsplash.com/featured/?elephant",
    difficulty: "hard",
  },
  {
    id: "word13",
    word: "dinosaur",
    options: ["dinosaur", "dinasaur", "dinasour", "dinosar"],
    image: "https://source.unsplash.com/featured/?dinosaur",
    difficulty: "hard",
  },
  {
    id: "word14",
    word: "computer",
    options: ["computer", "computter", "computor", "compuder"],
    image: "https://source.unsplash.com/featured/?computer",
    difficulty: "hard",
  },
  {
    id: "word15",
    word: "chocolate",
    options: ["chocolate", "choclate", "chocolat", "choclet"],
    image: "https://source.unsplash.com/featured/?chocolate",
    difficulty: "hard",
  },
]

// Function to initialize the database with spelling words
export const initializeSpellingWords = async () => {
  try {
    // First check if words already exist
    const wordsCollection = collection(db, "words")
    const snapshot = await getDocs(wordsCollection)

    if (!snapshot.empty) {
      console.log("Words collection already exists. Skipping initialization.")
      return false
    }

    console.log("Initializing spelling words database...")

    // Add each word to the database
    for (const word of spellingWords) {
      await setDoc(doc(wordsCollection, word.id), word)
      console.log(`Added word: ${word.word}`)
    }

    console.log("Database initialization complete!")
    return true
  } catch (error) {
    console.error("Error initializing database:", error)
    return false
  }
}

