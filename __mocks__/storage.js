// src/__mocks__/storage.js
export const saveJSON = jest.fn();
export const loadJSON = jest.fn(() => Promise.resolve(null));
export const removeKey = jest.fn();