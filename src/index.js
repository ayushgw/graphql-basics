import { GraphQLServer } from 'graphql-yoga'
// import { users, posts, comments } from './data'
import uuidv4 from 'uuid/v4'

// Dummy users data
let users = [{
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
let posts = [{
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

// Dummy Comments Data
let comments = [{
    id: 'com1',
    text: 'Dummy Comment One',
    author: 'user3',
    post: 'post1'
}, {
    id: 'com2',
    text: 'Dummy Comment Two',
    author: 'user2',
    post: 'post1'
}, {
    id: 'com3',
    text: 'Dummy Comment Three',
    author: 'user1',
    post: 'post3'
}, {
    id: 'com4',
    text: 'Dummy Comment Four',
    author: 'user2',
    post: 'post2'
}]

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
        createUser(data: CreateUserInput!): User!
        deleteUser(id: ID!): User!
        createPost(data: CreatePostInput!): Post!
        createComment(data: CreateCommentInput!): Comment!
    }

    input CreateUserInput {
        name: String!
        email: String!
        age: Int
    }

    input CreatePostInput {
        title: String!
        body: String!
        published: Boolean!
        author: ID!
    }

    input CreateCommentInput {
        text: String!
        author: ID!
        post: ID!
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
            const emailTaken = users.some(user => user.email === args.data.email)

            if (emailTaken) {
                throw new Error('Email Taken!')
            }

            const user = {
                id: uuidv4(),
                ...args.data
            }

            users.push(user)

            return user
        },
        deleteUser(parent, args, ctx, info) {
            const userIndex = users.findIndex(user => user.id === args.id)

            if(userIndex === -1) {
                throw new Error('User not found!')
            }

            const deletedUsers = users.splice(userIndex, 1)

            // Removing ALL User-Associated Content
            // Removing ALL posts created by the user
            posts = posts.filter(post => {
                const match = post.author === args.id

                if(match) {
                    // Removing ALL comments on this post (by any user)
                    comments = comments.filter(comment => comment.post !== post.id)
                }
                
                return !match
            })

            // Removing ALL comments made by the user (on any post)
            comments = comments.filter(comment => comment.author !== args.id)

            return deletedUsers[0]
        },
        createPost(parent, args, ctx, info) {
            const userExists = users.some(user => user.id === args.data.author)

            if (!userExists) {
                throw new Error('User doesn\'t exist!')
            }

            const post = {
                id: uuidv4(),
                ...args.data
            }

            posts.push(post)

            return post
        },
        createComment(parent, args, ctx, info) {
            const userExists = users.some(user => user.id === args.data.author)
            const isPostValid = posts.some(post => post.id === args.data.post && post.published)

            if (!userExists || !isPostValid) {
                throw new Error('Invalid user or post!')
            }

            const comment = {
                id: uuidv4(),
                ...args.data
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