/*
/*****************************************************************************************************************
# *                                                                                                              *
# *  Project: OCI NoSQL Database-Based List and Search Application                                               *
# *                                                                                                              *
# *  Copyright © 2024. MongoExpUser.  All Rights Reserved.                                                       *
# *                                                                                                              *
# *  License: MIT - https://github.com/MongoExpUser/OCI-NoSQL-Based-List-and-Search-App/blob/main/LICENSE        *
# *                                                                                                              *
# *  1) The module implements OCI/Oracle NoSQL Database-Based Car Listing and Searching Application              *
# *  2) The implementation is done with the following Node.js packages                                           *
# *     (a) OCI/Oracle nosqldb                                                                                   *
# *         Ref 1:  https://www.npmjs.com/package/oracle-nosqldb                                                 *
# *         Ref 2:  https://oracle.github.io/nosql-node-sdk/.                                                    *
# *         - Install as: sudo npm i oracle-nosqldb (On Linux/Ubuntu OS)                                         *
# *     (b) Bcryptjs                                                                                             *
# *         Ref 1:  https://www.npmjs.com/package/bcryptjs                                                       *
# *         - Install as: sudo npm i bcryptjs (On Linux/Ubuntu OS)                                               *
# *     (c) Uuid                                                                                                 *
# *         Ref 1:  https://www.npmjs.com/package/uuid.                                                          *
# *         - Install as: sudo npm i uuid (On Linux/Ubuntu OS)                                                   *
# *     (d) Faker - Data is generated with @faker-js/faker Node.js libary                                        *
# *         Ref 1:  https://www.npmjs.com/package/@faker-js/faker                                                *
# *         Ref 2:  https://fakerjs.dev/api/                                                                     *
# *         - Install as: sudo npm install @faker-js/faker (On Linux/Ubuntu OS)                                  *
# *                                                                                                              *
# ****************************************************************************************************************
*/




import fs from "node:fs";
import util from "node:util";
import bcryptjs from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { faker } from "@faker-js/faker";
import { UserCrypto } from "./Crypto.mjs";
import { NoSQLClient } from "oracle-nosqldb";
import { readFileSync, writeFileSync } from "node:fs";


class CarApp
{
    constructor()
    {
      return null;
    }

    async probeObject(item)
    {
        for(let obj in item)
        {
            let key = String(obj);
            let value = item[key];
            console.log({ key : value } );
        }
    }
    
    async prettyPrint(value, showHidden)
    {
        console.log(util.inspect(value, { showHidden: showHidden, colors: true, depth: Infinity }));
    }
    
    async uuid4()
    {
        let timeNow = new Date().getTime();
        let uuidValue =  'xxxxxxxx-xxxx-7xxx-kxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(constant)
        {
            let random = (timeNow  + Math.random() *16 ) % 16 | 0;
            timeNow  = Math.floor(timeNow / 16);
            return (constant === 'x' ? random : (random & 0x3| 0x8)).toString(16);
        });
        
        return uuidValue;
    }
    
    async getRandomValueFromList(randomList)
    {
        const randomNumber = Math.floor(Math.random() * randomList.length);
        const randomValue = randomList[randomNumber];
        return randomValue;
    }
    
    async user(username, email, password, subType, request)
    {
        const capp = new CarApp();
        const crypt = new UserCrypto();
        const hashAlgorithmPasd = "bcrypt";
        const hashAlgorithmBlockchain = "bcrypt";
        const saltWorkFactor = 10;
        const salt = bcryptjs.genSaltSync(saltWorkFactor);
        const pasd = bcryptjs.hashSync(password, salt);
        const initDate = new Date();
        const verificationCode = uuidv4();
        const initConfirmation = false;
        const initBlockChain = crypt.isHashConsensus([uuidv4()], hashAlgorithmBlockchain);
        const blockchain = [initBlockChain[0], initBlockChain[1], initBlockChain[2]];
        const maxLoginAttempts = 10;
        const lockTime = 1*60*60*1000; // 1 hour
          
        const newUserMap = new Map();      

        // main variables
        newUserMap.set("username", username);                           
        newUserMap.set("email", email);                                 
        newUserMap.set("password", pasd);                               
        newUserMap.set("passwordArray", [pasd, pasd, pasd, pasd, pasd]) // require store last five hashed passwords to prevent re-use for security reasons
        newUserMap.set("subType", subType);                             
        // time variables
        newUserMap.set("createdOn", initDate);
        newUserMap.set("modifiedOn", initDate);                          // anytime password is reset or changed
        newUserMap.set("lastLogin", initDate);
        newUserMap.set("lastLogOut", initDate);
        // account status
        newUserMap.set("veriCode", verificationCode);
        newUserMap.set("verify", initConfirmation);
        newUserMap.set("inUse", initConfirmation);
        //blockchains: for holding continuous blockchain data/records -> salts, hashes and timestamps respectively
        newUserMap.set("blockchains", blockchain);
        newUserMap.set("loginAttempts", 0);                             
        newUserMap.set("lockUntil", 0);
        newUserMap.set("maxLoginAttempts", maxLoginAttempts);

        return await Object.fromEntries(newUserMap);
    }


    carCharacteristicsList()
    {
        return {
            yearMade:  [0, -1, -2, -3, -4, -5, -6, 1],
            model: ["Model Y", "Model T", "Model Y", "Model Z", "Model A", "Model B", "Model C"],
            manufacturer: ["Tesla", "Toyota", "Ford", "GM"],
            color: ["White", "Brown", "Black", "Green", "Silver"],
            rentBuy :["rent", "buy"],
            mileage: [0, -110, -120, -130, -140, -150, -160, -170, -180, -190, -200, 11, 120, 130, 140, 150, 160, 170, 180, 190, 120],
        }
    }


    async jsonSampleDatasets(sampleNumber)
    {
        let data = [];
        const capp = new CarApp();
        const pcl = capp.carCharacteristicsList();
    
        for(let index = 0; index < sampleNumber; index++)
        {
            const street = faker.location.streetAddress();
            const city = faker.location.city(); 
            const state = faker.location.state();
            const zipcode = faker.location.zipCode("#####-####");
            const country = "USA"

            const rentBuy =  await capp.getRandomValueFromList(pcl.rentBuy);
            const manufacturer = await capp.getRandomValueFromList(pcl.manufacturer);
            const model = await capp.getRandomValueFromList(pcl.model);
            const yearMade = 2022 + await capp.getRandomValueFromList(pcl.yearMade);
            const color =  await capp.getRandomValueFromList(pcl.color);
            const mileage =   5000 +  await capp.getRandomValueFromList(pcl.mileage);

            const uid = await capp.uuid4();
            const email = faker.internet.email();
            const addressPlain = `${street}, ${city}, ${state}, ${zipcode}, ${country}`;
            const addressJson = { street: street, city: city, state: state, zipcode: zipcode, country: country};
            const firstname = faker.person.firstName();
            const lastname = faker.person.lastName();
            const username = firstname;
            const description =  `${rentBuy}, ${yearMade} ${manufacturer} ${model}, ${color} color, ${mileage} miles`;
            const date = new Date();
            const imagePath = faker.image.avatar();

            const subType = "car";
            const password = faker.string.nanoid({ min: 10, max: 20 })
            const request = { ip: "0.0.0.0" };
            const userdetails = await capp.user( username, email, password, subType, request);
            const user = { "email": email, "username" : username, "details" : userdetails };
            const info = { "email": email, "manufacturer": manufacturer, "yearMade" : yearMade, "addressPlain": addressPlain, "addressJson": addressJson, "description": description, "imagePath": imagePath, "createdon": date, "updatedon": date };
            await data.push({"user": user, "info": info, "date": date, "uid": uid});
        }
        
        return data;
    }
    

    async createDropTableAndWriteReadData(client, tableName, record, tableLimits, createTable, writeRecord, readRecord, dropTable, createIndex, indexName, indexColumn) 
    {
        if(createIndex === true)
        {
            const createIndex = `CREATE INDEX IF NOT EXISTS ${indexName} ON ${tableName}(${indexColumn})`
            let res = await client.tableDDL(createIndex);
            await client.forCompletion(res);
            const capp = new CarApp();
            await capp.probeObject(res);
            console.log(`Index is created on ${res.tableName}`);
            console.log(`Table state:  ${res.tableState.name}`);
        }
        
        if(createTable === true)
        {
            let createDDL;

            if(tableName === "users")
            {
                createDDL = `CREATE TABLE IF NOT EXISTS ${tableName} (username STRING, email STRING, details JSON, PRIMARY KEY(SHARD(email)))`;
            }
            else if(tableName === "cars")
            {
                createDDL = `CREATE TABLE IF NOT EXISTS ${tableName} (email STRING, manufacturer STRING, yearBuilt INTEGER, description STRING, imagePath STRING, createdon TIMESTAMP(9), updatedon TIMESTAMP(9), addressJson JSON, addressPlain STRING, PRIMARY KEY(SHARD(email)))`;
            }

            let res = await client.tableDDL(createDDL, { tableLimits: tableLimits });
            console.log(`Creating table ${res.tableName}`);
            console.log(`Table state:  ${res.tableState.name}`);
            await client.forCompletion(res);
            console.log(`Table is created ${res.tableName}`);
            console.log(`Table state:  ${res.tableState.name}`);
        }

        // user creation and user's car listing operation
        if(writeRecord  === true)
        {
            console.log("");
            console.log("Write a record, only if key is unique");
            let res = await client.putIfAbsent(tableName, record);
            if(res.consumedCapacity) 
            {
                console.log("Write used: %O", res.consumedCapacity);
            }
        }

        // an example of a search operation (read all records for the user identified by the email)
        if(readRecord  === true)
        {
            console.log("");
            console.log("Read a record");
            let res = await client.get(tableName, { email: record.email });

            if(tableName === "users")
            {
                console.log( {"Retrieved record details" : JSON.parse(res.row.details) } ) ;
            }
            else
            {
                console.log( {"Retrieved record" : res.row } ) ;
            }

            if(res.consumedCapacity) 
            {
                console.log("Read used: %O", res.consumedCapacity);
            }
        }

        if(dropTable === true)
        {
            console.log("");
            console.log("Drop table");
            const dropDDL = `DROP TABLE ${tableName}`;
            res = await client.tableDDL(dropDDL);
            console.log(`Dropping table ${res.tableName}`);
            await client.forCompletion(res);
            console.log("Operation completed");
            console.log(`Table state:  ${res.tableState.name}`);
        }
    }

    async runOperation(client, tableName, record, tableLimits, createTable, writeRecord, readRecord, dropTable, createIndex, indexName, indexColumn) 
    {
        const capp = new CarApp();

        try 
        {
            await capp.createDropTableAndWriteReadData(client, tableName, record, tableLimits, createTable, writeRecord, readRecord, dropTable, createIndex, indexName, indexColumn);
        } 
        catch(error) 
        {
            console.log(error);
        } 
        finally 
        {
            if(client) 
            {
                client.close();
                console.log("Oracle NoSQL Database client is disconnected!");
            }
        }
    }

    async searchCarRecords(credentials)
    {
        const capp = new CarApp();
        const client = new NoSQLClient(credentials);

        try 
        {
            // an example of a search operation: ->  search listed cars based on manufacturers and yearMade
            const tables = ["cars"]; 
            const tablesLen = tables.length;

            for(let index = 0; index < tablesLen; index++)
            {
                const stmt = `SELECT * from ${tables[index]} where manufacturer IN ('Tesla', 'Toyota') AND yearMade > 1999`;
              
                for await(const result of client.queryIterable(stmt)) 
                {
                    console.log(`Retrieved ${result.rows.length} rows`);
                    const rows = result.rows;
                    const showHidden = false;
                    await capp.prettyPrint(rows, showHidden);
                }
            }
        } 
        catch(error) 
        {
            console.log(error)
        }
        finally
        {

            if(client) 
            {
                client.close();
                console.log("Oracle NoSQL Database client is disconnected!");
            }
        }
    }

    static async separator()
    {
        console.log(`------------------------------------------------------------------------`);
    }
}


async function main()
{
    const credentialJsonFilePath = "credentials.json";
    const credentials =  JSON.parse(fs.readFileSync(credentialJsonFilePath));
    const tableLimits = { capacityMode: "PROVISIONED", readUnits: 25, writeUnits: 25, storageGB: 25 } ;  // "PROVISIONED" || "ON_DEMAND"
    const capp = new CarApp();
    const client = new NoSQLClient(credentials);
    const sampleNumber = 6;
    const data = await capp.jsonSampleDatasets(sampleNumber);
    const tableNames = { "users": "users", "cars": "cars"};
    const dataLen = data.length;
    const showHidden = false;
    const createTable = false;
    const writeRecord = false;
    const readRecord = false;
    const dropTable = false;
    const userOperations = false;
    const carOperations = false;
    const createIndex = false;
    const userIndexName = "emailIdx"
    const userIndexColumn = "email";
    const carIndexName = "manufacturerIdx"
    const carIndexColumn = "manufacturer";
    const searchCar = true;

    try
    {
        for(let i = 0; i < dataLen; i++)
        {
            if(userOperations === true)
            {
                const details = JSON.stringify(data[i].user.details);
                const userTable = tableNames.users;
                const userRecord = { username : data[i].user.username, email : data[i].user.email, details :  details }
                await capp.runOperation(client, userTable, userRecord, tableLimits, createTable, writeRecord, readRecord, dropTable, createIndex, userIndexName, userIndexColumn);
                console.log( "Successfully Oracle NoSQL Database user operation(s)!");
                console.log( "----------------------------------------------------");
            }

            if(carOperations === true)
            {
                const details = JSON.stringify(data[i].user.details);
                const carTable = tableNames.cars;
                
                const addressJson = JSON.stringify(data[i].info.addressJson);
                const createdon = data[i].info.createdon;   
                const updatedon = data[i].info.updatedon;     
                const carRecord = { 
                    "email" : data[i].info.email, 
                    "manufacturer": data[i].info.manufacturer,
                    "yearMade" : data[i].info.yearMade, 
                    "addressPlain" : data[i].info.addressPlain, 
                    "addressJson" : data[i].info.addressJson, 
                    "description" : data[i].info.description, 
                    "imagePath" : data[i].info.imagePath, 
                    "createdon" : createdon, 
                    "updatedon" : updatedon 
                };
                await capp.runOperation(client, carTable , carRecord, tableLimits, createTable, writeRecord, readRecord, dropTable, createIndex, carIndexName, carIndexColumn);
                console.log( "Successfully Oracle NoSQL Database car operation(s)!");
                console.log( "----------------------------------------------------");
            
            }
        }

        if(searchCar === true)
        { 
            await capp.searchCarRecords(credentials); 
            console.log( "Successfully Oracle NoSQL Database car search!");
            console.log( "----------------------------------------------------");
        }

    }
    catch(error)
    {
        console.log(error)
    }
}


main();

export  { CarApp };       // esm/mjs
