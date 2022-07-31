import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import retry from 'async-retry';

import UserRepository from '../src/uniqueConstraints';
import { createRandomUser, TestHelpers } from './testHelpers';

const {
  env: { AWS_REGION, TABLE_NAME },
} = process;

describe('When deleting user', () => {
  let testHelpers: TestHelpers;
  let userRepo: UserRepository;
  let documentClient: DynamoDBDocumentClient;

  beforeAll(() => {
    userRepo = new UserRepository();
    testHelpers = new TestHelpers();
    const baseClient = new DynamoDBClient({ region: AWS_REGION });
    documentClient = DynamoDBDocumentClient.from(baseClient);
  });

  afterAll(async () => {
    await testHelpers.teardown();
  });

  it('should remove all three items', async () => {
    // ARRANGE
    const user = createRandomUser();
    testHelpers.trackIdForTeardown(user);
    await userRepo.saveUser(user);

    await retry(
      async () => {
        // ACT
        await userRepo.deleteUser(user);

        // ASSERT
        const { Item: userInDb } = await documentClient.send(
          new GetCommand({ TableName: TABLE_NAME, Key: { pk: user.id } }),
        );
        expect(userInDb).toBeUndefined();
        const { Item: emailInDb } = await documentClient.send(
          new GetCommand({ TableName: TABLE_NAME, Key: { pk: user.email } }),
        );
        expect(emailInDb).toBeUndefined();
        const { Item: userNameInDb } = await documentClient.send(
          new GetCommand({ TableName: TABLE_NAME, Key: { pk: user.userName } }),
        );
        expect(userNameInDb).toBeUndefined();
      },
      { retries: 3 },
    );
  });
});
