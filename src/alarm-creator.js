import {NativeModules} from 'react-native';
import RNCalendarEvents from 'react-native-calendar-events';

import Preferences from './preferences';
import { todayMidnightRelativeTime, TimeOfDay, formatTime } from './util';


export class AlarmCreator {
  constructor(config) {
    this.calendarIds = config.selectedCalendars.map(ev => ev.id);
    this.preAlarmMinutes = config.preAlarmMinutes;

    this.earliestEventStart = TimeOfDay
      .fromTotalMinutes(config.earliestEventStartTODMinutes)
      .toDate(new Date());
    this.latestEventStart = TimeOfDay
      .fromTotalMinutes(config.latestEventStartTODMinutes)
      .toDate(new Date());
  }

  _fetchCalendarEvents() {
    const todayMidnight = todayMidnightRelativeTime(0, 0);
    const tomorrowMidnight = todayMidnightRelativeTime(24, 0);

    return RNCalendarEvents.authorizationStatus()
      .then(status => {
        if (status != 'authorized') {
          throw `Not authorized to access calendar: ${status}`;
        }
      })
      .then(() => {
        return RNCalendarEvents.fetchAllEvents(todayMidnight,
                                               tomorrowMidnight,
                                               this.calendarIds);
      });
  }

  _filterRelevantEvents(events) {
    return events.filter(ev => {
      return !ev.allDay &&
             ev.startDate >= this.earliestEventStart &&
             ev.startDate <= this.latestEventStart;
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

    const eventStart = formatTime(TimeOfDay.fromDate(event.startDate));
    const title = `[${eventStart}] ${event.title} (Calendar Alarm)`;
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

  checkCalendarAndCreateAlarm() {
    this._fetchCalendarEvents()
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
        this._createAlarm(firstEvent, this.preAlarmMinutes);
      })
      .catch(error => {
        throw `Failed to fetch calendar events: ${error}`;
      });
  }
}

export default function checkCalendarAndCreateAlarm() {
  Preferences.load('config')
    .catch(error => {
      throw `Failed config load for alarm creation: ${error}`;
    })
    .then(config => {
      new AlarmCreator(config).checkCalendarAndCreateAlarm();
    })
    .catch(error => {
      console.error(`Failed update run: ${error}`);
    });
}
