import { Platform, StatusBar } from 'react-native'
import { StackNavigator } from 'react-navigation'
import HomeScreen from '../Containers/HomeScreen'
import LoginScreen from '../Containers/LoginScreen'

// Manifest of possible screens
export default StackNavigator({
  HomeScreen: { screen: HomeScreen },
  LoginScreen: {
    screen: LoginScreen,
    navigationOptions: { title: 'Login' }
  }
}, {
  // Default config for all screens
  cardStyle: {
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight
  },
  headerMode: 'none',
  initialRouteName: 'HomeScreen'
})
