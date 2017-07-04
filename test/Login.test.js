import React from 'react';
import { shallow } from 'enzyme';
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

it('renders two TextInput components', () => {
  const scrollView = shallow(<Login />);
  expect(wrapper.find(TextInput)).to.have.length(2);
});
