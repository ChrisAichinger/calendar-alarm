import React, { Component } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
} from 'react-native';

export default class SettingsEntry extends React.Component {
  _onPress = () => {
    this.props.onPress(this.props.id);
  };

  render() {
    return (
      <TouchableOpacity onPress={this._onPress}>
        <View>
          <Text>
            {this.props.title}
          </Text>
          <Text>
            {this.props.value}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
}

