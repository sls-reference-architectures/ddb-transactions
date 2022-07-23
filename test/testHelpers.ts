import { ulid } from 'ulid';
import faker from 'faker';
import { DynamoDBDocumentClient, GetCommand, GetCommandInput } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

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

export class TestHelpers {
  private documentClient: DynamoDBDocumentClient;

  constructor() {
    const baseClient = new DynamoDBClient({ region: process.env.AWS_REGION });
    this.documentClient = DynamoDBDocumentClient.from(baseClient);
  }

  async getUser(id: string) {
    const getInput: GetCommandInput = {
      TableName: process.env.TABLE_NAME,
      Key: { id },
    };
    const { Item: user } = await this.documentClient.send(new GetCommand(getInput));

    return user;
  }
}
