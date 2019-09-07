import { GraphQLServer } from 'graphql-yoga'

// Demo user data
const users = [{
    id: 'user1',
    name: 'Ayush Gosi',
    age: 27,
    email: 'ayush@example.com'
}, {
    id: 'user2',
    name: 'Bruce Wayne',
    email: 'bruce@example.com'
}, {
    id: 'user3',
    name: 'Barry Allen',
    age: 35,
    email: 'barry@example.com'
}]

// Type definitions (schema)
const typeDefs = `
    type Query {
        users(query: String): [User!]!
        me: User!
        post: Post!
    }

    type User {
        id: ID
        name: String!
        email: String!
        age: Int
    }

    type Post {
        id: ID!
        title: String!
        body: String!
        published: Boolean!
    }
`

// Resolvers 
const resolvers = {
    Query: {
        users(parent, args, ctx, info) {
            if(!args.query) {
                return users
            }
            
            return users.filter(user => user.name.toLowerCase().includes(args.query.toLowerCase()))
        },
        me() {
            return {
                id: '123mk2l3',
                name: 'Barry Allen',
                email: 'barry@example.com'
            }
        },
        post() {
            return {
                id: 'post1234',
                title: 'How fast is Flash?',
                body: 'Could surpass the speed of light!',
                published: false
            }
        }
    }
}

const server = new GraphQLServer({
    typeDefs,
    resolvers
})

server.start(() => {
    console.log('Server is up!');
})