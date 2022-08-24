import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "./dynamodbDocumentClient.js";

async function updateRecords(tableName, keyFields, records) {
    const results = records.map(async (record) => (await updateRecord(tableName, keyFields, record)));
    return await Promise.all(results);
}

async function updateRecord(tableName, keyFields, record) {
    const key = getKeyObject(keyFields, record);
    const updateParams = {
        TableName: tableName,
        Key: key,
        UpdateExpression: "SET #version = :version, #lastChangedAt = :lastChangedAt",
        ExpressionAttributeValues: {
            ":version": 1,
            ":lastChangedAt": record._lastChangedAt
        },
        ExpressionAttributeNames: {
            "#version": "_version",
            "#lastChangedAt": "_lastChangedAt"
        }
    };
    try {
        await ddbDocClient.send(new UpdateCommand(updateParams));
        console.log("Record updated successfully:", key);
        return { query: updateParams, success: true };
    } catch (error) {
        console.log("Error while updating record:", key, "Log:", error);
        return { query: updateParams, success: false };
    }
}

function getKeyObject(keyFields, record) {
    const key = keyFields.reduce((o, key) => ({ ...o, [key]: record[key] }), {});
    return key;
}

function migrateData(records) {
    const newRecords = records.map(addRequiredFields);
    return newRecords;
}

function addRequiredFields(record) {
    let newRecord = addVersionField(record);
    newRecord = addLastChangedAt(record);
    return newRecord;
}

function addVersionField(record) {
    if (record.hasOwnProperty("_version")) return record;
    record._version = 1;
    return record;
}

function addLastChangedAt(record) {
    if (record.hasOwnProperty("_lastChangedAt")) return record;
    record._lastChangedAt = convertDateToMilliseconds(record.updatedAt);
    return record;
}

function convertDateToMilliseconds(date) {
    const convertedDate = new Date(date);
    const milliseconds = convertedDate.getTime();
    return milliseconds;
}

export { migrateData, updateRecords };