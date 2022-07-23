import retry from 'async-retry';

import { saveUser, User } from '../src/uniqueConstraints';
import { createRandomUser, TestHelpers } from './testHelpers';

describe('When saving user', () => {
  let testHelpers: TestHelpers;

  beforeAll(() => {
    testHelpers = new TestHelpers();
  });

  afterAll(async () => {
    // teardown?
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
});
