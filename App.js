import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  Alert
} from 'react-native';

import {NativeModules} from 'react-native';

import CalendarMultiSelect from './calendar-multi-select';

export default class App extends Component<{}> {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      calendars: null,
      selected: []
    };
  }

  _onSetAlarmPress() {
    NativeModules.AlarmClock.schedule('Awesome', 8, 32);
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to Calendar Alarm!
        </Text>
        <CalendarMultiSelect />
        <Button
          onPress={this._onSetAlarmPress}
          title="Set Alarm"
          accessibilityLabel="Set a new Android alarm."
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  error: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  calendarlist: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
