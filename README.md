# ddb-transactions

Demonstrations of using DynamoDB transactions

## Unique Constraints

From an AWS blog post, [Simulating Amazon DynamoDB unique constraints using transactions](https://aws.amazon.com/blogs/database/simulating-amazon-dynamodb-unique-constraints-using-transactions/), this section implements the techniques described in the article. It follows the same User model in the post and has a "User Repository" that implements all the patterns described in the article.

The User entity maintains three unique properties: `id`, `email`, and `userName`. The `id` directly maps to the table's primary key (`pk`) and, therefore, picks up uniqueness out of the box. The other two properties (`email` and `userName`) leverage DynamoDB (DDB) transactions to stay "associated" with the user, but ultimately gain their uniqueness through the same primary key.

The User Repository shows how to manage these additional entries for Saves, Updates, and Deletes.
