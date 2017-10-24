import CryptoJS from 'crypto-js'
import PropTypes from 'prop-types'
import React from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import styles from './Styles/RoundedButtonStyles'
import ExamplesRegistry from '../Services/ExamplesRegistry'

// Note that this file (App/Components/RoundedButton) needs to be
// imported in your app somewhere, otherwise your component won't be
// compiled and added to the examples dev screen.

// Ignore in coverage report
/* istanbul ignore next */
ExamplesRegistry.addComponentExample('Select List Item', () =>
  <SelectListItem
    data={{
      id: 1,
      label: 'A very good place to start',
      category: 'beginner',
      level: 'junior',
      status: 'new',
      played: ''
    }}
    onPress={() => window.alert('Rounded Button Pressed!')}
  />
)

export default class SelectListItem extends React.Component {
  static propTypes = {
    data: PropTypes.object,
    onPress: PropTypes.func,
    navigator: PropTypes.object
  }

  // @todo formats select list text
  // getText () {
  //   const buttonText = this.props.text || ''
  //   return buttonText.toUpperCase()
  // }

  getGravitarUri (id) {
    const hash = CryptoJS.MD5(`game-${id}@twisted-mind.com`)
    return `https://www.gravatar.com/avatar/${hash}?d=identicon`
  }

  render () {
    const {
      id,
      label,
      category,
      level,
      status, // @todo renders CTA like app store
      played // @todo populates last played
    } = this.props.data
    return (
      <TouchableOpacity onPress={this.props.onPress} style={styles.button}>
        <View key={id} style={css.card}>
          <Image
            source={{uri: this.getGravitarUri(id)}}
            style={css.img}
          />
          <View style={css.txt}>
            <Text>{category}</Text>
            <Text style={styles.buttonText}>{label}</Text>
            <Text>{level}</Text>
          </View>
          <View style={css.status}>
            <Text style={css.cta}>{status}</Text>
            <Text>{played}</Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }
}

const css = StyleSheet.create({
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    marginBottom: 5
  },
  img: {
    width: 50,
    height: 50
  },
  txt: {
    flex: 1
  },
  cta: null
})
