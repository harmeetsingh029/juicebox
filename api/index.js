const express = require('express');
const apiRouter = express.Router();

const postsRouter = require('./posts');
const tagsRouter = require('./tags');
const usersRouter = require('./users');

apiRouter.use('/users', usersRouter)
apiRouter.use('/posts', postsRouter)
apiRouter.use('/tags', tagsRouter)

module.exports = apiRouter;