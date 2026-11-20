import { describe, expect, test } from 'bun:test';
import { interpolate, interpolateDeep } from './interpolate';

describe('interpolate', () => {
  test('fills every placeholder, repeated ones included', () => {
    expect(interpolate('{a} y {b} y {a}', { a: '1', b: '2' })).toBe(
      '1 y 2 y 1'
    );
  });

  test('a missing key stays visible', () => {
    expect(interpolate('Hola {name}, {missing}', { name: 'Ana' })).toBe(
      'Hola Ana, {missing}'
    );
  });

  test('leaves text without placeholders alone', () => {
    expect(interpolate('sin nada', { a: '1' })).toBe('sin nada');
  });

  test('does not read inherited object keys', () => {
    expect(interpolate('{toString}', {})).toBe('{toString}');
  });
});

describe('interpolateDeep', () => {
  test('walks objects and arrays and keeps other values', () => {
    expect(
      interpolateDeep(
        {
          a: 'x {v}',
          list: ['{v}', { b: '{w}' }],
          n: 3,
          flag: true,
          none: null,
        },
        { v: '1' }
      )
    ).toEqual({
      a: 'x 1',
      list: ['1', { b: '{w}' }],
      n: 3,
      flag: true,
      none: null,
    });
  });
});
