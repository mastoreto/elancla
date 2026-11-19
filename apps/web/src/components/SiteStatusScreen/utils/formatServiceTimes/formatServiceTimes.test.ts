import { describe, expect, test } from 'bun:test';
import { formatServiceTimes } from './formatServiceTimes';

describe('formatServiceTimes', () => {
  test('localizes the weekday and keeps the hours', () => {
    expect(formatServiceTimes('Su 11:15-13:00', 'es')).toEqual({
      label: 'Domingo',
      value: '11:15 – 13:00',
    });
    expect(formatServiceTimes('Su 11:15-13:00', 'en').label).toBe('Sunday');
    expect(formatServiceTimes('We 19:30', 'pt')).toEqual({
      label: 'Quarta-feira',
      value: '19:30',
    });
  });

  test('keeps free text as it is', () => {
    expect(formatServiceTimes(' Domingos por la mañana ', 'es')).toEqual({
      label: null,
      value: 'Domingos por la mañana',
    });
  });
});
