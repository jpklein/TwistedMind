import React from 'react'
import { Text, View } from 'react-native'
import styles from '../Containers/Styles/DefaultScreenStyle'

class HomeScreen extends React.Component {
  static navigationOptions = { title: 'Home' }
  render () {
    // const { goBack } = this.props.navigation
    return (
      <View style={styles.container}>
        <Text style={styles.headerText}>Love anagrams?</Text>
        <Text style={styles.headerText}>Then you'll love</Text>
        <Text style={styles.headerText}>Twisted Mind</Text>
      </View>
    )
  }
}

export default HomeScreen
