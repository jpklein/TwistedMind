import PropTypes from 'prop-types'
import React from 'react'
import {
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
import ScreenCss from '../Containers/Styles/LoginScreenStyles.js'
import ModalActions from '../Redux/ModalRedux.js'
import ModalCss from '../Components/Styles/ModalStyles.js'
import { Images, Metrics } from '../Themes'

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
    const textInputStyle = editable ? ScreenCss.textInput : ScreenCss.textInputReadonly
    if (this.props.modal) {
      this.modalWillOpen = true
    }
    return (
      <ScrollView contentContainerStyle={{justifyContent: 'center'}} style={[ScreenCss.container, {height: this.state.visibleHeight}]} keyboardShouldPersistTaps='always'>

        {this.modalWillOpen && <Modal
          style={ModalCss.modal}
          position={'center'}
          ref={'modal'}
          swipeToClose>
          <Text style={ModalCss.title}>{this.props.modal.title}</Text>
          <Text style={ModalCss.message}>{this.props.modal.text}</Text>
          <TouchableOpacity style={ModalCss.btnWrapper} onPress={this.handleDismissModal}>
            <View style={ModalCss.btn}>
              <Text style={ScreenCss.loginText}>{this.props.modal.dismiss}</Text>
            </View>
          </TouchableOpacity>
        </Modal>}

        <Image source={Images.logo} style={[ScreenCss.topLogo, this.state.topLogo]} />
        <View style={ScreenCss.form}>
          <View style={ScreenCss.row}>
            <Text style={ScreenCss.rowLabel}>Username</Text>
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

          <View style={ScreenCss.row}>
            <Text style={ScreenCss.rowLabel}>Password</Text>
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

          <View style={[ScreenCss.loginRow]}>
            <TouchableOpacity style={ScreenCss.loginButtonWrapper} onPress={this.handlePressLogin}>
              <View style={ScreenCss.loginButton}>
                <Text style={ScreenCss.loginText}>Sign In</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={ScreenCss.loginButtonWrapper} onPress={() => this.props.navigation.goBack()}>
              <View style={ScreenCss.loginButton}>
                <Text style={ScreenCss.loginText}>Cancel</Text>
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
  modal: state.modal['curr'] ? state.modal.msgs[state.modal.curr] : null
})

const mapDispatchToProps = dispatch => ({
  attemptLogin: (username, password) => dispatch(LoginActions.loginRequest(username, password)),
  dismissModal: () => dispatch(ModalActions.hideModal())
})

export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen)
