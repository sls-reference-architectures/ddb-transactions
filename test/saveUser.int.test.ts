import retry from 'async-retry';
import { User } from '../src/models';

import UserRepository from '../src/uniqueConstraints';
import { createRandomUser, TestHelpers } from './testHelpers';

describe('When saving user', () => {
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
    testHelpers.trackIdForTeardown(user);

    // ACT
    const saveUserAction = () => userRepo.saveUser(user);

    // ASSERT
    await expect(saveUserAction()).resolves.not.toThrow();
  });

  it('should save record in the database', async () => {
    // ARRANGE
    const user = createRandomUser();

    // ACT
    await userRepo.saveUser(user);
    testHelpers.trackIdForTeardown(user);

    // ASSERT
    await retry(
      async () => {
        const userInDb = (await userRepo.getUser(user.id)) as User;
        expect(userInDb.email).toEqual(user.email);
      },
      { retries: 3 },
    );
  });

  describe('and another user already is using the id', () => {
    it('should fail', async () => {
      // ARRANGE
      const firstUser = createRandomUser();
      await userRepo.saveUser(firstUser);
      testHelpers.trackIdForTeardown(firstUser);
      const secondUser = createRandomUser({ id: firstUser.id });

      // ACT
      const saveUserAction = () => userRepo.saveUser(secondUser);

      // ASSERT
      await expect(saveUserAction()).rejects.toThrow();
    });
  });

  describe('and another user already is using the userName', () => {
    it('should fail', async () => {
      // ARRANGE
      const firstUser = createRandomUser();
      await userRepo.saveUser(firstUser);
      testHelpers.trackIdForTeardown(firstUser);
      const secondUser = createRandomUser({ userName: firstUser.userName });

      // ACT
      const saveUserAction = () => userRepo.saveUser(secondUser);

      // ASSERT
      await expect(saveUserAction()).rejects.toThrow();
    });
  });

  describe('and another user already is using the email', () => {
    it('should fail', async () => {
      // ARRANGE
      const firstUser = createRandomUser();
      await userRepo.saveUser(firstUser);
      testHelpers.trackIdForTeardown(firstUser);
      const secondUser = createRandomUser({ email: firstUser.email });

      // ACT
      const saveUserAction = () => userRepo.saveUser(secondUser);

      // ASSERT
      await expect(saveUserAction()).rejects.toThrow();
    });
  });
});
