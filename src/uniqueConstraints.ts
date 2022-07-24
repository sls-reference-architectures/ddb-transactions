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

  async deleteUser(id: string): Promise<void> {
    const user = (await this.getUser(id)) as User;
    if (!user) {
      return;
    }

    const deleteUserEntity = {
      Delete: {
        TableName: TABLE_NAME,
        Key: { pk: id },
      },
    };
    const deleteUserName = {
      Delete: {
        TableName: TABLE_NAME,
        Key: { pk: user.userName },
      },
    };
    const deleteEmail = {
      Delete: {
        TableName: TABLE_NAME,
        Key: { pk: user.email },
      },
    };
    const txInput: TransactWriteCommandInput = {
      TransactItems: [deleteUserEntity, deleteEmail, deleteUserName],
    };
    await this.documentClient.send(new TransactWriteCommand(txInput));
  };

  async getUser(id: string): Promise<User> {
    const getInput: GetCommandInput = {
      TableName: process.env.TABLE_NAME,
      Key: { id },
    };
    const { Item: user } = await this.documentClient.send(new GetCommand(getInput));

    return UserRepository.transformToDomainSchema(user as UserDb);
  }

  async saveUser(user: User): Promise<void> {
    Logger.debug('In saveUser()', { user, TABLE_NAME });
    const putUser = {
      Put: {
        Item: UserRepository.transformToDbSchema(user),
        TableName: TABLE_NAME,
        ConditionExpression: 'attribute_not_exists(id)',
      },
    };
    const putUserName = {
      Put: {
        Item: { id: user.userName },
        TableName: TABLE_NAME,
        ConditionExpression: 'attribute_not_exists(id)',
      },
    };
    const input: TransactWriteCommandInput = {
      TransactItems: [putUser, putUserName],
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
}
