import { readFileSync } from 'node:fs';
import { CreateTableCommand, DynamoDBClient, waitUntilTableExists } from '@aws-sdk/client-dynamodb';
import yaml from 'js-yaml';

const region = process.env.AWS_REGION || 'us-east-1';
const stage = process.env.STAGE || 'dev';

const readTableDefinition = () => {
  const { Resources } = yaml.load(readFileSync('infrastructure/dynamodb.yml', 'utf8'));
  const table = Object.values(Resources).find(({ Type }) => Type === 'AWS::DynamoDB::Table');

  return table.Properties;
};

const createTableInEmulator = async (tableName) => {
  const { AttributeDefinitions, BillingMode, GlobalSecondaryIndexes, KeySchema } =
    readTableDefinition();
  const client = new DynamoDBClient({ region });
  await client.send(
    new CreateTableCommand({
      TableName: tableName,
      AttributeDefinitions,
      BillingMode,
      GlobalSecondaryIndexes,
      KeySchema,
    }),
  );
  await waitUntilTableExists({ client, maxWaitTime: 30 }, { TableName: tableName });
};

const setup = async () => {
  process.env.AWS_REGION = region;
  process.env.STAGE = stage;
  process.env.TABLE_NAME = `${stage}-ddb-transactions`;
  if (process.env.AWS_ENDPOINT_URL) {
    await createTableInEmulator(process.env.TABLE_NAME);
  }
};

export default setup;
