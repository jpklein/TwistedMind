import React, { PropTypes } from 'react'
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Keyboard,
  LayoutAnimation
} from 'react-native'
import Modal from 'react-native-modalbox'
import { connect } from 'react-redux'
import LoginActions from '../Redux/LoginRedux.js'
import styles from '../Containers/Styles/LoginScreenStyles.js'
import ModalActions from '../Redux/ModalRedux.js'
import { Images, Metrics } from '../Themes'

const styles2 = StyleSheet.create({
  wrapper: {
    paddingTop: 50,
    flex: 1
  },
  modal: {
    height: 300,
    width: 300
  },
  btn: {
    margin: 10,
    backgroundColor: '#3B5998',
    padding: 10
  },
  text: {
    color: 'black',
    fontSize: 22
  }
})

export class LoginScreen extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func,
    fetching: PropTypes.bool,
    attemptLogin: PropTypes.func
  }

  isAttempting = false
  keyboardDidShowListener = {}
  keyboardDidHideListener = {}

  constructor (props) {
    super(props)
    this.state = {
      username: 'info@twistedmind.com',
      password: 'pa55word',
      visibleHeight: Metrics.screenHeight,
      topLogo: { width: Metrics.screenWidth }
    }
    this.isAttempting = false
    this.modalWillOpen = false
  }

  componentWillReceiveProps (newProps) {
    this.forceUpdate()
    // Did the login attempt complete?
    if (this.isAttempting && !newProps.fetching) {
      this.props.navigation.goBack()
    }
  }

  componentWillMount () {
    // Using keyboardWillShow/Hide looks 1,000 times better, but doesn't work on Android
    // TODO: Revisit this if Android begins to support - https://github.com/facebook/react-native/issues/3468
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow)
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide)
  }

  componentDidUpdate () {
    if (this.modalWillOpen) {
      this.refs.modal.open()
    }
  }

  componentWillUnmount () {
    this.keyboardDidShowListener.remove()
    this.keyboardDidHideListener.remove()
  }

  keyboardDidShow = (e) => {
    // Animation types easeInEaseOut/linear/spring
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    let newSize = Metrics.screenHeight - e.endCoordinates.height
    this.setState({
      visibleHeight: newSize,
      topLogo: {width: 100, height: 70}
    })
  }

  keyboardDidHide = (e) => {
    // Animation types easeInEaseOut/linear/spring
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    this.setState({
      visibleHeight: Metrics.screenHeight,
      topLogo: {width: Metrics.screenWidth}
    })
  }

  handlePressLogin = () => {
    const { username, password } = this.state
    this.isAttempting = true
    this.props.attemptLogin(username, password)
  }

  handleDismissModal = () => {
    this.props.dismissModal()
    this.modalWillOpen = false
    this.refs.modal.close()
  }

  handleChangeUsername = (text) => {
    this.setState({ username: text })
  }

  handleChangePassword = (text) => {
    this.setState({ password: text })
  }

  render () {
    const { username, password } = this.state
    const { fetching } = this.props
    const editable = !fetching
    const textInputStyle = editable ? styles.textInput : styles.textInputReadonly
    if ('title' in this.props.alert) {
      this.modalWillOpen = true
    }
    return (
      <ScrollView contentContainerStyle={{justifyContent: 'center'}} style={[styles.container, {height: this.state.visibleHeight}]} keyboardShouldPersistTaps='always'>
        <Modal
          style={[styles2.modal, styles2.modal]}
          position={'center'}
          ref={'modal'}
          swipeToClose>
          <Text style={styles2.text}>{this.props.alert.title}</Text>
          <TouchableOpacity style={styles.loginButtonWrapper} onPress={this.handleDismissModal}>
            <View style={styles2.btn}>
              <Text style={styles.loginText}>OK!</Text>
            </View>
          </TouchableOpacity>
        </Modal>
        <Image source={Images.logo} style={[styles.topLogo, this.state.topLogo]} />
        <View style={styles.form}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Username</Text>
            <TextInput
              ref='username'
              style={textInputStyle}
              value={username}
              editable={editable}
              keyboardType='default'
              returnKeyType='next'
              autoCapitalize='none'
              autoCorrect={false}
              onChangeText={this.handleChangeUsername}
              underlineColorAndroid='transparent'
              onSubmitEditing={() => this.refs.password.focus()}
              placeholder='Username' />
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Password</Text>
            <TextInput
              ref='password'
              style={textInputStyle}
              value={password}
              editable={editable}
              keyboardType='default'
              returnKeyType='go'
              autoCapitalize='none'
              autoCorrect={false}
              secureTextEntry
              onChangeText={this.handleChangePassword}
              underlineColorAndroid='transparent'
              onSubmitEditing={this.handlePressLogin}
              placeholder='Password' />
          </View>

          <View style={[styles.loginRow]}>
            <TouchableOpacity style={styles.loginButtonWrapper} onPress={this.handlePressLogin}>
              <View style={styles.loginButton}>
                <Text style={styles.loginText}>Sign In</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.loginButtonWrapper} onPress={() => this.props.navigation.goBack()}>
              <View style={styles.loginButton}>
                <Text style={styles.loginText}>Cancel</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    )
  }
}

const mapStateToProps = state => ({
  fetching: state.login.fetching,
  alert: state.modal.data
})

const mapDispatchToProps = dispatch => ({
  attemptLogin: (username, password) => dispatch(LoginActions.loginRequest(username, password)),
  dismissModal: () => dispatch(ModalActions.hideModal())
})

export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen)
