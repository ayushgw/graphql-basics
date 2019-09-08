import { GraphQLServer } from 'graphql-yoga'

// Dummy users data
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

// Dummy Posts Data 
const posts = [{
    id: 'post1',
    title: 'Post One',
    body: 'This is post one body',
    published: true,
    author: 'user1'
}, {
    id: 'post2',
    title: 'Post Two',
    body: 'This is post two body',
    published: false,
    author: 'user1'
}, {
    id: 'post3',
    title: 'Post Three',
    body: 'This is post three body',
    published: true,
    author: 'user2'
}]

// Type definitions (schema)
const typeDefs = `
    type Query {
        users(query: String): [User!]!
        posts(query: String): [Post!]!
        me: User!
        post: Post!
    }

    type User {
        id: ID
        name: String!
        email: String!
        age: Int
        posts: [Post!]!
    }

    type Post {
        id: ID!
        title: String!
        body: String!
        published: Boolean!
        author: User!
    }
`

// Resolvers 
const resolvers = {
    Query: {
        users(parent, args, ctx, info) {
            if (!args.query) {
                return users
            }

            return users.filter(user => user.name.toLowerCase().includes(args.query.toLowerCase()))
        },
        posts(parent, args, ctx, info) {
            if (!args.query) {
                return posts
            }

            return posts.filter(post => {
                return post.title.toLowerCase().includes(args.query.toLowerCase()) ||
                    post.body.toLowerCase().includes(args.query.toLowerCase())
            })
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
    },
    Post: {
        author(parent, args, ctx, info) {
            return users.find(user => user.id === parent.author)
        }
    },
    User: {
        posts(parent, args, ctx, info) {
            return posts.filter(post => {
                return post.author === parent.id
            })
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