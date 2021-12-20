const { client, 
  getAllUsers,
  createUser, 
  updateUser, 
  createPost, 
  getAllPosts, 
  updatePost, 
  getPostsByUser, 
  getUserById, 
  getPostsByTagName } = require('./index');

async function testDB() {
    try{
        console.log("Starting to test database...");
        const users = await getAllUsers()
        console.log("getAllUsers: ", users)

        console.log("updating user[0]")
        const updateUserResult = await updateUser(users[0].id, {name: 'taco', location: 'Miami, FL'})
        console.log("Result: ", updateUserResult)

        console.log('getting all posts')
        const posts = await getAllPosts()
        console.log("all posts result: ", posts)

        console.log("Calling updatePost on posts[1], only updating tags");
        const updatePostTagsResult = await updatePost(posts[1].id, {
          tags: ["#youcandoanything", "#redfish", "#bluefish"]
        });
        console.log("Result:", updatePostTagsResult);

        console.log("getting post by user...") 
        const postByUser = await getPostsByUser(1)
        console.log("Got post by user!", postByUser)

        console.log("testing getuser...")
        const getUserTest = await getUserById(1)
        console.log("finsihed testing user", getUserTest)

        console.log("Calling getPostsByTagName with #happy");
        const postsWithHappy = await getPostsByTagName("#happy");
        console.log("Result:", postsWithHappy);

        console.log("Finished database tests!");
    } catch (err) {

        console.log(err)

    }
}

async function createInitialPosts() {
  try {
    const [albert, sandra, glamgal] = await getAllUsers();

    console.log("Starting to create posts...");
    await createPost({
      authorId: albert.id,
      title: "First Post",
      content: "This is my first post. I hope I love writing blogs as much as I love writing them.",
      tags: ["#happy", "#youcandoanything"]
    });

    await createPost({
      authorId: sandra.id,
      title: "How does this work?",
      content: "Seriously, does this even do anything?",
      tags: ["#happy", "#worst-day-ever"]
    });

    await createPost({
      authorId: glamgal.id,
      title: "Living the Glam Life",
      content: "Do you even? I swear that half of you are posing.",
      tags: ["#happy", "#youcandoanything", "#canmandoeverything"]
    });
    console.log("Finished creating posts!");
  } catch (error) {
    console.log("Error creating posts!");
    throw error;
  }
}


async function dropTables() {
    try{

        console.log("Starting to drop tables...");

        await client.query(`
        DROP TABLE IF EXISTS post_tags;
        `)

        await client.query(`
        DROP TABLE IF EXISTS tags;
        `)

        await client.query(`
            DROP TABLE IF EXISTS posts;
        `)

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

        await client.query(`
            CREATE TABLE posts (
                id SERIAL PRIMARY KEY,
                "authorId" INTEGER REFERENCES users(id) NOT NULL,
                title varchar(255) NOT NULL,
                content TEXT NOT NULL,
                active BOOLEAN DEFAULT true
            );
        `);

        await client.query(`
          CREATE TABLE tags (
            id SERIAL PRIMARY KEY,
            name varchar(255) UNIQUE NOT NULL
          );
        `);

        await client.query(`
            CREATE TABLE post_tags (
              "postId" INTEGER REFERENCES posts(id),
              "tagId" INTEGER REFERENCES tags(id),
              unique("postId", "tagId")
            );
        `)
        
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
      await createInitialPosts();

    } catch (error) {
      console.error(error);
    }
  }

  rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());