import { schema } from './output';

test('should have default', () => {
  expect(schema.default()).toBeDefined();
});

test('do not allow unknown properties', async () => {
  await expect(
    schema.validate({ foo: 'bar' }, { strict: true }),
  ).rejects.toThrow();
});
