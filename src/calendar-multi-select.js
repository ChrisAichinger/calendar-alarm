import React, { Component } from 'react';
import {
  ActivityIndicator,
  Text,
  View,
} from 'react-native';

import RNCalendarEvents from 'react-native-calendar-events';

import { MultiSelectList } from './settings-entry';
import { calendarStyles as styles } from './style';


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
            error: `Not authorized to access calendar (status ${status})`
          });
        }
      })
      .catch(error => {
        this.setState({
          error: `Could not check calendar permissions: ${error}`
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
          error: `Exception occurred during calendar loading: ${error}`
        });
      });
  }

  _inner2outer(o) { return {"name": o.label, "id": o.id} }
  _outer2inner(o) { return {"label": o.name, "id": o.id} }
  _cal2inner(o) {
    return {
      "id": o.id,
      "title": o.title,
      "extraText": `from ${o.source}`,
      "label": `${o.title}\n${o.source}`,
    };
  }

  _onSelectionsChange(sel) {
    if (this.props.onSelectionsChange) {
      this.props.onSelectionsChange(sel.map(this._inner2outer));
    }
  }

  _renderContent() {
    if (this.state.error !== null) {
      return (
          <Text style={[styles.error, this.props.errorStyle]}>
            Error: {this.state.error}
          </Text>
      );
    }

    if (this.state.calendars === null) {
      return (<ActivityIndicator />);
    }

    return (
        <MultiSelectList
          items={this.state.calendars.map(this._cal2inner)}
          selectedItems={this.props.selected.map(this._outer2inner)}
          onSelectionsChange={sel => this._onSelectionsChange(sel)}
          listStyle={this.props.listStyle}
          itemStyle={this.props.itemStyle}
          titleStyle={this.props.itemTitleStyle}
          extraTextStyle={this.props.itemExtraTextStyle}
        />
    );
  }

  render() {
    return (
      <View style={[styles.calenderMultiSelect, this.props.style]}>
        <Text style={[styles.titleText, this.props.titleStyle]}>
            {this.props.title}
        </Text>
        {this._renderContent()}
      </View>
    );
  }
}
