import { describe, expect, test } from 'bun:test';
import { interpolateFaqAnswers } from './interpolateFaqAnswers';

describe('interpolateFaqAnswers', () => {
  test('fills the site placeholders in the answers only', () => {
    const result = interpolateFaqAnswers(
      [
        {
          question: 'Ends at {worshipEnd}?',
          answer: 'Near {worshipEnd}. {email}',
        },
      ],
      { worshipEnd: '12:00', email: 'a@b.org' }
    );
    expect(result).toEqual([
      { question: 'Ends at {worshipEnd}?', answer: 'Near 12:00. a@b.org' },
    ]);
  });

  test('an unknown placeholder stays visible', () => {
    const [faq] = interpolateFaqAnswers(
      [{ question: 'Q', answer: '{nope}' }],
      {}
    );
    expect(faq?.answer).toBe('{nope}');
  });
});
