import React from 'react'
import { ScrollView, StyleSheet, TextInput, View } from 'react-native'
// import Icon from 'react-native-vector-icons/FontAwesome'

import Container from '../src/components/Container'
import Button from '../src/components/Button'
import Label from '../src/components/Label'

export default class Login extends React.Component {
  press () {
    // @todo Handles login actions
  }

  render () {
    return (
      <ScrollView style={styles.scroll}>
        <Container>
          {/* <Button
            label='Forgot Login/Pass'
            styles={{
              button: styles.alignRight,
              label: styles.label
            }}
            onPress={this.press.bind(this)}
          /> */}
        </Container>
        <Container>
          <Label text='Username or Email' />
          <TextInput
            autoCapitalize='none'
            autoFocus
            keyboardType='email-address'
            style={styles.textInput}
          />
        </Container>
        <Container>
          <Label text='Password' />
          <TextInput
            secureTextEntry
            style={styles.textInput}
          />
        </Container>
        <View style={styles.footer}>
          <Container>
            <Button
              label='Sign In'
              styles={{
                button: styles.primaryButton,
                label: styles.buttonWhiteText
              }}
              onPress={this.press.bind(this)}
            />
          </Container>
          <Container>
            <Button
              label='CANCEL'
              styles={{label: styles.buttonBlackText}}
              onPress={this.press.bind(this)}
            />
          </Container>
        </View>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: '#E1D7D8',
    padding: 30,
    flexDirection: 'column'
  },
  label: {
    color: '#0d8898',
    fontSize: 20
  },
  alignRight: {
    alignSelf: 'flex-end'
  },
  textInput: {
    height: 80,
    fontSize: 30,
    backgroundColor: '#fff'
  },
  buttonWhiteText: {
    fontSize: 20,
    color: '#fff'
  },
  buttonBlackText: {
    fontSize: 20,
    color: '#595856'
  },
  primaryButton: {
    backgroundColor: '#34A853'
  },
  footer: {
    marginTop: 100
  }
})
