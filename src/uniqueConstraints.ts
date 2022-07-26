import Logger from '@dazn/lambda-powertools-logger';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandInput,
  TransactWriteCommand,
  TransactWriteCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { User, UserDb } from './models';

const {
  env: { AWS_REGION, TABLE_NAME },
} = process;

export default class UserRepository {
  private documentClient: DynamoDBDocumentClient;

  constructor() {
    const baseClient = new DynamoDBClient({ region: AWS_REGION });
    this.documentClient = DynamoDBDocumentClient.from(baseClient);
  }

  async deleteUser(input: { id: string; email: string; userName: string }): Promise<void> {
    const { id, email, userName } = input;
    const deleteUserEntity = {
      Delete: {
        TableName: TABLE_NAME,
        Key: { pk: id },
      },
    };
    const deleteUserName = {
      Delete: {
        TableName: TABLE_NAME,
        Key: { pk: `userName#${userName}` },
      },
    };
    const deleteEmail = {
      Delete: {
        TableName: TABLE_NAME,
        Key: { pk: `email#${email}` },
      },
    };
    const txInput: TransactWriteCommandInput = {
      TransactItems: [deleteUserEntity, deleteEmail, deleteUserName],
    };
    await this.documentClient.send(new TransactWriteCommand(txInput));
  }

  async getUser(id: string): Promise<User> {
    const getInput: GetCommandInput = {
      TableName: process.env.TABLE_NAME,
      Key: { pk: id },
    };
    const { Item: user } = await this.documentClient.send(new GetCommand(getInput));

    return UserRepository.transformToDomainSchema(user as UserDb);
  }

  async saveUser(user: User): Promise<void> {
    Logger.debug('In saveUser()', { user });
    const putUser = {
      Put: {
        Item: UserRepository.transformToDbSchema(user),
        TableName: TABLE_NAME,
        ConditionExpression: 'attribute_not_exists(pk)',
      },
    };
    const putUserName = {
      Put: {
        Item: { pk: `userName#${user.userName}` },
        TableName: TABLE_NAME,
        ConditionExpression: 'attribute_not_exists(pk)',
      },
    };
    const putEmail = {
      Put: {
        Item: { pk: `email#${user.email}` },
        TableName: TABLE_NAME,
        ConditionExpression: 'attribute_not_exists(pk)',
      },
    };
    const input: TransactWriteCommandInput = {
      TransactItems: [putUser, putUserName, putEmail],
    };
    try {
      await this.documentClient.send(new TransactWriteCommand(input));
    } catch (err) {
      const error = err as Error;
      Logger.warn('Transaction failed', error);
      throw err;
    }
  }

  static transformToDbSchema(userDomain: User): UserDb {
    const pk = userDomain.id;
    const dbModel = { ...userDomain, pk } as any;
    delete dbModel.id;

    return dbModel;
  }

  static transformToDomainSchema(userDb: UserDb): User {
    const id = userDb.pk;
    const domainModel = { ...userDb, id } as any;
    delete domainModel.pk;

    return domainModel;
  }

  async updateEmail(input: { id: string; newEmail: string; oldEmail: string }): Promise<void> {
    Logger.debug('In updateEmail()', { input });
    const { id, oldEmail, newEmail } = input;
    const updateUser = {
      Update: {
        TableName: TABLE_NAME,
        Key: { pk: id },
        UpdateExpression: 'SET email = :email',
        ExpressionAttributeValues: {
          ':email': newEmail,
        },
      },
    };
    const deleteOldEmailConstraint = {
      Delete: {
        TableName: TABLE_NAME,
        Key: { pk: `email#${oldEmail}` },
      },
    };
    const addNewEmailConstraint = {
      Put: {
        TableName: TABLE_NAME,
        Item: { pk: `email#${newEmail}` },
        ConditionExpression: 'attribute_not_exists(pk)',
      },
    };
    const txInput: TransactWriteCommandInput = {
      TransactItems: [updateUser, deleteOldEmailConstraint, addNewEmailConstraint],
    };
    try {
      await this.documentClient.send(new TransactWriteCommand(txInput));
    } catch (err) {
      const error = err as Error;
      Logger.warn('Transaction failed', error);
      throw err;
    }
  }
}
