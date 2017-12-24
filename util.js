export function todayMidnightRelativeTime(hours, minutes) {
  let d = new Date();
  d.setHours(hours);
  d.setMinutes(minutes);
  d.setSeconds(0);
  d.setMilliseconds(0);
  return d;
}
