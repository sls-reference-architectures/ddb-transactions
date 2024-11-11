import { ulid } from 'ulid';
import { faker } from '@faker-js/faker';

import UserRepository from '../src/uniqueConstraints';

export const createRandomUser = (overrideWith) => {
  const firstName = faker.person.firstName();
  const lastName = `${faker.person.lastName()}_${ulid()}`;

  return {
    id: ulid(),
    userName: `${firstName.toLowerCase()[0]}${lastName.toLowerCase()}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${faker.internet.domainName()}`,
    fullName: `${firstName} ${lastName}`,
    phoneNumber: faker.phone.number(),
    ...overrideWith,
  };
};

export class TestHelpers {
  constructor() {
    this.userRepo = new UserRepository();
    this.testUserKeys = [];
  }

  async teardown() {
    const deletePromises = this.testUserKeys.map(async (key) => this.userRepo.deleteUser(key));
    await Promise.all(deletePromises);
  }

  trackIdForTeardown(userKey) {
    this.testUserKeys.push(userKey);
  }
}
