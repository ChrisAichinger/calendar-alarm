import { TimeOfDay } from '../src/util';

it('constructs from "1:00"', () => {
  expect(TimeOfDay.fromString("1:00")._minutes).toEqual(60);
});

it('constructs from "2:00"', () => {
  expect(TimeOfDay.fromString("2:00")._minutes).toEqual(120);
});

it('throws when constructed from "abcd"', () => {
  expect(() => TimeOfDay.fromString("abcd")).toThrow();
});

it('constructs from "2:30"', () => {
  expect(TimeOfDay.fromString("2:30")._minutes).toEqual(150);
});

it('throws when constructed from "111:00"', () => {
  expect(() => TimeOfDay.fromString("111:00")).toThrow();
});

it('throws when constructed from "24:00"', () => {
  expect(() => TimeOfDay.fromString("24:00")).toThrow();
});

it('constructs from 12, 30', () => {
  expect(new TimeOfDay(12, 30)._minutes).toEqual(12*60 + 30);
});

it('throws when constructed without arguments', () => {
  expect(() => new TimeOfDay()).toThrow();
});

it('has working toTotalMinutes()', () => {
  expect(new TimeOfDay(2, 15).toTotalMinutes()).toEqual(2*60 + 15);
});

it('has working fromTotalMinutes()', () => {
  expect(TimeOfDay.fromTotalMinutes(138)._minutes).toEqual(138);
});

it('throws when fromTotalMinutes(60*24) is called', () => {
  expect(() => TimeOfDay.fromTotalMinutes(60*24)).toThrow();
});

it('constructs from {hour:12,minute:30}', () => {
  expect(new TimeOfDay({hour:12,minute:30})._minutes).toEqual(12*60 + 30);
});

it('has working toObject()', () => {
  expect(new TimeOfDay(2, 15).toObject()).toEqual({hour: 2, minute: 15});
});

it('has working toLocaleTimeString()', () => {
  expect(new TimeOfDay(2, 15).toLocaleTimeString())
    .toEqual(new Date(2017, 1, 1, 2, 15, 0, 0).toLocaleTimeString());
});

it('has working toDate()', () => {
  expect(new TimeOfDay(2, 15).toDate(new Date(2017, 3, 14, 21, 30, 3, 8)))
    .toEqual(new Date(2017, 3, 14, 2, 15, 0, 0));
});

