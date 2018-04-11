import React, { Component, Fragment } from 'react'
import './App.css'
import { ApolloProvider, Subscription } from 'react-apollo'
import { BrowserRouter, Route } from 'react-router-dom'
import { Landing, Manage, Attend } from './routes'

import gql from 'graphql-tag'
import client from './apollo.client'

class App extends Component {
  render() {
    return (
      <ApolloProvider client={client}>
        <BrowserRouter>
          <Fragment>
            <Route exact path="/" component={Landing} />
            <Route exact path="/event/:id/manage" component={Manage} />
            <Route exact path="/event/:id/attend" component={Attend} />
          </Fragment>
        </BrowserRouter>
      </ApolloProvider>
    )
  }
}

export default App
