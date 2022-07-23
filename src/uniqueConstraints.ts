// From https://aws.amazon.com/blogs/database/simulating-amazon-dynamodb-unique-constraints-using-transactions

import Logger from '@dazn/lambda-powertools-logger';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  TransactWriteCommand,
  TransactWriteCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';

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
  const marshalledUser = marshall(user);
  const putUser = {
    Put: {
      Item: marshalledUser,
      TableName: TABLE_NAME,
      // ConditionExpression: 'attribute_not_exists(pk)',
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
    // console.log(JSON.stringify(error, null, 2));
    throw err;
  }
};
