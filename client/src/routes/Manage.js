import React from 'react'
import gql from 'graphql-tag'
import { Query, Subscription } from 'react-apollo'
import Grid from 'material-ui/Grid'
import Typography from 'material-ui/Typography'
import Button from 'material-ui/Button'

import moment from 'moment'
import List, { ListItem, ListItemAvatar, ListItemText } from 'material-ui/List'
import Avatar from 'material-ui/Avatar'
import get from 'lodash.get'
import QRCode from 'qrcode.react'

const QUERY_FIND_ROLLCALL = gql`
  query findRollcall($id: ID!) {
    view(id: $id) {
      id
    }
  }
`
const LIVE_ROLLCALL = gql`
  subscription rollcall($id: ID!) {
    live(id: $id) {
      id
      personCount
      events {
        id
        person {
          name
          description
        }
        timestamp
      }
    }
  }
`

class Manage extends React.Component {
  state = {
    rollcallExists: false
  }

  canManage = () =>
    JSON.parse(window.localStorage.getItem('EVENT_MANAGED')) ===
    this.props.match.params.id

  reset = () => {
    const confirmation = window.confirm(
      'Estás seguro de que quieres registrar otro evento?'
    )

    if (confirmation) {
      window.localStorage.clear()
      this.props.history.push('/')
    }
  }

  render() {
    const { id } = this.props.match.params
    return (
      <Query query={QUERY_FIND_ROLLCALL} variables={{ id }}>
        {({ data: mydata, loading }) => {
          if (!loading && mydata && this.canManage()) {
            return (
              <div style={{ padding: 24 }}>
                <Grid spacing={24} container>
                  <Grid item xs={12} md={6}>
                    <div>
                      <QRCode
                        value={`${window.location.protocol}//${
                          window.location.host
                        }/event/${id}/attend`}
                        size={512}
                      />
                    </div>
                    <div>
                      <Button variant="raised" onClick={this.reset}>
                        Reiniciar
                      </Button>
                    </div>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Subscription
                      subscription={LIVE_ROLLCALL}
                      variables={{ id }}>
                      {({ data, loading: loading2 }) => {
                        if (loading2)
                          return (
                            <div>Cargando lista de asistencia en vivo...</div>
                          )
                        return (
                          <div>
                            <Typography variant="display2">
                              Lista de asistencia{' '}
                              {`(${get(data, 'live.personCount', 0)})`}
                            </Typography>
                            <List>
                              {get(data, 'live.events', []) === [] ? (
                                <Typography variant="display2">
                                  Aún no hay asistentes registrados
                                </Typography>
                              ) : null}
                              {get(data, 'live.events', []).map(
                                ({ person, timestamp }, i) => (
                                  <ListItem key={person.id}>
                                    <ListItemAvatar>
                                      <Avatar>{i + 1}</Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                      primary={`${person.name} ${
                                        person.description
                                          ? `(${person.description})`
                                          : ''
                                      }`}
                                      secondary={`Registro de asistencia: ${moment(
                                        timestamp
                                      ).fromNow()}`}
                                    />
                                  </ListItem>
                                )
                              )}
                            </List>
                          </div>
                        )
                      }}
                    </Subscription>
                  </Grid>
                </Grid>
              </div>
            )
          } else
            return (
              <div>
                <Typography variant="display1">
                  No creaste éste evento, así que no lo puedes gestionar.
                </Typography>
              </div>
            )
        }}
      </Query>
    )
  }
}

export default Manage
