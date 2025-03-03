import { SafeAreaView, StatusBar } from "react-native"
import SpellingGame from "../components/SpellingGame"

const SpellingGameScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <SpellingGame navigation={navigation} />
    </SafeAreaView>
  )
}

export default SpellingGameScreen

