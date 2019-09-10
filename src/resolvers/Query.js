const Query = {
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
        return db.comments
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

export { Query as default }