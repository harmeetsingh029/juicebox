const { client, getAllUsers } = require('./index');

async function testDB() {
    try{
        console.log("Starting to test database...");
        const users = await getAllUsers()
        console.log("getAllUsers: ", users)
        console.log("Finished database tests!");

    } catch (err) {

        console.log(err)

    }
}

async function dropTables() {
    try{

        console.log("Starting to drop tables...");

        await client.query(`
            DROP TABLE IF EXISTS users;
        `)

        console.log("Finished dropping tables!");

    } catch(err) {
        console.log(err)
    }
}

async function createTables() {
    try {
        
        console.log("Starting to build tables...");

        await client.query(`
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                username varchar(255) UNIQUE NOT NULL,
                password varchar(255) NOT NULL
            );
        `);
        
        console.log("Finished building tables!");

      } catch (err) {
        console.log(err)
      }
}

async function rebuildDB() {
    try {
      client.connect();
  
      await dropTables();
      await createTables();
    } catch (error) {
      console.error(error);
    }
  }

  rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());