import { add } from './math';

describe('add', () => {
  test('should work', () => {
    expect(add(1, 2)).toEqual(3);
  });
});
