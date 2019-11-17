import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import 'dotenv/config';

import schema from './schema';
import resolvers from './resolvers';
import models, { sequelize } from './models';

// import { createSeedData } from './util';

const app = express();
app.use(cors());

// start Apollo
const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  formatError: (error) => {
    // remove the internal sequelize error message
    // leave only the important validation error
    const message = error.message
      .replace('SequelizeValidationError: ', '')
      .replace('Validation error: ', '');
    return {
      ...error,
      message
    };
  },
  context: async () => ({
    models,
    me: models.User.findByLogin('rwieruch')
  })
});
server.applyMiddleware({ app, path: '/graphql' });

const eraseDatabaseOnSync = true;
const createSeedData = async () => {
  await models.User.create(
    {
      username: 'rwieruch',
      messages: [
        {
          text: 'Published the Road to learn React'
        }
      ]
    },
    {
      include: [models.Message]
    }
  );
  await models.User.create(
    {
      username: 'ddavids',
      messages: [
        {
          text: 'Happy to release ...'
        },
        {
          text: 'Published a complete ...'
        }
      ]
    },
    {
      include: [models.Message]
    }
  );
};

// connect to Postgres
sequelize.sync({ force: eraseDatabaseOnSync }).then(async () => {
  // seed dev data
  if (eraseDatabaseOnSync) {
    await createSeedData();
  }

  app.listen({ port: process.env.PORT }, () => {
    console.log('Apollo Server on http://localhost:8000/graphql');
  });
});
