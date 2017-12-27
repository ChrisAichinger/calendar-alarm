import React, { Component } from 'react';
import {
  Alert,
  Button,
  ScrollView,
  Text,
  TimePickerAndroid,
  View,
} from 'react-native';

import Prompt from 'rn-prompt';

import checkCalendarAndCreateAlarm from './alarm-creator';
import CalendarMultiSelect from './calendar-multi-select';
import DailyBackgroundJob from './daily-background-job';
import Preferences from './preferences';
import { TextSetting, SwitchSetting } from './settings-entry';
import { appStyles as styles } from './style';
import { intToText, TimeOfDay, formatTime, formatTimeDuration } from './util';


const JOB_SCHEDULED_HOUR = 2;
const JOB_SCHEDULED_MINUTE = 0;

const DAILY_BG_JOB_KEY = "ALARM_CREATOR_JOB";
const DAILY_BG_JOB = new DailyBackgroundJob(DAILY_BG_JOB_KEY);
DAILY_BG_JOB.register(checkCalendarAndCreateAlarm);


export default class App extends Component<{}> {
  constructor(props) {
    super(props);
    this.state = {
      debug: __DEV__,
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

  _onPreAlarmSubmitted(text) {
    const filteredText = text.replace(/[^0-9]/g, '').substr(0, 5);

    /* Activate debug mode by entering 5555 as pre-alarm duration. */
    if (filteredText == '5555') {
      this.setState({debug: true, promptVisible: false});
    } else {
      this.setState({
        promptVisible: false,
        preAlarmMinutes: Number.parseInt(filteredText),
      });
    }
  }

  _updateStateUsingTimepicker(key) {
    TimePickerAndroid
      .open(TimeOfDay.fromTotalMinutes(this.state[key]).toObject())
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

  _onDeactivateDebugPress() {
    this.setState({debug: false});
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
      return [false, "Please select at least one calendar."];
    }
    if (this.state.earliestEventStartTODMinutes >=
        this.state.latestEventStartTODMinutes)
    {
      return [false, "Earliest relevant appointment must be before " +
                     "latest relevant appointment."];
    }
    return [true, ''];
  }

  _renderDebug() {
    if (!this.state.debug) {
      return;
    }

    return (
      <View>
        <View style={styles.spacer}></View>
        <Text style={styles.headingText}>Debug Helpers</Text>
        <Button
          title="Run background job now"
          onPress={() => this._onRunBackgroundPress()}
        />
        <Button
          title="Run alarm creator"
          onPress={() => this._onRunAlarmCreatorPress()}
        />
        <Button
          title="Clear all preferences"
          onPress={() => this._onClearPreferencesPress()}
        />
        <Button
          title="Deactivate debug mode"
          onPress={() => this._onDeactivateDebugPress()}
        />
      </View>
    );
  }

  render() {
    return (
      <View style={styles.outerContainer}>
        <ScrollView style={styles.contentContainer}>
          <Text style={styles.headingText}>
            Calendar Alarm
          </Text>
          <Text style={styles.descriptionText}>
            Automatically schedules an alarm
            {' '}{formatTimeDuration(this.state.preAlarmMinutes)}{' '}
            before your first appointment of the day.
          </Text>
          <SwitchSetting
            title="Calendar Alarm enabled"
            value={this.state.enabled}
            onPress={(id, value) => this.setState({enabled: value})}
            style={styles.enabledSetting}
            titleStyle={styles.settingsTitle}
            extraTextStyle={styles.settingsExtraText}
          />
          <TextSetting
            title="Alarm time before first appointment"
            value={formatTimeDuration(this.state.preAlarmMinutes)}
            onPress={() => this.setState({promptVisible: true})}
            titleStyle={styles.settingsTitle}
            valueStyle={styles.settingsValue}
          />
          <TextSetting
            title="Earliest relevant appointment"
            value={formatTime(this.state.earliestEventStartTODMinutes)}
            onPress={() => this._onEarliestStartPress()}
            titleStyle={styles.settingsTitle}
            valueStyle={styles.settingsValue}
          />
          <TextSetting
            title="Latest relevant appointment"
            value={formatTime(this.state.latestEventStartTODMinutes)}
            onPress={() => this._onLatestStartPress()}
            titleStyle={styles.settingsTitle}
            valueStyle={styles.settingsValue}
          />
          <CalendarMultiSelect
            title="Activated calendars"
            selected={this.state.selectedCalendars}
            onSelectionsChange={sel => this.setState({selectedCalendars: sel})}
            style={styles.calendarContainer}
            titleStyle={styles.settingsTitle}
            errorStyle={styles.error}
            listStyle={styles.calendarList}
            itemStyle={styles.calendarEntryContainer}
            itemTitleStyle={styles.calendarEntryTitle}
            itemExtraTextStyle={styles.calendarEntrySource}
          />
          <View style={styles.spacer}></View>
          <Button
            title="Save"
            accessibilityLabel="Save settings and enable/disable the alarms"
            onPress={() => this._onSavePress()}
          />
          {this._renderDebug()}
          <View style={styles.spacer}></View>
          <View style={styles.spacer}></View>
        </ScrollView>
        <Prompt
            title="Alarm time before first appointment (min)"
            placeholder=""
            defaultValue={intToText(this.state.preAlarmMinutes)}
            textInputProps={{keyboardType: 'numeric'}}
            visible={this.state.promptVisible}
            onCancel={() => this.setState({promptVisible: false})}
            onSubmit={ (value) => {
               this._onPreAlarmSubmitted(value);
              }
            }
        />
      </View>
    );
  }
}
