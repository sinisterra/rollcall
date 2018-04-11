import React, { Component } from 'react'
import logo from './logo.svg'
import './App.css'
import { ApolloProvider, Subscription } from 'react-apollo'
import gql from 'graphql-tag'
import client from './apollo.client'

const LIVE_ROLLCALL = gql`
  subscription rollcall {
    live(id: "5acd86411640c22b278b7ad2") {
      id
      personCount
    }
  }
`

class App extends Component {
  render() {
    return (
      <ApolloProvider client={client}>
        <Subscription subscription={LIVE_ROLLCALL}>
          {({ data, loading }) => {
            if (loading) return <div>Cargando...</div>
            return (
              <h4>
                <pre>{JSON.stringify(data, null, 2)}</pre>
              </h4>
            )
          }}
        </Subscription>
        <div>
          <h2>Hello there!</h2>
        </div>
      </ApolloProvider>
    )
  }
}

export default App
