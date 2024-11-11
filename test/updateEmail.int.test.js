import retry from 'async-retry';

import UserRepository from '../src/uniqueConstraints';
import { createRandomUser, TestHelpers } from './testHelpers';

describe('When updating user email', () => {
  let testHelpers;
  let userRepo;

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
    testHelpers.trackIdForTeardown(user);
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

  it('should update the user email', async () => {
    // ARRANGE
    const user = createRandomUser();
    testHelpers.trackIdForTeardown(user);
    await userRepo.saveUser(user);
    const newEmail = `${user.email}_xyz`;

    await retry(
      async () => {
        // ACT
        await userRepo.updateEmail({
          id: user.id,
          oldEmail: user.email,
          newEmail,
        });

        // ASSERT
        const updatedUser = await userRepo.getUser(user.id);
        await expect(updatedUser.email).toEqual(newEmail);
      },
      { retries: 3 },
    );
  });

  describe('And the email is already in use', () => {
    it('should fail', async () => {
      // ARRANGE
      const firstUser = createRandomUser();
      await userRepo.saveUser(firstUser);
      testHelpers.trackIdForTeardown(firstUser);
      const inUseEmail = firstUser.email;
      const secondUser = createRandomUser();
      await userRepo.saveUser(secondUser);
      testHelpers.trackIdForTeardown(secondUser);

      await retry(
        async () => {
          // ACT
          const updateEmailAction = () =>
            userRepo.updateEmail({
              id: secondUser.id,
              oldEmail: secondUser.email,
              newEmail: inUseEmail,
            });

          // ASSERT
          await expect(updateEmailAction()).rejects.toThrow();
        },
        { retries: 3 },
      );
    });
  });
});
