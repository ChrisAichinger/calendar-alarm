export function todayMidnightRelativeTime(hours, minutes) {
  let d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d;
}


export function intToText(number) {
  if (Number.isNaN(number)) {
    return '';
  }
  return number.toString();
}


/** Format time according to the user's locale
 *
 * Time can be represented either as TimeOfDay object or as total minutes since
 * midnight.
 */
export function formatTime(time) {
  if (!(time instanceof TimeOfDay)) {
    time = TimeOfDay.fromTotalMinutes(time)
  }

  const options = {hour: '2-digit', minute:'2-digit'};
  return time.toLocaleTimeString([], options).replace(/(\d+:\d+):00/, '$1');
}


export function formatTimeDuration(totalMinutes) {
  const format = (value, unit) => {
    const s = (value == 1 ? '' : 's');
    return `${value} ${unit}${s}`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  let result = [];
  if (hours) {
    result.push(format(hours, 'hour'));
  }
  if (minutes || !hours) {
    result.push(format(minutes, 'minute'));
  }
  return result.join(' ');
}


/** Represents a time of day with minute precision
 *
 * Multiple constructors are supported:
 *
 *     new TimeOfDay("13:45")
 *     new TimeOfDay(13, 45)
 *     new TimeOfDay({hour: 13, minute: 45})
 *
 * Valid value range is from 00:00 to 23:59, and is enforced.
 */
export class TimeOfDay {
  constructor(arg1, arg2) {
    if (typeof arg1 == 'object' && arg2 === undefined) {
      this._initialize(arg1.hour, arg1.minute);
    }
    else if (typeof arg1 == 'number' && typeof arg2 == 'number') {
      this._initialize(arg1, arg2);
    }
    else {
      throw `Invalid arguments for TimeOfDay constructor: ${arg1}, ${arg2}`;
    }
  }

  /** Convert to total number of minutes since midnight */
  toTotalMinutes() {
    return this._minutes;
  }

  /** Convert to a {hour: h, minute: m} object */
  toObject() {
    return { hour: Math.floor(this._minutes/60), minute: this._minutes%60 };
  }

  /** Convert to localized time string */
  toLocaleTimeString(locales, options) {
    return this.toDate(new Date()).toLocaleTimeString(locales, options);
  }

  /** Convert to a Date object by combining with the date part of day */
  toDate(day) {
    let date = new Date(day);
    date.setHours(Math.floor(this._minutes/60), this._minutes%60, 0, 0);
    return date;
  }

  /** Create from total number of minutes since midnight */
  static fromTotalMinutes(minutes) {
    let tod = new TimeOfDay(0, 0);
    tod._initialize(0, minutes);
    return tod;
  }

  /** Create from time string "HH:MM" (12-hour mode AM/PM not supported) */
  static fromString(str) {
    const m = str.match(/^(\d+):(\d+)$/);
    if (m === null) {
      throw `Can not construct TimeOfDay from string '${str}'`;
    }
    return new TimeOfDay(Number.parseInt(m[1]), Number.parseInt(m[2]));
  }

  /** Create from a Date object */
  static fromDate(date) {
    return new TimeOfDay(date.getHours(), date.getMinutes());
  }

  _initialize(hours, minutes) {
    this._minutes = 60 * hours + minutes;
    if (this._minutes < 0 || this._minutes >= 60 * 24) {
      throw `Can not construct TimeOfDay with time outside of 00:00-23:59; ` +
            `minutes = ${this._minutes}`;
    }
  }
}
