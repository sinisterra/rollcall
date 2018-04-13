import React from 'react'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import Grid from 'material-ui/Grid'
import Typography from 'material-ui/Typography'
import Button from 'material-ui/Button'
import { CircularProgress } from 'material-ui/Progress'

import moment from 'moment'
import List, { ListItem, ListItemAvatar, ListItemText } from 'material-ui/List'
import Avatar from 'material-ui/Avatar'
import get from 'lodash.get'
import QRCode from 'qrcode.react'
import csvexport from '../csvexport'

const QUERY_FIND_ROLLCALL = gql`
  query findRollcall($id: ID!) {
    view(id: $id) {
      id
    }
  }
`
const LIVE_ROLLCALL = gql`
  query rollcall($id: ID!) {
    view(id: $id) {
      id
      personCount
      timestamp
      events {
        id
        person {
          id
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
            console.log(window.location.protocol)
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
                      <pre>
                        {`${window.location.protocol}//${
                          window.location.host
                        }/event/${id}/attend`}
                      </pre>
                    </div>
                    <div>
                      <Button variant="raised" onClick={this.reset}>
                        Reiniciar
                      </Button>
                    </div>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Query
                      query={LIVE_ROLLCALL}
                      variables={{ id }}
                      pollInterval={2000}>
                      {({ data, loading: loading2 }) => {
                        if (loading2)
                          return (
                            <div>Cargando lista de asistencia en vivo...</div>
                          )
                        else {
                          const stringified = csvexport(
                            get(data, 'view.events', [])
                          )
                          return (
                            <div>
                              <Typography variant="display2">
                                Lista de asistencia{' '}
                                {`(${get(data, 'view.personCount', 0)})`}
                              </Typography>
                              <Typography variant="body1">
                                Puedes actualizar la página para refrescar la
                                lista de asistencia
                              </Typography>
                              <div
                                style={{
                                  padding: 16
                                }}>
                                <Button
                                  download={`attendance_${moment(
                                    get(data, 'view.timestamp', '')
                                  ).format()}.csv`}
                                  component="a"
                                  href={stringified}
                                  color="primary"
                                  variant="raised">
                                  Descargar archivo
                                </Button>
                              </div>
                              <List>
                                {get(data, 'view.events', []) === [] ? (
                                  <Typography variant="display2">
                                    Aún no hay asistentes registrados
                                  </Typography>
                                ) : null}
                                {get(data, 'view.events', []).map(
                                  ({ person, timestamp }, i) => {
                                    const ts = moment(timestamp)
                                    return (
                                      <ListItem key={i}>
                                        <ListItemAvatar>
                                          <Avatar>{i + 1}</Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                          primary={` ${person.name} ${
                                            person.description
                                              ? `(${person.description})`
                                              : ''
                                          }`}
                                          secondary={
                                            <span>
                                              {`${ts.format(
                                                'LLL'
                                              )} (${ts.fromNow()})`}
                                            </span>
                                          }
                                        />
                                      </ListItem>
                                    )
                                  }
                                )}
                              </List>
                            </div>
                          )
                        }
                      }}
                    </Query>
                  </Grid>
                </Grid>
              </div>
            )
          } else {
            if (loading) return <CircularProgress />
            return (
              <div>
                <Typography variant="display1">
                  No creaste éste evento, así que no lo puedes gestionar.
                </Typography>
              </div>
            )
          }
        }}
      </Query>
    )
  }
}

export default Manage
