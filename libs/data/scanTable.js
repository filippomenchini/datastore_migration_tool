import { parallelScan } from "@shelf/dynamodb-parallel-scan";

async function scanTable(tableName) {
    const scanParams = {
        TableName: tableName
    };

    console.log("\nScanning table:", tableName);
    console.log("Please wait...\n");

    const items = await parallelScan(scanParams, { concurrency: 1000 });
    return items;
}

export { scanTable };