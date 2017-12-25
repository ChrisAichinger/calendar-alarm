import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  Alert,
  Switch,
  TextInput,
  ScrollView,
  TimePickerAndroid
} from 'react-native';

import checkCalendarAndCreateAlarm from './alarm-creator';
import CalendarMultiSelect from './calendar-multi-select';
import DailyBackgroundJob from './daily-background-job';
import Preferences from './preferences';
import SettingsEntry from './settings-entry';
import { intToText, TimeOfDay } from './util';


const JOB_SCHEDULED_HOUR = 2;
const JOB_SCHEDULED_MINUTE = 0;

const DAILY_BG_JOB_KEY = "ALARM_CREATOR_JOB";
const DAILY_BG_JOB = new DailyBackgroundJob(DAILY_BG_JOB_KEY);
DAILY_BG_JOB.register(checkCalendarAndCreateAlarm);


export default class App extends Component<{}> {
  constructor(props) {
    super(props);
    this.state = {
      enabled: true,
      preAlarmMinutes: 45,
      selectedCalendars: [],
      earliestEventStartTODMinutes: new TimeOfDay(4, 0).toTotalMinutes(),
      latestEventStartTODMinutes: new TimeOfDay(9, 30).toTotalMinutes(),
    };
    Preferences.load('config')
      .then((data) => { this.setState(data); })
      .catch((error) => {
        console.warn('Failed to load config: ' + error);
      });
  }

  _updateBackgroundJobSchedule() {
    DAILY_BG_JOB.schedule({
      enabled: this.state.enabled,
      scheduledHour: JOB_SCHEDULED_HOUR,
      scheduledMinute: JOB_SCHEDULED_MINUTE,
    });
  }

  _onSavePress() {
    const [valid, message] = this._validateStateOk();
    if (!valid) {
      Alert.alert("Calendar Alarm", message);
      return;
    }
    console.log(`Saving config: ${JSON.stringify(this.state)}`);
    Preferences.save('config', this.state);
    this._updateBackgroundJobSchedule();
  }

  _onRunBackgroundPress() {
    DAILY_BG_JOB.runIfScheduled(checkCalendarAndCreateAlarm);
  }

  _onRunAlarmCreatorPress() {
    checkCalendarAndCreateAlarm();
  }

  _onClearPreferencesPress() {
    Preferences.clear();
  }

  _onPreAlarmChanged(text) {
    const filteredText = text.replace(/[^0-9]/g, '').substr(0, 5);
    this.setState({preAlarmMinutes: Number.parseInt(filteredText)});
  }

  _updateStateUsingTimepicker(key) {
    TimePickerAndroid.open(TimeOfDay.fromTotalMinutes(this.state[key]).toObject())
      .then(({action, hour, minute}) => {
        if (action !== TimePickerAndroid.dismissedAction) {
          this.setState({[key]: new TimeOfDay(hour, minute).toTotalMinutes()});
        }
      });
  }

  _onEarliestStartPress() {
    this._updateStateUsingTimepicker('earliestEventStartTODMinutes');
  }

  _onLatestStartPress() {
    this._updateStateUsingTimepicker('latestEventStartTODMinutes');
  }

  _formatTime(totalMinutes) {
    return TimeOfDay
      .fromTotalMinutes(totalMinutes)
      .toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  }

  _validateStateOk() {
    if (!this.state.enabled) {
      // No need to validate the other fields if the alarms are disabled.
      return [true, ""];
    }
    if (!this.state.preAlarmMinutes) {
      return [false, "Please enter an alarm time."];
    }
    if (this.state.selectedCalendars.length == 0) {
      return [false, "Please select at least one calendar"];
    }
    return [true, ''];
  }

  render() {
    return (
      <ScrollView style={styles.container}>
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
          value={intToText(this.state.preAlarmMinutes)}
        />
        <SettingsEntry
          title="Earliest event start time"
          value={this._formatTime(this.state.earliestEventStartTODMinutes)}
          onPress={() => this._onEarliestStartPress()}
        />
        <SettingsEntry
          title="Latest event start time"
          value={this._formatTime(this.state.latestEventStartTODMinutes)}
          onPress={() => this._onLatestStartPress()}
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
        <Button
          title="Run bg job"
          onPress={() => this._onRunBackgroundPress()}
        />
        <Button
          title="Run alarm creator"
          onPress={() => this._onRunAlarmCreatorPress()}
        />
        <Button
          title="Clear prefs"
          onPress={() => this._onClearPreferencesPress()}
        />
        <Text></Text>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
//    justifyContent: 'flex-start',
//    alignItems: 'stretch',
    backgroundColor: '#F5FCFF',
    padding: 10,
    paddingBottom: 20,
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
    textAlign: 'right',
  },
});
