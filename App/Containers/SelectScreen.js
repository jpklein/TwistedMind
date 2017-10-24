import React from 'react'
import { FlatList, StyleSheet } from 'react-native'
import ListItem from '../Components/SelectListItem'

export default class SelectScreen extends React.Component {
  // @todo populates games array from redux?
  games = [
    {
      id: 1,
      label: 'A very good place to start',
      category: 'beginner',
      level: 'junior',
      status: 'new',
      played: ''
    }
  ]

  render () {
    return (
      <FlatList
        style={css.cards}
        data={this.games}
        keyExtractor={(item, i) => i}
        renderItem={({ item }) => {
          return (
            <ListItem
              data={item}
              onPress={() => window.alert('Rounded Button Pressed!')}
            />
          )
        }}
      />
    )
  }
}

const css = StyleSheet.create({
  cards: {
    flex: 1,
    flexDirection: 'column'
  }
})
