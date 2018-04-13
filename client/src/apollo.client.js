import { HttpLink } from 'apollo-link-http'
import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
const cache = new InMemoryCache()

// Create an http link:
const httpLink = new HttpLink({
  uri: '/graphql'
})

const link = httpLink

const client = new ApolloClient({
  link,
  cache
})

export default client
