const { client, 
  getAllUsers,
  createUser, 
  updateUser, 
  createPost, 
  getAllPosts, updatePost, 
  getPostsByUser, getUserById, 
  createTags, 
  addTagsToPost } = require('./index');

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

        console.log("updating a post...")
        const updatePostResult = await updatePost(posts[0].id, {title: 'Edited post', content: 'this has been changed', active: 'true'})
        console.log("updated post!", updatePostResult)

        console.log("getting post by user...") 
        const postByUser = await getPostsByUser(1)
        console.log("Got post by user!", postByUser)

        console.log("testing getuser...")
        const getUserTest = await getUserById(1)
        console.log("finsihed testing user", getUserTest)

        console.log("Finished database tests!");
    } catch (err) {

        console.log(err)

    }
}

async function createInitialPosts() {
    try {
      const [albert, sandra, glamgal] = await getAllUsers();
  
      await createPost({
        authorId: albert.id,
        title: "First Post",
        content: "This is my first post. I hope I love writing blogs as much as I love writing them."
      });
  
      await createPost({
        authorId: sandra.id,
        title: "Sandra's Post",
        content: "Hi im Sandra."
      });

      await createPost({
        authorId: albert.id,
        title: "Alberts 2nd post",
        content: "This is my 2nd post."
      });

      await createPost({
        authorId: glamgal.id,
        title: "Glam's post",
        content: `Hi im glam and my id is ${glamgal.id}`
      });

    } catch (error) {
      throw error;
    }
  }

  async function createInitialTags() {
    try {
      console.log("Starting to create tags...");
  
      const [happy, sad, inspo, catman] = await createTags([
        '#happy', 
        '#worst-day-ever', 
        '#youcandoanything',
        '#catmandoeverything'
      ]);
  
      const [postOne, postTwo, postThree] = await getAllPosts();
  
      await addTagsToPost(postOne.id, [happy, inspo]);
      await addTagsToPost(postTwo.id, [sad, inspo]);
      await addTagsToPost(postThree.id, [happy, catman, inspo]);
  
      console.log("Finished creating tags!");
    } catch (error) {
      console.log("Error creating tags!");
      console.log(error);
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
              "postId" INTEGER REFERENCES posts(id) UNIQUE,
              "tagId" INTEGER REFERENCES tags(id) UNIQUE
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
      await createInitialTags();

    } catch (error) {
      console.error(error);
    }
  }

  rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());