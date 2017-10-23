import React from 'react'
import { ScrollView } from 'react-native'
import styles from '../Containers/Styles/DefaultScreenStyle'

class SelectScreen extends React.Component {
  // @todo populates games array from state?
  games = [
    {
      id: 1, // @todo populates id chip background using gravatar
      label: 'A very good place to start',
      category: 'beginner',
      level: 'junior',
      status: 'new', // @todo displays status CTA like app store
      played: '' // @todo populates last played
    }
  ]

  render () {
    return (
      <ScrollView style={styles.container}>
        <Text>{JSON.stringify(this.games[0])}</Text>
      </ScrollView>
    )
    )
  }
}

export default SelectScreen
