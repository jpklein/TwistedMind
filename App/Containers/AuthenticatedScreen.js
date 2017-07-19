import React from 'react'
import { connect } from 'react-redux'
import { View, Text } from 'react-native'
import RoundedButton from '../Components/RoundedButton'
import styles from './Styles/AuthenticatedScreenStyle'
import LoginActions from '../Redux/LoginRedux'
import { EventEmitter } from 'events'
import { runSaga } from 'redux-saga'
import { take, call } from 'redux-saga/effects'
import { countdownSubscribe } from '../Sagas/example'

class AuthenticatedScreen extends React.Component {
  constructor (props) {
    super(props)
    this.state = { exampleText: 'You are logged in' }
    this.emitter = new EventEmitter()
    this.handleOnPress = this.handleOnPress.bind(this)
  }

  bindSaga (emitter, resolver) {
    return {
      getState: resolver,
      subscribe: (callback) => {
        emitter.on('action', callback)
        return () => { emitter.removeListener('action', callback) }
      },
      dispatch: (output) => {
        emitter.emit('action', output)
      }
    }
  }

  * handleOnPress () {
    const { navigate } = this.props.navigation
    const channel = yield call(countdownSubscribe, 4)
    let seconds
    try {
      while (true) {
        // take(END) causes the saga to jump to the finally block
        seconds = yield take(channel)
        this.setState({ exampleText: `countdown: ${seconds}` })
      }
    } catch (e) {
      return navigate('AnotherAuthenticatedScreen')
    }
  }

  render () {
    return (
      <View style={styles.container}>
        <Text style={styles.headerText}>{this.state.exampleText}</Text>
        <RoundedButton
          text='Go to Another Authenticated Screen'
          onPress={runSaga(this.handleOnPress(), this.bindSaga(this.emitter, () => this.state))}
        />
        <RoundedButton text='Logout' onPress={this.props.logout} />
      </View>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    logout: () => dispatch(LoginActions.logout())
  }
}

export default connect(null, mapDispatchToProps)(AuthenticatedScreen)
