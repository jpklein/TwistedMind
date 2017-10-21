import React from 'react'
import { Button, StyleSheet, ScrollView, Text } from 'react-native'
import styles from '../Containers/Styles/DefaultScreenStyle'

class LearnScreen extends React.Component {
  render () {
    const { goBack } = this.props.navigation
    return (
      <ScrollView style={styles.container}>
        <Button
          onPress={() => goBack()}
          title='Back'
        />
        <Text style={styles.h2}>HOW TO PLAY</Text>
        <Text style={[css.txt, css.just]}>Each game includes 10 clues for you to solve. Each clue is a sentence that contains one or more consecutive ‘keywords’. We don’t tell you which words are the keywords, but we do tell you how many there are. By re-arranging all the letters in the keyword(s), you can make a <Text style={{fontWeight: 'bold', fontStyle: 'italic'}}>single-word</Text> anagram that solves the clue.</Text>
        <Text style={[css.txt, css.just, css.br]}>Here’s a simple clue with a single keyword:</Text>
        <Text style={[css.clue, css.br]}>The cast of the play includes several felines.</Text>
        <Text style={[css.txt, css.just, css.br]}>The answer is ‘cats’, which is an anagram of the keyword ‘cast’; and of course, 'cats' are 'felines'.</Text>
        <Text style={[css.txt, css.just, css.br]}>Now here’s a clue that is a little harder. It contains two keywords:</Text>
        <Text style={[css.clue, css.br]}>The rep said only good things about his products.</Text>
        <Text style={[css.txt, css.just, css.br]}>In this case, the answer is ‘praised’ – an anagram of the keywords ‘rep said’. It's the correct answer, because 'praise' means 'to say good things about'. </Text>
        <Text style={[css.txt, css.just, css.br]}>Note that keywords and answers may include proper names. For example:</Text>
        <Text style={[css.clue, css.br]}>The book told a tale set in this north-western city.</Text>
        <Text style={[css.txt, css.just, css.br]}>The answer – Seattle – is an anagram of ‘tale set’.</Text>
      </ScrollView>
    )
  }
}

const css = StyleSheet.create({
  txt: {
    fontSize: 18,
    // fontFamily: 'arial narrow',
    lineHeight: 22
  },
  just: {
    paddingTop: 10,
    textAlign: 'justify' // justify not supported on android
  },
  clue: {
    fontStyle: 'italic',
    fontWeight: 'bold',
    paddingLeft: 18,
    lineHeight: 28,
    color: 'blue'
  },
  br: {
    marginBottom: 18
  }
})

export default LearnScreen
