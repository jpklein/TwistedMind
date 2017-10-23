import React from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
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
    // @todo wraps cta in Button
    return (
      <ScrollView style={styles.container}>
        <View style={css.cards}>
          {this.games.map(game => {
            return (
              <View key={game.id} style={css.card}>
                <View style={css.txt}>
                  <Text>{game.category}</Text>
                  <Text style={styles.h1}>{game.label}</Text>
                  <Text>{game.level}</Text>
                </View>
                <View style={css.status}>
                  <Text style={css.cta}>{game.status}</Text>
                  <Text>{game.played}</Text>
                </View>
              </View>
            )
          })}
        </View>
      </ScrollView>
    )
  }
}

const css = StyleSheet.create({
  cards: {
    flex: 1,
    flexDirection: 'column'
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    marginBottom: 5
  },
  img: null,
  txt: {
    flex: 1
  },
  cta: null
})

export default SelectScreen
