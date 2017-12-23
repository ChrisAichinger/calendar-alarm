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
      selected: []
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

    const items = this.state.calendars.map((cal) => {
      return {"value": cal.id, "label": `${cal.title} (${cal.source})`};
    });
    const onSelectionsChange = (selected) => {
      this.setState({"selected": selected});
    }
    return (
      <View style={styles.container}>
        <SelectMultiple
          items={items}
          selectedItems={this.state.selected}
          onSelectionsChange={onSelectionsChange} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  error: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  calendarlist: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
