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
    }
}

export { Subscription as default }