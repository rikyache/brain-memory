import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react-native';
import PressableScale from './PressableScale';
import { Text } from 'react-native';

// Мок звуков
jest.mock('../lib/sound', () => ({
  click: jest.fn(),
  play: jest.fn(),
}));

describe('PressableScale', () => {
  test('renders children correctly', () => {
    render(
      <PressableScale>
        <Text>Test Button</Text>
      </PressableScale>
    );
    
    expect(screen.getByText('Test Button')).toBeTruthy();
  });

  test('calls onPress when pressed', async () => {
    const onPressMock = jest.fn();
    
    render(
      <PressableScale onPress={onPressMock}>
        <Text>Press Me</Text>
      </PressableScale>
    );
    
    fireEvent.press(screen.getByText('Press Me'));
    
    // Ждем асинхронного вызова
    await waitFor(() => {
      expect(onPressMock).toHaveBeenCalled();
    });
  });

  test('is disabled when disabled prop is true', () => {
    const onPressMock = jest.fn();
    
    render(
      <PressableScale disabled={true} onPress={onPressMock}>
        <Text>Disabled Button</Text>
      </PressableScale>
    );
    
    fireEvent.press(screen.getByText('Disabled Button'));
    expect(onPressMock).not.toHaveBeenCalled();
  });
});