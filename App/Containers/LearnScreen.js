import React from 'react'
import { Button, Text, View } from 'react-native'
import styles from '../Containers/Styles/DefaultScreenStyle'

class LearnScreen extends React.Component {
  render () {
    const { goBack } = this.props.navigation
    return (
      <View style={styles.container}>
        <Text>Learn</Text>
        <Button
          onPress={() => goBack()}
          title='Back'
        />
      </View>
    )
  }
}

export default LearnScreen
