import { ulid } from 'ulid';
import faker from 'faker';

import { User } from '../src/models';
import UserRepository from '../src/uniqueConstraints';

export const createRandomUser = (overrideWith?: Partial<User>): User => {
  const firstName = faker.name.firstName();
  const lastName = `${faker.name.lastName()}_${ulid()}`;

  return {
    id: ulid(),
    userName: `${firstName.toLowerCase()[0]}${lastName.toLowerCase()}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${faker.internet.domainName()}`,
    fullName: `${firstName} ${lastName}`,
    phoneNumber: faker.phone.phoneNumber(),
    ...overrideWith,
  };
};

export class TestHelpers {
  private userRepo: UserRepository;

  private testUserKeys: UserKeys[];

  constructor() {
    this.userRepo = new UserRepository();
    this.testUserKeys = [];
  }

  async teardown() {
    const deletePromises = this.testUserKeys.map(async (key) => this.userRepo.deleteUser(key));
    await Promise.all(deletePromises);
  }

  trackIdForTeardown(userKey: UserKeys) {
    this.testUserKeys.push(userKey);
  }
}

interface UserKeys {
  id: string;
  email: string;
  userName: string;
}
