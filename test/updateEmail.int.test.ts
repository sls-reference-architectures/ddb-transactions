import retry from 'async-retry';

import UserRepository from '../src/uniqueConstraints';
import { createRandomUser, TestHelpers } from './testHelpers';

describe('When updating user email', () => {
  let testHelpers: TestHelpers;
  let userRepo: UserRepository;

  beforeAll(() => {
    userRepo = new UserRepository();
    testHelpers = new TestHelpers();
  });

  afterAll(async () => {
    await testHelpers.teardown();
  });

  it('should succeed (baseline)', async () => {
    // ARRANGE
    const user = createRandomUser();
    testHelpers.trackIdForTeardown(user.id);
    await userRepo.saveUser(user);

    await retry(
      async () => {
        // ACT
        const updateEmailAction = () =>
          userRepo.updateEmail({
            id: user.id,
            oldEmail: user.email,
            newEmail: `${user.email}_xyz`,
          });

        // ASSERT
        await expect(updateEmailAction()).resolves.not.toThrow();
      },
      { retries: 3 },
    );
  });
});
