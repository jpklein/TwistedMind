import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Login from '../src/Login';
// Imports Jest renderer after react-native
import renderer from 'react-test-renderer';

it('renders without crashing', () => {
  const rendered = renderer.create(<Login />).toJSON();
  expect(rendered).toBeTruthy();
});

it('renders default messages', () => {
  const rendered = renderer.create(<Login />).toJSON();
  expect(rendered).toMatchSnapshot();
});
