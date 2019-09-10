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

        if(!user) {
            throw new Error('User not found!')
        }

        if(typeof data.email === 'string') {
            const emailTaken = db.users.some(user => user.email === data.email)

            if(emailTaken) {
                throw new Error('Email is in use!')
            }

            user.email = data.email
        }

        if(typeof data.name === 'string') {
            user.name = data.name
        }

        if(typeof data.age !== 'undefined') {
            user.age = data.age
        }

        return user
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
}

export { Mutation as default }