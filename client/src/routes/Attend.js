import React from 'react'
import { Mutation, Query, Subscription } from 'react-apollo'

import gql from 'graphql-tag'
import Typography from 'material-ui/Typography'
import Button from 'material-ui/Button'

import moment from 'moment'
import List, { ListItem, ListItemAvatar, ListItemText } from 'material-ui/List'
import Avatar from 'material-ui/Avatar'
import get from 'lodash.get'

import TextField from 'material-ui/TextField'

const LIVE_ROLLCALL = gql`
  subscription rollcall($id: ID!) {
    live(id: $id) {
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

  componentDidMount() {
    const registeredEvents =
      JSON.parse(window.localStorage.getItem('EVENTS_REGISTERED') || '[]') || []

    const registeredAs = window.localStorage.getItem('REGISTERED_AS')

    if (registeredEvents.indexOf(this.props.match.params.id) !== -1) {
      this.setState({ canRegister: false })
    }

    if (registeredAs) {
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
    const { person: statePerson, canRegister, success } = this.state
    const { id } = this.props.match.params

    return (
      <div>
        {canRegister ? (
          <div>
            <Mutation mutation={MUTATION_ANSWER}>
              {(answer, { loading }) => {
                if (loading) return <div>Cargando...</div>

                return (
                  <form onSubmit={this.submitDetails(answer)}>
                    <Typography variant="headline">
                      Datos de la persona
                    </Typography>
                    <TextField
                      value={this.state.person.name}
                      name="name"
                      label="Nombre Completo"
                      onChange={this.updatePerson}
                      required
                    />
                    <TextField
                      value={this.state.person.description}
                      label="Cargo"
                      name="description"
                      onChange={this.updatePerson}
                    />
                    <Button variant="raised" type="submit">
                      Registrar asistencia
                    </Button>
                  </form>
                )
              }}
            </Mutation>
          </div>
        ) : (
          <div>Ya te has registrado</div>
        )}
        <Subscription subscription={LIVE_ROLLCALL} variables={{ id }}>
          {({ data, loading: loading2 }) => {
            if (loading2)
              return <div>Cargando lista de asistencia en vivo...</div>
            return (
              <div>
                <Typography variant="display2">
                  Lista de asistencia {`(${get(data, 'live.personCount', 0)})`}
                </Typography>
                <List>
                  {get(data, 'live.events', []) === [] ? (
                    <Typography variant="display2">
                      Aún no hay asistentes registrados
                    </Typography>
                  ) : null}
                  {get(data, 'live.events', []).map(
                    ({ person, timestamp }, i) => (
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
                              {`Registro de asistencia: ${moment(
                                timestamp
                              ).fromNow()}`}{' '}
                            </span>
                          }
                        />
                      </ListItem>
                    )
                  )}
                </List>
              </div>
            )
          }}
        </Subscription>
      </div>
    )
  }
}

export default Attend
