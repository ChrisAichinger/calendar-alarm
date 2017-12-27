import {
  StyleSheet,
} from 'react-native';

const debugBoxModel = {
//  borderWidth: 1,
//  borderColor: 'red',
};

const textStyle = {
  fontSize: 15,
  color: '#202020',
};

export const settingsStyles = StyleSheet.create({
  switchSettingsItem: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    alignItems: 'center',

    paddingTop: 5,
    paddingBottom: 5,

    borderBottomWidth: 1,
    borderColor: '#dcdcdc',
  },
  titleText: {
  },
  extraText: {
    marginLeft: 10,
  },
  valueText: {
    marginLeft: 10,
  },
  listEntryTitle: {
  },
  listEntryExtra: {
    marginLeft: 5,
  },
  container: {
    paddingTop: 5,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderColor: '#dcdcdc',
  },
});

export const calendarStyles = StyleSheet.create({
  calenderMultiSelect: {
    justifyContent: 'center',
    alignItems: 'stretch',
    paddingTop: 5,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderColor: '#dcdcdc',
  },
  titleText: {
  },
});

export const appStyles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 10,
  },
  spacer: {
    height: 10,
  },
  headingText: {
    ...textStyle,
    fontSize: 20,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 5,
  },
  descriptionText: {
    ...textStyle,
    paddingBottom: 10,
    textAlign: 'center',
  },
  calendarContainer: {
    borderBottomWidth: 0,
  },
  calendarList: {
    marginLeft: 10,
  },
  calendarEntryContainer: {
    borderBottomWidth: 1,
    borderColor: '#ecf0f0',
  },
  calendarEntryTitle: {
    ...textStyle,
    ...debugBoxModel,
  },
  calendarEntrySource: {
    ...textStyle,
    ...debugBoxModel,
    fontStyle: 'italic',
  },
  enabledSetting: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  settingsTitle: {
    ...textStyle,
    ...debugBoxModel,
    fontWeight: 'bold',
  },
  settingsExtraText: {
    ...textStyle,
    height: 0,  // Hide, not used for enable/disable switch
  },
  settingsValue: {
    ...textStyle,
    ...debugBoxModel,
  },
  error: {
    ...textStyle,
    ...debugBoxModel,
    backgroundColor: 'red',
  },
});
