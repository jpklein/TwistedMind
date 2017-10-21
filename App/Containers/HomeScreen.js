import React from 'react'
import { Button, Text, View } from 'react-native'
import styles from '../Containers/Styles/DefaultScreenStyle'

class HomeScreen extends React.Component {
  static navigationOptions = { title: 'Home' }
  render () {
    const { navigate } = this.props.navigation
    return (
      <View style={styles.container}>
        <Text style={styles.headerText}>Love anagrams?</Text>
        <Text style={styles.headerText}>Then you'll love</Text>
        <Text style={styles.headerText}>Twisted Mind</Text>
        <Button
          onPress={() => navigate('PlayScreen')}
          title='Continue last game'
        />
        <Button
          onPress={() => navigate('SelectScreen')}
          title='Select a different game'
        />
        <Button
          onPress={() => navigate('LearnScreen')}
          title='How to play'
        />
      </View>
    )
  }
}

export default HomeScreen
