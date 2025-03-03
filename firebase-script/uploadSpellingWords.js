// Script to upload spelling words to Firebase
const admin = require("firebase-admin")
const fs = require("fs")
const path = require("path")

// Initialize Firebase Admin SDK with your service account
// You need to download your service account key from Firebase Console
// and save it as serviceAccountKey.json in this directory
const serviceAccount = require("./serviceAccountKey.json")

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

const db = admin.firestore()

// Spelling words data structure
const spellingWords = [
  {
    id: "word1",
    word: "cat",
    options: ["cat", "kat", "cet", "caat"],
    image: "https://source.unsplash.com/featured/?cat",
    sound: "https://example.com/sounds/cat.mp3", // Replace with actual URL
    difficulty: "easy",
  },
  {
    id: "word2",
    word: "dog",
    options: ["dog", "dogg", "doog", "dag"],
    image: "https://source.unsplash.com/featured/?dog",
    sound: "https://example.com/sounds/dog.mp3", // Replace with actual URL
    difficulty: "easy",
  },
  {
    id: "word3",
    word: "run",
    options: ["run", "runn", "roon", "rann"],
    image: "https://source.unsplash.com/featured/?running",
    sound: "https://example.com/sounds/run.mp3", // Replace with actual URL
    difficulty: "easy",
  },
  {
    id: "word4",
    word: "jump",
    options: ["jump", "jamp", "jomp", "jumb"],
    image: "https://source.unsplash.com/featured/?jumping",
    sound: "https://example.com/sounds/jump.mp3", // Replace with actual URL
    difficulty: "easy",
  },
  {
    id: "word5",
    word: "play",
    options: ["play", "plai", "pley", "pllay"],
    image: "https://source.unsplash.com/featured/?playing",
    sound: "https://example.com/sounds/play.mp3", // Replace with actual URL
    difficulty: "easy",
  },
  {
    id: "word6",
    word: "apple",
    options: ["apple", "aple", "appel", "apel"],
    image: "https://source.unsplash.com/featured/?apple",
    sound: "https://example.com/sounds/apple.mp3", // Replace with actual URL
    difficulty: "medium",
  },
  {
    id: "word7",
    word: "banana",
    options: ["banana", "bananna", "banena", "bananaa"],
    image: "https://source.unsplash.com/featured/?banana",
    sound: "https://example.com/sounds/banana.mp3", // Replace with actual URL
    difficulty: "medium",
  },
  {
    id: "word8",
    word: "orange",
    options: ["orange", "orenge", "orang", "oranj"],
    image: "https://source.unsplash.com/featured/?orange",
    sound: "https://example.com/sounds/orange.mp3", // Replace with actual URL
    difficulty: "medium",
  },
  {
    id: "word9",
    word: "school",
    options: ["school", "scool", "skool", "schol"],
    image: "https://source.unsplash.com/featured/?school",
    sound: "https://example.com/sounds/school.mp3", // Replace with actual URL
    difficulty: "medium",
  },
  {
    id: "word10",
    word: "friend",
    options: ["friend", "freind", "frend", "frind"],
    image: "https://source.unsplash.com/featured/?friends",
    sound: "https://example.com/sounds/friend.mp3", // Replace with actual URL
    difficulty: "medium",
  },
  {
    id: "word11",
    word: "beautiful",
    options: ["beautiful", "beutiful", "beautifull", "beautful"],
    image: "https://source.unsplash.com/featured/?beautiful",
    sound: "https://example.com/sounds/beautiful.mp3", // Replace with actual URL
    difficulty: "hard",
  },
  {
    id: "word12",
    word: "elephant",
    options: ["elephant", "elefant", "elephent", "elefent"],
    image: "https://source.unsplash.com/featured/?elephant",
    sound: "https://example.com/sounds/elephant.mp3", // Replace with actual URL
    difficulty: "hard",
  },
  {
    id: "word13",
    word: "dinosaur",
    options: ["dinosaur", "dinasaur", "dinasour", "dinosar"],
    image: "https://source.unsplash.com/featured/?dinosaur",
    sound: "https://example.com/sounds/dinosaur.mp3", // Replace with actual URL
    difficulty: "hard",
  },
  {
    id: "word14",
    word: "computer",
    options: ["computer", "computter", "computor", "compuder"],
    image: "https://source.unsplash.com/featured/?computer",
    sound: "https://example.com/sounds/computer.mp3", // Replace with actual URL
    difficulty: "hard",
  },
  {
    id: "word15",
    word: "chocolate",
    options: ["chocolate", "choclate", "chocolat", "choclet"],
    image: "https://source.unsplash.com/featured/?chocolate",
    sound: "https://example.com/sounds/chocolate.mp3", // Replace with actual URL
    difficulty: "hard",
  },
  {
    id: "word16",
    word: "extraordinary",
    options: ["extraordinary", "extrordinary", "extraodinary", "extrordnary"],
    image: "https://source.unsplash.com/featured/?extraordinary",
    sound: "https://example.com/sounds/extraordinary.mp3", // Replace with actual URL
    difficulty: "expert",
  },
  {
    id: "word17",
    word: "necessary",
    options: ["necessary", "necesary", "neccesary", "neccessary"],
    image: "https://source.unsplash.com/featured/?necessary",
    sound: "https://example.com/sounds/necessary.mp3", // Replace with actual URL
    difficulty: "expert",
  },
  {
    id: "word18",
    word: "definitely",
    options: ["definitely", "definately", "definetly", "defenetly"],
    image: "https://source.unsplash.com/featured/?definitely",
    sound: "https://example.com/sounds/definitely.mp3", // Replace with actual URL
    difficulty: "expert",
  },
  {
    id: "word19",
    word: "restaurant",
    options: ["restaurant", "restarant", "resturant", "restaraunt"],
    image: "https://source.unsplash.com/featured/?restaurant",
    sound: "https://example.com/sounds/restaurant.mp3", // Replace with actual URL
    difficulty: "expert",
  },
  {
    id: "word20",
    word: "pronunciation",
    options: ["pronunciation", "pronounciation", "pronuciation", "prononciation"],
    image: "https://source.unsplash.com/featured/?pronunciation",
    sound: "https://example.com/sounds/pronunciation.mp3", // Replace with actual URL
    difficulty: "expert",
  },
]

// Function to upload data to Firestore
async function uploadSpellingWords() {
  const batch = db.batch()
  const wordsCollection = db.collection("words")

  console.log("Starting upload of spelling words to Firebase...")

  for (const word of spellingWords) {
    const docRef = wordsCollection.doc(word.id)
    batch.set(docRef, word)
    console.log(`Added word: ${word.word}`)
  }

  try {
    await batch.commit()
    console.log("Successfully uploaded all spelling words to Firebase!")
  } catch (error) {
    console.error("Error uploading spelling words:", error)
  }
}

// Execute the upload
uploadSpellingWords()
  .then(() => {
    console.log("Upload process completed.")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Upload process failed:", error)
    process.exit(1)
  })

