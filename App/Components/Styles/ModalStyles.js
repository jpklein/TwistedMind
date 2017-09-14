import { StyleSheet } from 'react-native'
import { Colors, Metrics, Fonts } from '../../Themes/'

export default StyleSheet.create({
  // wrapper: {
  //   paddingTop: 50,
  //   flex: 1
  // },
  // container: {
  //   justifyContent: 'center',
  //   marginVertical: Metrics.section
  // },
  // contentContainer: {
  //   alignSelf: 'center',
  //   alignItems: 'center'
  // },
  // icon: {
  //   color: Colors.steel
  // },
  modal: {
    height: 300,
    width: 300,
    paddingVertical: Metrics.doubleBaseMargin,
    paddingHorizontal: Metrics.doubleBaseMargin
  },
  title: {
    textAlign: 'center',
    fontFamily: Fonts.type.bold,
    fontSize: Fonts.size.h3,
    color: Colors.charcoal
  },
  message: {
    marginTop: Metrics.baseMargin,
    marginHorizontal: Metrics.baseMargin,
    textAlign: 'center',
    fontSize: Fonts.size.regular,
    color: Colors.charcoal
  },
  btnWrapper: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  btn: {
    backgroundColor: '#3B5998',
    padding: 10
  }
})
