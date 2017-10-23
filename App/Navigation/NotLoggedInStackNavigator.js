import { Platform, StatusBar } from 'react-native'
import { StackNavigator } from 'react-navigation'
import HomeScreen from '../Containers/HomeScreen'
import LearnScreen from '../Containers/LearnScreen'
import PlayScreen from '../Containers/PlayScreen'
import SelectScreen from '../Containers/SelectScreen'

// Manifest of possible screens
export default StackNavigator({
  HomeScreen: {
    screen: HomeScreen,
    navigationOptions: { header: null }
  },
  PlayScreen: {
    screen: PlayScreen,
    navigationOptions: { header: null }
  },
  SelectScreen: {
    screen: SelectScreen,
    navigationOptions: { title: 'MY GAMES' }
  },
  LearnScreen: {
    screen: LearnScreen,
    navigationOptions: { title: 'HOW TO PLAY' }
  }
  // LoginScreen: {
  //   screen: LoginScreen,
  //   navigationOptions: { title: 'Login' }
  // }
}, {
  // Default config for all screens
  cardStyle: {
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight
  },
  headerMode: 'screen',
  initialRouteName: 'HomeScreen'
})
