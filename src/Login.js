import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
// import Icon from 'react-native-vector-icons/FontAwesome';

import Container from '../src/components/Container';
import Button from '../src/components/Button';
import Label from '../src/components/Label';

import { connect } from 'react-redux';
import { loginRequest } from './actions/login.js';

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
    };
    this.isAttempting = false;
    this._login = this._login.bind(this);
  }

  _login() {
    let {username, password} = this.state;
    this.isAttempting = true;
    // attempt a login - a saga is listening to pick it up from here.
    this.props.dispatch(loginRequest({ username, password }));
  };

  render() {
    let {username, password} = this.state;
    // let {dispatch} = this.props;
    // let {formState, currentlySending, error} = this.props.data;

    return (
      <ScrollView style={styles.scroll}>
        <Container>
          {/* <Button
            label="Forgot Login/Pass"
            styles={{
              button: styles.alignRight,
              label: styles.label
            }}
            onPress={this.press.bind(this)}
          /> */}
        </Container>
        <Container>
          <Label text="Username or Email" />
          <TextInput ref='username'
            autoCapitalize='none'
            autoCorrect={false}
            autoFocus={true}
            keyboardType='email-address'
            onChangeText={(text) => this.setState({ username: text })}
            onSubmitEditing={() => this.refs.password.focus()}
            returnKeyType='next'
            style={styles.textInput}
            underlineColorAndroid='transparent'
          />
        </Container>
        <Container>
          <Label text="Password" />
          <TextInput ref='password'
            autoCapitalize='none'
            autoCorrect={false}
            onChangeText={(text) => this.setState({ password: text })}
            onSubmitEditing={() => this._login}
            returnKeyType='go'
            secureTextEntry={true}
            style={styles.textInput}
            underlineColorAndroid='transparent'
          />
        </Container>
        <View style={styles.footer}>
            <Container>
                <Button
                  label="Sign In"
                  onPress={() => this._login}
                  styles={{
                    button: styles.primaryButton,
                    label: styles.buttonWhiteText
                  }}
                />
            </Container>
            {/* <Container>
                <Button
                    label="CANCEL"
                    styles={{label: styles.buttonBlackText}}
                    onPress={this.press.bind(this)} />
            </Container> */}
        </View>
      </ScrollView>
    );
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
      backgroundColor: '#FFF'
  },
  buttonWhiteText: {
      fontSize: 20,
      color: '#FFF',
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
});

const mapStateToProps = (state) => {
  return { data: state };
}

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps)(Login);
