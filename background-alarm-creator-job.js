import {NativeModules} from 'react-native';

import Preferences from './preferences';
import RNCalendarEvents from 'react-native-calendar-events';

const ALARM_SET_TIME_HOURS = 2;
const ALARM_SET_TIME_MINUTES = 0;

const EARLIEST_EVENT_START_HOURS = 4;
const EARLIEST_EVENT_START_MINUTES = 0;

const LATEST_EVENT_START_HOURS = 9;
const LATEST_EVENT_START_MINUTES = 30;

function todayMidnightRelativeTime(hours, minutes) {
  let d = new Date();
  d.setHours(hours);
  d.setMinutes(minutes);
  d.setSeconds(0);
  d.setMilliseconds(0);
  return d;
}

export default class BackgroundAlarmCreatorJob {
  constructor() {
    this._started = false;
    this.alarmSetTime = todayMidnightRelativeTime(
        ALARM_SET_TIME_HOURS, ALARM_SET_TIME_MINUTES);
    this.earliestEventStart = todayMidnightRelativeTime(
        EARLIEST_EVENT_START_HOURS, EARLIEST_EVENT_START_MINUTES);
    this.latestEventStart = todayMidnightRelativeTime(
        LATEST_EVENT_START_HOURS, LATEST_EVENT_START_MINUTES);
  }

  _fetchCalendarEvents(config) {
    const todayMidnight = todayMidnightRelativeTime(0, 0);
    const tomorrowMidnight = todayMidnightRelativeTime(24, 0);
    const calendarIds = config.selectedCalendars.map(ev => ev.id);

    return RNCalendarEvents.authorizationStatus()
      .then(status => {
        if (status != 'authorized') {
          throw `Not authorized to access calendar: ${status}`;
        }
      })
      .then(() => {
        return RNCalendarEvents.fetchAllEvents(todayMidnight,
                                               tomorrowMidnight,
                                               calendarIds);
      });
  }

  _shouldRun(config, lastRunDate) {
    // Return true if enabled by config and if in the right time window.
    // (last run before 02:00 ALARM_SET_TIME_*, current time after)
    if (!config.enabled) {
      return [false, 'Skipping run: config not enabled'];
    }

    const now = new Date();
    const shouldRun = (lastRunDate < this.alarmSetTime && now >= this.alarmSetTime);
    if (!shouldRun) {
      const msg = `Skipping run: time criterion not satisfied: ` +
                  `lastRunDate: ${lastRunDate}, ` +
                  `alarmSetTime: ${this.alarmSetTime}, ` +
                  `now: ${now}`;
      return [false, msg];
    }

    return [true, 'Run allowed'];
  }

  _filterRelevantEvents(events) {
    return events.filter(ev => {
      return !ev.allDay &&
             ev.startDate >= this.earliestEventStart &&
             ev.startDate < this.latestEventStart;
    });
  }

  // Find the first event, return {start: Date, event: Event}
  _convertEventDates(events) {
    return events.map(ev => {
      ev.startDate = new Date(ev.startDate);
      ev.endDate = new Date(ev.endDate);
      return ev;
    });
  }

  // Find the first event by start date
  _findFirstEvent(events) {
    events.sort((lhs, rhs) => lhs.startDate - rhs.startDate);
    return events[0];
  }

  _createAlarm(event, preAlarmMinutes) {
    const alarmDate = new Date(event.startDate);
    alarmDate.setMinutes(event.startDate.getMinutes() - preAlarmMinutes);
    if (alarmDate < new Date()) {
      console.warn("Skipping alarm creation as alarm would be in the past: " +
                   `alarmDate: ${alarmDate}, ` +
                   `ev: ${JSON.stringify(event)}`);
      return;
    }

    const title = `CalAlarm: ${event.title}`;
    NativeModules.AlarmClock.schedule(title,
                                      alarmDate.getHours(),
                                      alarmDate.getMinutes());
    console.log(`Successfully created alarm at ${alarmDate.toISOString()} ` +
                `for event ${this._eventToString(event)}`);
  }

  _eventToString(ev1) {
    return `[${ev1.startDate.toISOString()} -- ${ev1.title}]`;
  }

  _logEvents(message, events) {
    const eventStrings = events.map(this._eventToString);
    console.log(`${message}\n  ${eventStrings.join('\n  ')}`);
  }

  _executeRun(config) {
    this._fetchCalendarEvents(config)
      .then(events => {
        events = this._convertEventDates(events);
        this._logEvents("All events:", events);
        events = this._filterRelevantEvents(events);
        this._logEvents("Events after filtering:", events);

        if (!events.length) {
          console.log("No calendar events for today - not creating alarms");
          return;
        }

        const firstEvent = this._findFirstEvent(events);
        this._createAlarm(firstEvent, config.preAlarmMinutes);

        Preferences.save('lastRun', new Date().toISOString());
      })
      .catch(error => {
        throw `Failed to fetch calendar events: ${error}`;
      });
  }

  _loadPreferences() {
    pConfig = Preferences.load('config');
    pLastRun = Preferences.load('lastRun')
      .then(dateStr => new Date(dateStr))
      .catch(error => {
        return todayMidnightRelativeTime(-24, 0);  // yesterday midnight
      });

    return Promise.all([pConfig, pLastRun]);
  }

  tryRun() {
    if (this._started) {
      throw "BackgroundAlarmCreatorJob may only be started once";
    }
    this._started = true;

    this._loadPreferences()
      .catch(error => {
        throw `Failed config load for scheduling alarms: ${error}`;
      })
      .then(values => {
        const [config, lastRun] = values;
        const [shouldRun, message] = this._shouldRun(config, lastRun)
        if (shouldRun) {
          this._executeRun(config);
        } else {
          console.log(message);
        }
      })
      .catch(error => {
        console.error(`Failed update run: ${error}`);
      });
  }
}

