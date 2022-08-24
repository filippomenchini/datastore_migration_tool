import { migrateData, updateRecords } from "./libs/data/migrateData.js";
import { scanTable } from "./libs/data/scanTable.js";
import { getTableNameFromArgs, getKeyFieldsFromArgs } from "./libs/process/args.js";
import { askQuestion } from "./libs/process/askQuestion.js";

// Get table name from arguments.
const tableName = getTableNameFromArgs();
if (tableName == null) {
    console.log("No tableName provided! Use --help for more info.");
    process.exit(1);
}

// Get table key fields from arguments.
const tableKeyFields = getKeyFieldsFromArgs();
if (tableKeyFields == null) {
    console.log("No keyField provided! Use --help for more info.");
    process.exit(1);
}

// Asking confirmation to migrate data.
const doYouWantToMigrate = askQuestion(`Do you want to migrate all of ${tableName}'s content? (y/N): `, "n");
if (doYouWantToMigrate === "n") process.exit(0);

// Retrieve all records from table.
const tableItems = await scanTable(tableName);
if (tableItems.length === 0) {
    console.log("No items to work with. Exiting...");
    process.exit(0);
}

// Asking confirmation again, to make sure that the user is aware of what will happen.
console.log("Table name:", tableName);
console.log("Table key fields:", tableKeyFields);
console.log("Records to migrate:", tableItems.length);
console.log(`\nEvery record will have 2 new fields:\n\t1. _version\n\t2. _lastChangedAt`);
const doYouWantToStart = askQuestion(`Do you want to start the migration process(y/N): `, "n");
if (doYouWantToStart === "n") process.exit(0);

// Migration function.
const newRecords = migrateData(tableItems);
console.log("\nMigrated records:", newRecords.length, "\n");
const doYouWantToUpdateDatabase = askQuestion("Do you want to persist these migrations to your database? (y/N): ", "n");
if (doYouWantToUpdateDatabase === "n") process.exit(0);

// Table update.
const results = await updateRecords(tableName, tableKeyFields, newRecords);
const successes = results.reduce((arr, record) => { if (record.success) return [...arr, record]; }, []);
const fails = results.reduce((arr, record) => { if (!record.success) return [...arr, record]; }, []);

// Finish.
console.log("Records to update:", newRecords.length);
if (successes !== undefined) console.log("Records updated successfully:", successes.length);
if (fails !== undefined) console.log("Records updated unsuccessfully:", fails.length);

console.log("Finished");