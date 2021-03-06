import React, { Component, Fragment } from 'react'
import './App.css'
import { ApolloProvider } from 'react-apollo'
import { BrowserRouter, Route } from 'react-router-dom'
import { Landing, Manage, Attend } from './routes'
import 'moment/locale/es'
import moment from 'moment'

import client from './apollo.client'

moment.lang('es')

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
