const Subscription = {
    count: {
        subscribe(parent, args, { pubsub }, info) {
            let count = 0

            setInterval(() => {
                count++
                pubsub.publish('counter', {
                    count
                })
            } ,1000)

            // To keep listening to 'counter' connection
            return pubsub.asyncIterator('counter')
        }
    },
    comment: {
        subscribe(parent, { postId }, { db, pubsub }, info) {
            const post = db.posts.find(post => post.id === postId && post.published)

            if(!post) {
                throw new Error('Post not found!')
            }

            return pubsub.asyncIterator(`comment ${postId}`)
        }
    }
}

export { Subscription as default }