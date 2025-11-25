import React from 'react';
import { render, screen } from '@testing-library/react-native';
import CardMatchScreen from './CardMatchScreen';
import ProfileScreen from './ProfileScreen';
import AboutScreen from './AboutScreen';

// Общие моки
jest.mock('../lib/sound', () => ({
  click: jest.fn(),
  play: jest.fn(),
  match: jest.fn(),
  lose: jest.fn(),
  win: jest.fn(),
  wrong: jest.fn(),
  record: jest.fn()
}));

jest.mock('../lib/storage', () => ({
  saveJSON: jest.fn(),
  loadJSON: jest.fn(() => Promise.resolve(0)),
  removeKey: jest.fn(),
}));

jest.mock('../lib/stats', () => ({
  readAllBests: jest.fn(() => Promise.resolve({
    nm_best: 5,
    seq_best: 3,
    chimp_best: 7,
    vm_best: 10,
    cm_best: 8
  })),
  clearAllBests: jest.fn(),
}));

jest.mock('../lib/utils', () => ({
  randInt: jest.fn(),
  shuffle: jest.fn(arr => [...arr]),
  genNumberOfDigits: jest.fn(),
}));

describe('Card Match Screen', () => {
  test('renders card match game with initial state', () => {
    render(<CardMatchScreen />);
    
    expect(screen.getByText(/Карточек:/)).toBeTruthy();
    expect(screen.getByText(/Лучший личный счёт:/)).toBeTruthy();
  });

  test('displays player scores and turn indicator', () => {
    render(<CardMatchScreen />);
    
    expect(screen.getByText('P1: 0')).toBeTruthy();
    expect(screen.getByText('P2: 0')).toBeTruthy();
  });
});

describe('Profile Screen', () => {
  test('renders profile screen with statistics', async () => {
    render(<ProfileScreen />);
    
    // Используем более гибкие селекторы для поиска статистики
    expect(await screen.findByText(/Number Memory/)).toBeTruthy();
    expect(await screen.findByText(/Sequence Memory/)).toBeTruthy();
    expect(await screen.findByText(/Chimp Test/)).toBeTruthy();
    expect(await screen.findByText(/Verbal Memory/)).toBeTruthy();
    expect(await screen.findByText(/Card Match/)).toBeTruthy();
  });
});

describe('About Screen', () => {
  test('renders about screen with team information', () => {
    render(<AboutScreen />);
    
    expect(screen.getByText('О нас')).toBeTruthy();
    expect(screen.getByText(/Учебный проект по мобильной разработке/)).toBeTruthy();
  });
});