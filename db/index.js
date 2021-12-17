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

  async function createTags(tagList){
    if(tagList === 0){
      return
    }
    const insertValues = tagList.map(
      (_, index) => `$${index + 1}`).join('), (');

    const selectValues = tagList.map(
      (_, index) => `$${index + 1}`).join(', ');
    
      await client.query(`
        INSERT INTO tags(name)
        VALUES (${insertValues})
        ON CONFLICT (name) DO NOTHING;
      `)

      const {rows} = await client.query(`
        SELECT name FROM tags
        WHERE name = ${selectValues};
      `)

      return rows
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
      
      return rows;
    } catch (error) {
      throw error;
    }
  }

  async function getUserById(userId) {
      try{

        const {rows: [user]} = await client.query(`
          SELECT id, username, name, location, active FROM users
          WHERE id=${userId};
        `)

        if(!user){
          throw "cannot find user"
        }

        const posts = await getPostsByUser(userId)
        user.posts = posts

        return user

      } catch(err){
        throw err + "couldnt get user by id"
      }
  }

module.exports = {
  client,
  getAllUsers,
  createUser,
  updateUser,
  createPost,
  getAllPosts,
  updatePost,
  getPostsByUser,
  getUserById
}