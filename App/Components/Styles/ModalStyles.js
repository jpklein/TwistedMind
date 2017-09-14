import { StyleSheet } from 'react-native'
import { Colors, Metrics, Fonts } from '../../Themes/'

export default StyleSheet.create({
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
  },
  container: {
    justifyContent: 'center',
    marginVertical: Metrics.section
  },
  contentContainer: {
    alignSelf: 'center',
    alignItems: 'center'
  },
  message: {
    marginTop: Metrics.baseMargin,
    marginHorizontal: Metrics.baseMargin,
    textAlign: 'center',
    fontFamily: Fonts.type.base,
    fontSize: Fonts.size.regular,
    fontWeight: 'bold',
    color: Colors.steel
  },
  icon: {
    color: Colors.steel
  }
})
