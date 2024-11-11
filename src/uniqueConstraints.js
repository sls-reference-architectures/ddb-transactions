import Logger from '@dazn/lambda-powertools-logger';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';

const { AWS_REGION, TABLE_NAME } = process.env;

export default class UserRepository {
  constructor() {
    const baseClient = new DynamoDBClient({ region: AWS_REGION });
    this.documentClient = DynamoDBDocumentClient.from(baseClient);
  }

  async deleteUser({ id, email, userName }) {
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
    const txInput = {
      TransactItems: [deleteUserEntity, deleteEmail, deleteUserName],
    };
    await this.documentClient.send(new TransactWriteCommand(txInput));
  }

  async getUser(id) {
    const getInput = {
      TableName: process.env.TABLE_NAME,
      Key: { pk: id },
    };
    const { Item: user } = await this.documentClient.send(new GetCommand(getInput));

    return UserRepository.transformToDomainSchema(user);
  }

  async saveUser(user) {
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
    const input = {
      TransactItems: [putUser, putUserName, putEmail],
    };
    try {
      await this.documentClient.send(new TransactWriteCommand(input));
    } catch (err) {
      Logger.warn('Transaction failed', err);
      throw err;
    }
  }

  static transformToDbSchema(userDomain) {
    const pk = userDomain.id;
    const dbModel = { ...userDomain, pk };
    delete dbModel.id;

    return dbModel;
  }

  static transformToDomainSchema(userDb) {
    const id = userDb.pk;
    const domainModel = { ...userDb, id };
    delete domainModel.pk;

    return domainModel;
  }

  async updateEmail({ id, newEmail, oldEmail }) {
    Logger.debug('In updateEmail()', { id, newEmail, oldEmail });
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
    const txInput = {
      TransactItems: [updateUser, deleteOldEmailConstraint, addNewEmailConstraint],
    };
    try {
      await this.documentClient.send(new TransactWriteCommand(txInput));
    } catch (err) {
      Logger.warn('Transaction failed', err);
      throw err;
    }
  }
}
