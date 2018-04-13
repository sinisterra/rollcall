import React from 'react'
import { Mutation, Query } from 'react-apollo'

import gql from 'graphql-tag'
import Typography from 'material-ui/Typography'
import Button from 'material-ui/Button'

import moment from 'moment'
import List, { ListItem, ListItemAvatar, ListItemText } from 'material-ui/List'
import Avatar from 'material-ui/Avatar'
import get from 'lodash.get'

import Grid from 'material-ui/Grid'
import TextField from 'material-ui/TextField'

const LIVE_ROLLCALL = gql`
  query rollcall($id: ID!) {
    view(id: $id) {
      id
      personCount
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

const MUTATION_ANSWER = gql`
  mutation answer($person: PersonInput!, $event: ID!) {
    answer(person: $person, rollcall: $event) {
      id
      personCount
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

class Attend extends React.Component {
  state = {
    person: {
      name: '',
      description: ''
    },
    success: false,
    canRegister: true
  }
  canManage = () =>
    JSON.parse(window.localStorage.getItem('EVENT_MANAGED')) ===
    this.props.match.params.id
  componentDidMount() {
    const registeredEvents =
      JSON.parse(window.localStorage.getItem('EVENTS_REGISTERED') || '[]') || []

    const registeredAs = window.localStorage.getItem('REGISTERED_AS')
    const isManaging = this.canManage()

    if (registeredEvents.indexOf(this.props.match.params.id) !== -1) {
      this.setState({ canRegister: false })
    }

    if (registeredAs || isManaging) {
      this.setState({
        canRegister: false,
        person: JSON.parse(registeredAs) || {}
      })
    }
  }

  updatePerson = e => {
    this.setState({
      person: {
        ...this.state.person,
        [e.target.name]: e.target.value
      }
    })
  }

  submitDetails = onSubmit => e => {
    e.preventDefault()
    const { person } = this.state
    const event = this.props.match.params.id

    onSubmit({ variables: { person, event } }).then(({ data }) => {
      this.setState({ success: true, canRegister: false })
      const currentEvents =
        JSON.parse(window.localStorage.getItem('EVENTS_REGISTERED')) || []
      window.localStorage.setItem(
        'EVENTS_REGISTERED',
        JSON.stringify([...currentEvents, event])
      )

      window.localStorage.setItem('REGISTERED_AS', JSON.stringify(person))
    })
  }

  render() {
    const { person: statePerson, canRegister } = this.state
    const { id } = this.props.match.params

    return (
      <div style={{ padding: 24 }}>
        <Grid container spacing={24}>
          <Grid item xs={12} sm={6}>
            {canRegister ? (
              <div>
                <Mutation mutation={MUTATION_ANSWER}>
                  {(answer, { loading }) => {
                    if (loading) return <div>Cargando...</div>

                    return (
                      <form
                        onSubmit={this.submitDetails(answer)}
                        style={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="headline">
                          Datos de la persona
                        </Typography>
                        <TextField
                          value={this.state.person.name}
                          name="name"
                          label="Nombre Completo"
                          margin="normal"
                          onChange={this.updatePerson}
                          required
                        />
                        <TextField
                          value={this.state.person.description}
                          label="Cargo"
                          name="description"
                          margin="normal"
                          onChange={this.updatePerson}
                        />
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'flex-end',
                            padding: 24
                          }}>
                          <Button
                            variant="raised"
                            color="primary"
                            type="submit">
                            Registrar asistencia
                          </Button>
                        </div>
                      </form>
                    )
                  }}
                </Mutation>
              </div>
            ) : (
              <div>
                <Typography variant="headline">
                  Éxito! Tu asistencia ha sido registrada
                </Typography>
              </div>
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            <Query query={LIVE_ROLLCALL} variables={{ id }} pollInterval={2000}>
              {({ data, loading: loading2 }) => {
                if (loading2)
                  return <div>Cargando lista de asistencia en vivo...</div>
                return (
                  <div>
                    <Typography variant="display2">
                      Lista de asistencia{' '}
                      {`(${get(data, 'view.personCount', 0)})`}
                    </Typography>
                    <Typography variant="body1">
                      Puedes actualizar la página para refrescar la lista de
                      asistencia
                    </Typography>
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
                                <Avatar
                                  style={
                                    person.name === statePerson.name
                                      ? { backgroundColor: '#bada55' }
                                      : {}
                                  }>
                                  {i + 1}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <span>
                                    {person.name === statePerson.name ? (
                                      <b>
                                        <em>{`[Éste es tu registro]  `}</em>
                                      </b>
                                    ) : null}
                                    {` ${person.name} ${
                                      person.description
                                        ? `(${person.description})`
                                        : ''
                                    }`}
                                  </span>
                                }
                                secondary={
                                  <span>
                                    {`${ts.format('LLL')} (${ts.fromNow()})`}
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
              }}
            </Query>
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default Attend
