import { describe, expect, test } from 'bun:test';
import { eventLocation, eventPlaceName } from './eventPlace';

describe('eventPlace', () => {
  test('names the place, the to-be-confirmed marker or nothing', () => {
    expect(eventPlaceName({ name: 'Templo' }, 'Por confirmar')).toBe('Templo');
    expect(eventPlaceName('tbc', 'Por confirmar')).toBe('Por confirmar');
    expect(eventPlaceName(undefined, 'Por confirmar')).toBe('');
  });

  test('gives calendar apps the name and address, never the marker', () => {
    expect(eventLocation({ name: 'Templo', address: 'Calle 1' })).toBe(
      'Templo, Calle 1'
    );
    expect(eventLocation({ name: 'Templo' })).toBe('Templo');
    expect(eventLocation('tbc')).toBe('');
    expect(eventLocation(undefined)).toBe('');
  });
});
