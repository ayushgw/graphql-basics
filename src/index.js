import { GraphQLServer } from 'graphql-yoga'
import uuidv4 from 'uuid/v4'
import db from './db'


// Resolvers 
const resolvers = {
    Query: {
        users(parent, args, { db }, info) {
            if (!args.query) {
                return db.users
            }

            return db.users.filter(user => user.name.toLowerCase().includes(args.query.toLowerCase()))
        },
        posts(parent, args, { db }, info) {
            if (!args.query) {
                return db.posts
            }

            return db.posts.filter(post => {
                return post.title.toLowerCase().includes(args.query.toLowerCase()) ||
                    post.body.toLowerCase().includes(args.query.toLowerCase())
            })
        },
        comments(parent, args, { db }, info) {
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
        createUser(parent, args, { db }, info) {
            const emailTaken = db.users.some(user => user.email === args.data.email)

            if (emailTaken) {
                throw new Error('Email Taken!')
            }

            const user = {
                id: uuidv4(),
                ...args.data
            }

            db.users.push(user)

            return user
        },
        deleteUser(parent, args, { db }, info) {
            const userIndex = db.users.findIndex(user => user.id === args.id)

            if (userIndex === -1) {
                throw new Error('User not found!')
            }

            const deletedUsers = db.users.splice(userIndex, 1)

            // Removing ALL User-Associated Content
            // Removing ALL posts created by the user
            db.posts = db.posts.filter(post => {
                const match = post.author === args.id

                if (match) {
                    // Removing ALL comments on this post (by any user)
                    db.comments = db.comments.filter(comment => comment.post !== post.id)
                }

                return !match
            })

            // Removing ALL comments made by the user (on any post)
            db.comments = db.comments.filter(comment => comment.author !== args.id)

            return deletedUsers[0]
        },
        createPost(parent, args, { db }, info) {
            const userExists = db.users.some(user => user.id === args.data.author)

            if (!userExists) {
                throw new Error('User doesn\'t exist!')
            }

            const post = {
                id: uuidv4(),
                ...args.data
            }

            db.posts.push(post)

            return post
        },
        deletePost(parent, args, { db }, info) {
            const postIndex = db.posts.findIndex(post => post.id === args.id)

            if (postIndex === -1) {
                throw new Error('No post found!')
            }

            const deletedPosts = db.posts.splice(postIndex, 1)

            db.comments = db.comments.filter(comment => comment.post !== args.id)

            return deletedPosts[0]
        },
        createComment(parent, args, { db }, info) {
            const userExists = db.users.some(user => user.id === args.data.author)
            const isPostValid = db.posts.some(post => post.id === args.data.post && post.published)

            if (!userExists || !isPostValid) {
                throw new Error('Invalid user or post!')
            }

            const comment = {
                id: uuidv4(),
                ...args.data
            }

            db.comments.push(comment)

            return comment
        },
        deleteComment(parent, args, { db }, info) {
            const commentIndex = db.comments.findIndex(comment => comment.id === args.id)

            if(commentIndex === -1) {
                throw new Error('Comment not found!')
            }

            // Splice returns an array containing the deleted items
            const deletedComments = db.comments.splice(commentIndex, 1)

            return deletedComments[0]
        }
    },
    Post: {
        author(parent, args, { db }, info) {
            return db.users.find(user => user.id === parent.author)
        },
        comments(parent, args, { db }, info) {
            return db.comments.filter(comment => comment.post === parent.id)
        }
    },
    User: {
        posts(parent, args, { db }, info) {
            return db.posts.filter(post => {
                return post.author === parent.id
            })
        },
        comments(parent, args, { db }, info) {
            return db.comments.filter(comment => comment.author === parent.id)
        }
    },
    Comment: {
        author(parent, args, { db }, info) {
            return db.users.find(user => user.id === parent.author)
        },
        post(parent, args, { db }, info) {
            return db.posts.find(post => post.id === parent.post)
        }
    }
}

const server = new GraphQLServer({
    typeDefs: './src/schema.graphql',
    resolvers,
    context: {
        db
    }
})

server.start(() => {
    console.log('Server is up!');
})