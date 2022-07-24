import { ulid } from 'ulid';
import faker from 'faker';

import { User } from '../src/models';
import UserRepository from '../src/uniqueConstraints';

export const createRandomUser = (overrideWith?: Partial<User>): User => {
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();

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

  private testUserIds: string[];

  constructor() {
    this.userRepo = new UserRepository();
    this.testUserIds = [];
  }

  async teardown() {
    const deletePromises = this.testUserIds.map(async (id) => this.userRepo.deleteUser(id));
    await Promise.all(deletePromises);
  }

  trackIdForTeardown(id: string) {
    this.testUserIds.push(id);
  }
}
