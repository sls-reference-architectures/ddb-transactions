// From https://aws.amazon.com/blogs/database/simulating-amazon-dynamodb-unique-constraints-using-transactions

import Logger from '@dazn/lambda-powertools-logger';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  TransactWriteCommand,
  TransactWriteCommandInput,
} from '@aws-sdk/lib-dynamodb';

const {
  env: { AWS_REGION, TABLE_NAME },
} = process;
const baseClient = new DynamoDBClient({ region: AWS_REGION });
const documentClient = DynamoDBDocumentClient.from(baseClient);

export interface User {
  id: string;
  userName: string;
  email: string;
  fullName: string;
  phoneNumber: string;
}

export const saveUser = async (user: User): Promise<void> => {
  Logger.debug('In saveUser()', { user, TABLE_NAME });
  const putUser = {
    Put: {
      Item: user,
      TableName: TABLE_NAME,
      // ConditionExpression: 'attribute_not_exists(id)',
    },
  };
  const input: TransactWriteCommandInput = {
    TransactItems: [putUser],
  };
  try {
    await documentClient.send(new TransactWriteCommand(input));
  } catch (err) {
    const error = err as Error;
    Logger.warn('Transaction failed', error);
    throw err;
  }
};
