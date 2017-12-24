import {NativeModules} from 'react-native';
import RNCalendarEvents from 'react-native-calendar-events';

import Preferences from './preferences';
import { todayMidnightRelativeTime } from './util';

const EARLIEST_EVENT_START_HOURS = 4;
const EARLIEST_EVENT_START_MINUTES = 0;

const LATEST_EVENT_START_HOURS = 9;
const LATEST_EVENT_START_MINUTES = 30;


export default class AlarmCreator {
  constructor() {
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

  _checkCalendarAndCreateAlarm(config) {
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
      })
      .catch(error => {
        throw `Failed to fetch calendar events: ${error}`;
      });
  }

  checkCalendarAndCreateAlarm() {
    Preferences.load('config')
      .catch(error => {
        throw `Failed config load for alarm creation: ${error}`;
      })
      .then(config => {
        this._checkCalendarAndCreateAlarm(config);
      })
      .catch(error => {
        console.error(`Failed update run: ${error}`);
      });
  }
}

