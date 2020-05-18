import * as yup from 'yup';

export async function validateWithStrictAndCast<T>(
  schema: yup.Schema<T>,
  variable: Record<string, unknown> | undefined,
): Promise<T> {
  const result = await schema.validate(variable, { strict: true });
  return await schema.validate(result);
}
