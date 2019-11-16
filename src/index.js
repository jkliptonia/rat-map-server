import express from 'express';
import { ApolloServer, gql } from 'apollo-server-express';
import cors from 'cors';

const app = express();
app.use(cors());

const schema = gql`
  type Query {
    users: [User!]
    me: User
    user(id: ID!): User
  }
  type User {
    id: ID!
    username: String!
  }
  type Mutation {
    createUser(name: String!): User!
    deleteUser(id: ID!): Boolean!
  }
`;

let users = {
  1: {
    id: '1',
    username: 'Robin Wieruch'
  },
  2: {
    id: '2',
    username: 'Dave Davids'
  }
};
const me = users[1];
const resolvers = {
  Query: {
    users: () => Object.values(users),
    user: (parent, { id }) => users[id],
    me: () => me
  },
  User: {
    username: user => user.username
  },
  Mutation: {
    createUser: (parent, { name }) => {
      const user = {
        id: Object.keys(users).length + 1,
        username: name
      };

      users[user.id] = user;
      return user;
    },
    deleteUser: (parent, { id }) => {
      const { [id]: user, ...otherUsers } = users;
      if (!user) {
        return false;
      }
      users = otherUsers;
      return true;
    }
  }
};

const server = new ApolloServer({
  typeDefs: schema,
  resolvers
});
server.applyMiddleware({ app, path: '/graphql' });
app.listen({ port: 8000 }, () => {
  console.log('Apollo Server on http://localhost:8000/graphql');
});
