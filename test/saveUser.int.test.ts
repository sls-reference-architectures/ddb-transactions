import { saveUser } from '../src/uniqueConstraints';
import { createRandomUser } from './testHelpers';

describe('When saving user', () => {
  it('should succeed (baseline)', async () => {
    // ARRANGE
    const user = createRandomUser();

    // ACT
    const saveUserAction = () => saveUser(user);

    // ASSERT
    await expect(saveUserAction()).resolves.not.toThrow();
  });
});
