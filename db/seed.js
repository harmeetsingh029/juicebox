const { client, getAllUsers, createUser, updateUser } = require('./index');

async function testDB() {
    try{
        console.log("Starting to test database...");
        const users = await getAllUsers()
        console.log("getAllUsers: ", users)

        console.log("updating user[0]")
        const updateUserResult = await updateUser(users[0].id, {name: 'taco', location: 'Miami, FL'})
        console.log("Result: ", updateUserResult)
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
                password varchar(255) NOT NULL,
                name varchar(255) NOT NULL,
                location varchar(255) NOT NULL,
                active BOOLEAN DEFAULT true
            );
        `);
        
        console.log("Finished building tables!");

      } catch (err) {
        console.log(err)
      }
}

async function createInitialUsers() {
    try {
      console.log("Starting to create users...");
  
      const albert = await createUser({ username: 'albert', password: 'bertie99', name: 'Albert', location: 'Chicago' });
      const sandra = await createUser({username: 'sandra', password: '2sandy4me', name: 'Sandra', location: 'Chicago'})
      const glamgal = await createUser({username: 'glamgal', password: 'soglam', name: 'Glam', location: 'Chicago'})
  
      console.log(albert);
  
      console.log("Finished creating users!");
    } catch(error) {
      console.error("Error creating users!");
      throw error;
    }
  }

async function rebuildDB() {
    try {
      client.connect();
  
      await dropTables();
      await createTables();
      await createInitialUsers();
    } catch (error) {
      console.error(error);
    }
  }

  rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());