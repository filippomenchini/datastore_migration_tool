import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "./dynamodbDocumentClient.js";

async function updateRecords(tableName, keyFields, records) {
    const results = records.map(async (record) => (await updateRecord(tableName, keyFields, record)));
    return await Promise.all(results);
}

async function updateRecord(tableName, keyFields, record, operationType) {
    const key = getKeyObject(keyFields, record);

    const addFieldsParams = {
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

    const removeFieldsParams = {
        TableName: tableName,
        Key: key,
        UpdateExpression: "REMOVE #version, #lastChangedAt",
        ExpressionAttributeNames: {
            "#version": "_version",
            "#lastChangedAt": "_lastChangedAt"
        }
    };

    try {
        await ddbDocClient.send(new UpdateCommand(operationType === "ADD" ? addFieldsParams : removeFieldsParams));
        console.log("Record updated successfully:", key);
        return { query: addFieldsParams, success: true };
    } catch (error) {
        console.log("Error while updating record:", key, "Log:", error);
        return { query: addFieldsParams, success: false };
    }
}

function getKeyObject(keyFields, record) {
    const key = keyFields.reduce((o, key) => ({ ...o, [key]: record[key] }), {});
    return key;
}

function migrateData(records, operationType) {
    const newRecords = operationType === "ADD" ? records.map(addRequiredFields) : records.map(removeRequiredFields);
    return newRecords;
}

function addRequiredFields(record) {
    let newRecord = addVersionField(record);
    newRecord = addLastChangedAt(record);
    return newRecord;
}

function removeRequiredFields(record) {
    let newRecord = removeVersionField(record);
    newRecord = removeLastChangedAt(record);
    return newRecord;
}

function removeVersionField(record) {
    if (!record.hasOwnProperty("_version")) return record;
    delete record._version;
    return record;
}

function removeLastChangedAt(record) {
    if (!record.hasOwnProperty("_lastChangedAt")) return record;
    delete record._lastChangedAt;
    return record;
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