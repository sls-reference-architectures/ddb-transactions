import retry from 'async-retry';

import { saveUser, User } from '../src/uniqueConstraints';
import { createRandomUser, TestHelpers } from './testHelpers';

describe('When saving user', () => {
  let testHelpers: TestHelpers;

  beforeAll(() => {
    testHelpers = new TestHelpers();
  });

  afterAll(async () => {
    await testHelpers.teardown();
  });

  it('should succeed (baseline)', async () => {
    // ARRANGE
    const user = createRandomUser();

    // ACT
    const saveUserAction = () => saveUser(user);

    // ASSERT
    await expect(saveUserAction()).resolves.not.toThrow();
  });

  it('should save record in the database', async () => {
    // ARRANGE
    const user = createRandomUser();

    // ACT
    await saveUser(user);

    // ASSERT
    await retry(
      async () => {
        const userInDb = (await testHelpers.getUser(user.id)) as User;
        expect(userInDb.email).toEqual(user.email);
      },
      { retries: 3 },
    );
  });

  describe('and another user already is using the id', () => {
    it('should fail', async () => {
      // ARRANGE
      const { id } = await testHelpers.createRandomUserInDb();
      const user = createRandomUser({ id });

      // ACT
      const saveUserAction = () => saveUser(user);

      // ASSERT
      await expect(saveUserAction()).rejects.toThrow();
    });
  });

  describe('and another user already is using the userName', () => {
    it('should fail', async () => {
      // ARRANGE
      const originalUser = createRandomUser();
      await saveUser(originalUser);
      testHelpers.trackIdForTeardown(originalUser);
      const user = createRandomUser({ userName: originalUser.userName });

      // ACT
      const saveUserAction = () => saveUser(user);

      // ASSERT
      await expect(saveUserAction()).rejects.toThrow();
    });
  });
});
