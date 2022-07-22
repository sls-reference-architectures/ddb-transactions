// From https://aws.amazon.com/blogs/database/simulating-amazon-dynamodb-unique-constraints-using-transactions

import Logger from '@dazn/lambda-powertools-logger';

export interface User {
  id: string;
  userName: string;
  email: string;
  fullName: string;
  phoneNumber: string;
}

export const saveUser = async (user: User): Promise<void> => {
  Logger.debug('In saveUser()', { user });
};
