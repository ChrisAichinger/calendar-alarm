import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  Alert,
  Switch,
  TextInput
} from 'react-native';

import BackgroundWorker from './background-worker';
import CalendarMultiSelect from './calendar-multi-select';
import Preferences from './preferences';


export default class App extends Component<{}> {
  constructor(props) {
    super(props);
    this.state = {
      enabled: true,
      preAlarmMinutes: '45',
      selectedCalendars: [],
    };
    Preferences.load('config')
      .then((data) => { this.setState(data); })
      .catch((error) => {
        console.warn('Failed to load config: ' + error);
      });
  }

  componentDidMount() {
    BackgroundWorker.updateJob(true);
  }

  _onSavePress() {
    const [valid, message] = this._validateStateOk();
    if (!valid) {
      Alert.alert("Calendar Alarm", message);
      return;
    }
    console.log(`Saving config: ${JSON.stringify(this.state)}`);
    Preferences.save('config', this.state);
  }

  _onRunBackgroundPress() {
    new BackgroundAlarmCreatorJob().tryRun();
  }

  _onClearPreferencesPress() {
    Preferences.clear();
  }

  _onPreAlarmChanged(text) {
    const filteredText = text.replace(/[^0-9]/g, '');
    this.setState({preAlarmMinutes: filteredText});
  }

  _validateStateOk() {
    if (!this.state.enabled) {
      // No need to validate the other fields if the alarms are disabled.
      return [true, ""];
    }
    if (this.state.preAlarmMinutes.length == 0) {
      return [false, "Please enter an alarm time."];
    }
    if (this.state.preAlarmMinutes.search(/[^0-9]/) != -1) {
      return [false, "Please enter a valid alarm time."];
    }
    if (this.state.selectedCalendars.length == 0) {
      return [false, "Please select at least one calendar"];
    }
    return [true, ''];
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Setup Calendar Alarm
        </Text>
        <View style={styles.settingsItem}>
          <Text style={styles.heading}>
            Calendar Alarm enabled
          </Text>
          <Switch
            onValueChange={value => this.setState({enabled: value})}
            value={this.state.enabled}
          />
        </View>
        <Text style={styles.heading}>
          Set alarm X minutes before first appointment
        </Text>
        <TextInput
          style={styles.textinput}
          placeholder="Enter pre-alarm duration (min)"
          keyboardType = 'numeric'
          onChangeText = {text => this._onPreAlarmChanged(text)}
          value={this.state.preAlarmMinutes}
        />
        <Text style={styles.heading}>
          Activated calendars
        </Text>
        <CalendarMultiSelect
          selected={this.state.selectedCalendars}
          onSelectionChange={sel => this.setState({selectedCalendars: sel})}
        />
        <Button
          title="Save"
          accessibilityLabel="Save settings and enable/disable the alarms"
          onPress={() => this._onSavePress()}
        />
        <View style={styles.debugcontainer}>
          <Button
            title="Run bg job"
            onPress={() => this._onRunBackgroundPress()}
          />
          <Button
            title="Clear prefs"
            onPress={() => this._onClearPreferencesPress()}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: '#F5FCFF',
    padding: 10,
  },
  debugcontainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  heading: {
    textAlign: 'left',
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  settingsItem: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  textinput: {
    height: 40,
  },
});
