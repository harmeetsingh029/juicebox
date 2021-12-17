const { Client } = require('pg'); // imports the pg module

// supply the db name and location of the database
const client = new Client('postgres://localhost:5432/juicebox-dev');

async function getAllUsers() {
    const { rows } = await client.query(`
        SELECT id, username, name, location, active FROM users;
    `);

    return rows
}

async function getAllPosts(){
    const { rows } = await client.query(`
        SELECT * FROM posts;
    `)

    return rows

}

async function createUser({username, password, name, location}) {
    try{
        const {rows: [user]} = await client.query(`
            INSERT INTO users(username, password, name, location)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (username) DO NOTHING 
            RETURNING *;
        `, [username, password, name, location]);

        return user

    } catch(err){
        throw err;
    }
}

async function createPost({ authorId, title, content }) {
    try {
        const rows = await client.query(`
            INSERT INTO posts("authorId", title, content)
            VALUES($1, $2, $3);
        `, [authorId, title, content])
        
        console.log("from createpost: ", rows)
        return rows

    } catch (error) {
      throw error;
    }
  }

async function updateUser(id, fields = {}) {
    // build the set string
    const setString = Object.keys(fields).map(
      (key, index) => `"${ key }"=$${ index + 1 }`
    ).join(', ');
  
    // return early if this is called without fields
    if (setString.length === 0) {
      return;
    }
  
    try {
      const { rows: [user] } = await client.query(`
        UPDATE users
        SET ${ setString }
        WHERE id=${ id }
        RETURNING *;
      `, Object.values(fields));
  
      return user;
    } catch (error) {
      throw error;
    }
  }
  
  async function updatePost(id, { title, content, active }) {
    let fields = { title, content, active }
    const setString = Object.keys(fields).map(
      (key, index) => `"${ key }"=$${ index + 1 }`
    ).join(', ');

    if (setString.length === 0) {
      return;
    }

    try {
      
      const { rows } = await client.query(`
      UPDATE posts
      SET ${ setString }
      WHERE id=${ id }
      RETURNING *;
    `, Object.values(fields));

    return rows;
      
    } catch (error) {
      throw error;
    }
  }

  async function getPostsByUser(userId) {
    try {
      const {rows} = await client.query(`
        SELECT * FROM posts
        WHERE "authorId"=${ userId };
      `);
      // const posts = await Promise.all(postids.map( el => {
      //   console.log(el)
      // }))
      
      return rows;
    } catch (error) {
      throw error;
    }
  }

  async function getUserById(userId) {
      try{
        console.log("beginning of try")
        const {rows} = await client.query(`
          SELECT id, username, name, location, active FROM users
          WHERE id=${userId};
        `)
        console.log("before if")
        if(!rows){
          throw "cannot find user"
        }
        console.log("THESE ARE THE ROWS THAT PRINT: ", rows)

      } catch(err){
        throw err + "couldnt get user by id"
      }
  }
  getUserById(1)

module.exports = {
  client,
  getAllUsers,
  createUser,
  updateUser,
  createPost,
  getAllPosts,
  updatePost,
  getPostsByUser
}