import SharedPreferences from 'react-native-shared-preferences';

export default class Preferences {
  static save(key, config) {
    SharedPreferences.setItem(key, JSON.stringify(config));
  }

  static load(key) {
    return new Promise(function(resolve, reject) {
      SharedPreferences.getItem(key, (value) => {
        if (value == '') {
          reject(`Preference '${key}' not present`);
        }
        resolve(JSON.parse(value));
      });
    });
  }

  static clear() {
    SharedPreferences.clear();
  }
};

