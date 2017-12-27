import React, { Component } from 'react';
import {
  FlatList,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { settingsStyles as styles } from './style';


export class TextSetting extends React.Component {
  _onPress = () => {
    this.props.onPress(this.props.id);
  };

  render() {
    return (
      <TouchableOpacity onPress={this._onPress}>
        <View style={[styles.container, this.props.style]}>
          <Text style={[styles.titleText, this.props.titleStyle]}>
            {this.props.title}
          </Text>
          <Text style={[styles.valueText, this.props.valueStyle]}>
            {this.props.value}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
}


export class SwitchSetting extends React.Component {
  _onPress = value => {
    this.props.onPress(this.props.id, !this.props.value);
  };

  render() {
    return (
      <TouchableOpacity onPress={this._onPress}>
        <View style={[styles.switchSettingsItem, this.props.style]}>
          <View style={styles.settingsItemText}>
            <Text style={[styles.titleText, this.props.titleStyle]}>
              {this.props.title}
            </Text>
            <Text style={[styles.extraText, this.props.extraTextStyle]}>
              {this.props.extraText}
            </Text>
          </View>
          <Switch
            onValueChange={this._onPress}
            value={this.props.value}
          />
        </View>
      </TouchableOpacity>
    );
  }
}


export class MultiSelectList extends React.Component {
  constructor(props) {
    super(props);
    this._update();
  }

  _update() {
    this.items = new Map(this.props.items.map(it => [it.id, it]));
    this.selected = new Set(this.props.selectedItems.map(it => it.id));
  }

  _keyExtractor = (item, index) => item.id;

  _onPressItem = (id, value) => {
    const selected = new Set(this.selected);
    if (value) {
      selected.add(id);
    } else {
      selected.delete(id);
    }

    const selectedArray = Array.from(selected).map(k => this.items.get(k));
    this.props.onSelectionsChange(selectedArray);
  };

  _renderItem = (({item}) => {
    return (
      <SwitchSetting
        id={item.id}
        title={item.title}
        extraText={item.extraText}
        value={this.selected.has(item.id)}
        style={[styles.listEntryContainer, this.props.itemStyle]}
        titleStyle={[styles.listEntryTitle, this.props.titleStyle]}
        extraTextStyle={[styles.listEntryExtra, this.props.extraTextStyle]}
        onPress={(id, value) => this._onPressItem(id, value)}
      />
    );
  }
  );

  render() {
    this._update();
    return (
      <FlatList
        data={this.props.items}
        keyExtractor={this._keyExtractor}
        renderItem={this._renderItem}
        style={this.props.listStyle}
      />
    );
  }
}
