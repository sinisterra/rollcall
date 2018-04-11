import React from 'react'
import Typography from 'material-ui/Typography'
import Button from 'material-ui/Button'
import gql from 'graphql-tag'
import TextField from 'material-ui/TextField'
import Divider from 'material-ui/Divider'
import { Mutation } from 'react-apollo'
import { CircularProgress } from 'material-ui/Progress'

const MUTATION_CREATE = gql`
  mutation create($person: PersonInput!, $details: RollcallInput!) {
    create(person: $person, details: $details) {
      id
    }
  }
`

const flexCenterCenter = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}

class Landing extends React.Component {
  state = {
    details: {
      name: 'Evento',
      description: 'Descripción del Evento'
    },
    person: {
      name: 'Santiago Sinisterra',
      description: ''
    }
  }

  componentDidMount() {
    const isManaging = window.localStorage.getItem('EVENT_MANAGED')

    if (isManaging) {
      this.props.history.push(`/event/${JSON.parse(isManaging)}/manage`)
    }
  }

  updateDetails = e => {
    this.setState({
      details: {
        ...this.state.details,
        [e.target.name]: e.target.value
      }
    })
  }

  updatePerson = e => {
    this.setState({
      person: {
        ...this.state.person,
        [e.target.name]: e.target.value
      }
    })
  }

  submitDetails = (mutation, inputData) => e => {
    e.preventDefault()
    const { details, person } = this.state
    mutation({
      variables: {
        details,
        person
      }
    }).then(({ data }) => {
      console.log(data)
      window.localStorage.setItem(
        'EVENT_MANAGED',
        JSON.stringify(data.create.id)
      )
      this.props.history.push(`/event/${data.create.id}/manage`)
    })
  }

  render() {
    return (
      <Mutation mutation={MUTATION_CREATE}>
        {(create, { data, loading }) => {
          return (
            <div style={{ ...flexCenterCenter, height: '100vh' }}>
              <div style={{ ...flexCenterCenter, flexDirection: 'column' }}>
                <Typography variant="display4">Toma de Asistencia</Typography>
                <div>
                  <form onSubmit={this.submitDetails(create, data)}>
                    <div>
                      <Typography variant="headline">
                        Datos del evento
                      </Typography>
                      <TextField
                        value={this.state.details.name}
                        name="name"
                        label="Nombre del Evento"
                        onChange={this.updateDetails}
                        required
                      />
                      <TextField
                        value={this.state.details.description}
                        name="description"
                        onChange={this.updateDetails}
                      />
                      <Divider />
                    </div>
                    <div>
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
                    </div>

                    {!loading ? (
                      <Button
                        variant="raised"
                        type="submit"
                        color="primary"
                        disabled={loading}>
                        Comenzar
                      </Button>
                    ) : (
                      <CircularProgress />
                    )}
                  </form>
                </div>
              </div>
            </div>
          )
        }}
      </Mutation>
    )
  }
}

export default Landing
