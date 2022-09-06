import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const argv = yargs(hideBin(process.argv))
    .scriptName("datastore_migration")
    .usage("$0 [ADD or REMOVE] --tableName=[tableName] --keyField=[keyField1] --keyField=[keyField2] ... --keyField=[keyField(n)]")
    .option('type', {
        description: "Add or remove migration fields.",
        type: 'string'
    })
    .option('tableName', {
    description: "DynamoDB table to migrate.",
    type: 'string'})
    .array('keyField')
    .option('keyField', {
    description: "DynamoDB key fields of specified table.",
    type: "string"
    })
    .parse();

function getTableNameFromArgs() {
    return argv.tableName;
}

function getTypeFromArgs() {
    return argv.type;
}

function getKeyFieldsFromArgs() {
    return argv.keyField;
}

export { getTableNameFromArgs, getKeyFieldsFromArgs, getTypeFromArgs };