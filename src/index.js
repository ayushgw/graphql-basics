import { GraphQLServer } from 'graphql-yoga'
import { users, posts, comments } from './data'
import uuidv4 from 'uuid/v4'

// Type definitions (schema)
const typeDefs = `
    type Query {
        users(query: String): [User!]!
        posts(query: String): [Post!]!
        comments: [Comment!]!
        me: User!
        post: Post!
    }

    type Mutation {
        createUser(name: String!, email: String!, age: Int): User!
        createPost(title: String!, body: String!, published: Boolean!, author: ID!): Post!
        createComment(text: String!, author: ID!, post: ID!): Comment!
    }

    type User {
        id: ID
        name: String!
        email: String!
        age: Int
        posts: [Post!]!
        comments: [Comment!]!
    }

    type Post {
        id: ID!
        title: String!
        body: String!
        published: Boolean!
        author: User!
        comments: [Comment!]!
    }

    type Comment {
        id: ID
        text: String!
        author: User!
        post: Post!
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
        comments(parent, args, ctx, info) {
            return comments
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
    Mutation: {
        createUser(parent, args, ctx, info) {
            const emailTaken = users.some(user => user.email === args.email)

            if(emailTaken) {
                throw new Error('Email Taken!')
            }

            const user = {
                id: uuidv4(),
                ...args
            }

            users.push(user)

            return user
        },
        createPost(parent, args, ctx, info) {
            const userExists = users.some(user => user.id === args.author)

            if(!userExists) {
                throw new Error('User doesn\'t exist!')
            }

            const post = {
                id: uuidv4(),
                ...args
            }

            posts.push(post)

            return post
        },
        createComment(parent, args, ctx, info) {
            const userExists = users.some(user => user.id === args.author)
            const isPostValid = posts.some(post => post.id === args.post && post.published)

            if(!userExists || !isPostValid) {
                throw new Error ('Invalid user or post!')
            }

            const comment = {
                id: uuidv4(),
                ...args
            }

            comments.push(comment)

            return comment
        }
    },
    Post: {
        author(parent, args, ctx, info) {
            return users.find(user => user.id === parent.author)
        },
        comments(parent, args, ctx, info) {
            return comments.filter(comment => comment.post === parent.id)
        }
    },
    User: {
        posts(parent, args, ctx, info) {
            return posts.filter(post => {
                return post.author === parent.id
            })
        },
        comments(parent, args, ctx, info) {
            return comments.filter(comment => comment.author === parent.id)
        }
    },
    Comment: {
        author(parent, args, ctx, info) {
            return users.find(user => user.id === parent.author)
        },
        post(parent, args, ctx, info) {
            return posts.find(post => post.id === parent.post)
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