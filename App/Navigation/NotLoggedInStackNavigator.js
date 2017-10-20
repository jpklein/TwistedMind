import { Platform, StatusBar } from 'react-native'
import { StackNavigator } from 'react-navigation'
import HomeScreen from '../Containers/HomeScreen'
import PlayScreen from '../Containers/PlayScreen'

// Manifest of possible screens
export default StackNavigator({
  HomeScreen: { screen: HomeScreen },
  PlayScreen: { screen: PlayScreen }
  // LoginScreen: {
  //   screen: LoginScreen,
  //   navigationOptions: { title: 'Login' }
  // }
}, {
  // Default config for all screens
  cardStyle: {
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight
  },
  headerMode: 'none',
  initialRouteName: 'HomeScreen'
})
