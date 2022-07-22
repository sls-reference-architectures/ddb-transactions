import Logger from '@dazn/lambda-powertools-logger';

let a = 'a';
a += '.';
Logger.debug('A', { a });
