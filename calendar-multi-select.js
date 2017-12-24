import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator
} from 'react-native';

import RNCalendarEvents from 'react-native-calendar-events';
import SelectMultiple from 'react-native-select-multiple';

export default class CalendarMultiSelect extends Component<{}> {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      calendars: null,
    };

    RNCalendarEvents.authorizationStatus()
      .then(status => {
        if (status == 'authorized') {
          this.loadCalendars();
        } else {
          this.setState({
            error: `Not authorized to access calendar (status {status})`
          });
        }
      })
      .catch(error => {
        this.setState({
          error: `Exception occurred during calendar permission checking: {error}`
        });
      });
  }

  loadCalendars() {
    RNCalendarEvents.findCalendars()
      .then(calendars => {
        this.setState({error: null, calendars: calendars});
      })
      .catch(error => {
        this.setState({
          error: `Exception occurred during calendar loading: {error}`
        });
      });
  }

  render() {
    if (this.state.error !== null) {
      return (
        <View style={styles.container}>
          <Text style={styles.error}>
            Error: {this.state.error}
          </Text>
        </View>
      );
    }

    if (this.state.calendars === null) {
      return (
        <View style={styles.container}>
          <ActivityIndicator />
        </View>
      );
    }

    const inner2outer = (o => { return {"name": o.label, "id": o.value} });
    const outer2inner = (o => { return {"label": o.name, "value": o.id} });
    const cal2inner = (o => { return {"value": o.id,
                                      "label": `${o.title} (${o.source})`} });

    const onSelectionsChange = (sel) => {
      if (this.props.onSelectionChange) {
        this.props.onSelectionChange(sel.map(inner2outer));
      }
    }
    return (
      <View style={styles.container}>
        <SelectMultiple
          items={this.state.calendars.map(cal2inner)}
          selectedItems={this.props.selected.map(outer2inner)}
          onSelectionsChange={onSelectionsChange} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    minHeight: 150,
    paddingBottom: 10,
  },
  error: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
});
