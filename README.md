# DataStore Migration Tool

Migrate your current DynamoDB table to be able to use [Amplify DataStore](https://docs.amplify.aws/lib/datastore/getting-started/)!

## Warning

This program is being tested.
It is not recommended for use in production environments.

## How to use

1. Run ```bash npm install```
2. Launch the program providing a table name and relative key fields.

## Help

```shell
datastore_migration [tableName] --keyField=[keyField1] --keyField=[keyField2]
... --keyField=[keyField(n)]

Options:
  --tableName  DynamoDB table to migrate.                              [string]
  --keyField   DynamoDB key fields of specified table.                  [array]
```

## Next Steps

1. Unit tests
2. Custom region
