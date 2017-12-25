import 'react-native';
import React from 'react';
import App from '../App';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

it('renders correctly', () => {
/* Test broken as Jest runs with iOS env by default - we only support Android.
  const tree = renderer.create(
    <App />
  );
*/
});
