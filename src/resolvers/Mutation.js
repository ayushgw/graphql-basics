import uuidv4 from 'uuid/v4'

const Mutation = {
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
    updateUser(parent, args, { db }, info) {
        const { id, data } = args
        const user = db.users.find(user => user.id === id)

        if (!user) {
            throw new Error('User not found!')
        }

        if (typeof data.email === 'string') {
            const emailTaken = db.users.some(user => user.email === data.email)

            if (emailTaken) {
                throw new Error('Email is in use!')
            }

            user.email = data.email
        }

        if (typeof data.name === 'string') {
            user.name = data.name
        }

        if (typeof data.age !== 'undefined') {
            user.age = data.age
        }

        return user
    },
    createPost(parent, args, { db, pubsub }, info) {
        const userExists = db.users.some(user => user.id === args.data.author)

        if (!userExists) {
            throw new Error('User doesn\'t exist!')
        }

        const post = {
            id: uuidv4(),
            ...args.data
        }

        db.posts.push(post)

        if (post.published) {
            pubsub.publish('post', {
                post: {
                    mutation: 'CREATED',
                    data: post
                }
            })
        }

        return post
    },
    deletePost(parent, args, { db, pubsub }, info) {
        const postIndex = db.posts.findIndex(post => post.id === args.id)

        if (postIndex === -1) {
            throw new Error('No post found!')
        }

        const [post] = db.posts.splice(postIndex, 1)

        db.comments = db.comments.filter(comment => comment.post !== args.id)

        if (post.published) {
            pubsub.publish('post', {
                post: {
                    mutation: 'DELETED',
                    data: post
                }
            })
        }

        return post
    },
    updatePost(parent, args, { db, pubsub }, info) {
        const { id, data } = args
        const post = db.posts.find(post => post.id === id)
        const originalPost = { ...post }

        if (!post) {
            throw new Error('No post found!')
        }

        if (typeof data.title === 'string') {
            post.title = data.title
        }

        if (typeof data.body === 'string') {
            post.body = data.body
        }

        if (typeof data.published === 'boolean') {
            post.published = data.published

            if (!originalPost.published && post.published) {
                // Created Event
                pubsub.publish('post', {
                    post: {
                        mutation: 'CREATED',
                        data: post
                    }
                })
            }
            else if (originalPost.published && !post.published) {
                // Deleted Event
                pubsub.publish('post', {
                    post: {
                        mutation: 'DELETED',
                        data: originalPost // returning 'originalPost' instead of 'post' on DELETED to prevent exposing updates that user might not want anyone to see
                    }
                })
            }
        } else if (post.published) {
            // Updated Event
            pubsub.publish('post', {
                post: {
                    mutation: 'UPDATED',
                    data: post
                }
            })
        }

        return post
    },
    createComment(parent, args, { db, pubsub }, info) {
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
        pubsub.publish(`comment ${args.data.post}`, { comment })

        return comment
    },
    deleteComment(parent, args, { db }, info) {
        const commentIndex = db.comments.findIndex(comment => comment.id === args.id)

        if (commentIndex === -1) {
            throw new Error('Comment not found!')
        }

        // Splice returns an array containing the deleted items
        const deletedComments = db.comments.splice(commentIndex, 1)

        return deletedComments[0]
    },
    updateComment(parent, args, { db }, info) {
        const { id, data } = args
        const comment = db.comments.find(comment => comment.id === id)

        if (!comment) {
            throw new Error('No comment found!')
        }

        if (typeof data.text === 'string') {
            comment.text = data.text
        }

        return comment
    }
}

export { Mutation as default }