import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "./dynamodbDocumentClient.js";

async function scanTable(tableName) {
    let records = [];
    let startKey = null;
    console.log("\nTable scan started...\n");
    do {
        // Getting data from the table.
        const result = await scan(tableName, startKey);
        console.log("Scanned records:", result.Items.length);
        // Pushing records to the result.
        records.push(result.Items);
        // Updating key for next scan.
        startKey = result.LastEvaluatedKey;
    } while(startKey != null);
    console.log("\nTable scan completed!\n");

    return records.flat();
}

async function scan(tableName, startKey) {
    const scanParams = {
        TableName: tableName
    };

    if (startKey != null) {
        scanParams.ExclusiveStartKey = startKey
    }
    
    try {
        const data = await ddbDocClient.send(new ScanCommand(scanParams));
        return data;
    } catch (error) {
        console.log("Unable to retreive data.");
        return null;
    }
}

export { scanTable };