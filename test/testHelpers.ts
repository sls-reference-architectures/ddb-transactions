import { ulid } from 'ulid';
import faker from 'faker';

import { User } from '../src/uniqueConstraints';

export const createRandomUser = (): User => {
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();

  return {
    id: ulid(),
    userName: `${firstName.toLowerCase()[0]}${lastName.toLowerCase()}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${faker.internet.domainName()}`,
    fullName: `${firstName} ${lastName}`,
    phoneNumber: faker.phone.phoneNumber(),
  };
};

export class TestHelpers {}
