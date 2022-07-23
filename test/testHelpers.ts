import { ulid } from 'ulid';
import faker from 'faker';
import {
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandInput,
  PutCommand,
  PutCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

import { deleteUser, User } from '../src/uniqueConstraints';

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
  private documentClient: DynamoDBDocumentClient;

  private testUsers: User[];

  constructor() {
    const baseClient = new DynamoDBClient({ region: process.env.AWS_REGION });
    this.documentClient = DynamoDBDocumentClient.from(baseClient);
    this.testUsers = [];
  }

  async createRandomUserInDb(overrideWith?: Partial<User>): Promise<User> {
    const user = createRandomUser(overrideWith);
    const putInput: PutCommandInput = {
      TableName: process.env.TABLE_NAME,
      Item: user,
    };
    await this.documentClient.send(new PutCommand(putInput));
    this.testUsers.push(user);

    return user;
  }

  async deleteUser(id: string) {
    const user = (await this.getUser(id)) as User;
    if (!user) {
      return;
    }
    await deleteUser(user);
  }

  async getUser(id: string) {
    const getInput: GetCommandInput = {
      TableName: process.env.TABLE_NAME,
      Key: { id },
    };
    const { Item: user } = await this.documentClient.send(new GetCommand(getInput));

    return user;
  }

  async teardown() {
    const deletePromises = this.testUsers.map(async (user) => this.deleteUser(user.id));
    await Promise.all(deletePromises);
  }

  trackIdForTeardown(user: User) {
    this.testUsers.push(user);
  }
}
