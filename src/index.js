import { GraphQLServer } from 'graphql-yoga'

// Type definitions (schema)
const typeDefs = `
    type Query {
        title: String!
        price: Float!
        releaseYear: Int
        rating: Float
        inStock: Boolean!
    }
`

// Resolvers 
const resolvers = {
    Query: {
        title() {
            return 'Vibhuti'
        },
        price() {
            return 2.99
        },
        releaseYear() {
            return 2018
        },
        rating() {
            return 3.66
        },
        inStock() {
            return false
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