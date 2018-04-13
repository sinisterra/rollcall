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
      name: '',
      description: ''
    },
    person: {
      name: '',
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
      window.localStorage.setItem(
        'REGISTERED_AS',
        JSON.stringify(this.state.person)
      )
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
                <div style={{ padding: 24 }}>
                  <Typography variant="display3">Toma de Asistencia</Typography>
                </div>
                <div>
                  <form
                    onSubmit={this.submitDetails(create, data)}
                    style={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="headline">Datos del evento</Typography>
                    <TextField
                      value={this.state.details.name}
                      name="name"
                      margin="normal"
                      fullWidth
                      label="Nombre del Evento"
                      onChange={this.updateDetails}
                      required
                    />
                    <TextField
                      value={this.state.details.description}
                      name="description"
                      margin="normal"
                      fullWidth
                      label="Descripción del Evento"
                      onChange={this.updateDetails}
                    />
                    <div style={{ padding: '24px 0px' }}>
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
                        margin="normal"
                        fullWidth
                      />
                      <TextField
                        value={this.state.person.description}
                        label="Cargo"
                        name="description"
                        margin="normal"
                        fullWidth
                        onChange={this.updatePerson}
                      />
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        padding: 24
                      }}>
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
                    </div>
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
