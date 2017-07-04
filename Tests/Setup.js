jest
.mock('react-native-device-info', () => {
  return { isTablet: jest.fn(() => { return false }) }
})
// @see https://github.com/facebook/jest/issues/3707
.mock('TextInput', () => {
  const RealComponent = require.requireActual('TextInput')
  const React = require('React')
  class TextInput extends React.Component {
    render() {
      delete this.props.autoFocus;
      return React.createElement('TextInput', this.props, this.props.children)
    }
  }
  TextInput.propTypes = RealComponent.propTypes
  return TextInput
})
