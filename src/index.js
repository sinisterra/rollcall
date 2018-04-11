const { GraphQLServer, PubSub } = require('graphql-yoga')
const mongoose = require('mongoose')
const find = require('lodash.find')
const path = require('path')
const express = require('express')

mongoose.connect(process.env.MONGOPATH || '')

// MODELS
const PersonSchema = new mongoose.Schema({
  name: String,
  description: String
})

const EventSchema = new mongoose.Schema({
  eventType: String,
  person: PersonSchema,
  rollcall: String,
  timestamp: { type: Date, default: Date.now }
})

const Rollcall = mongoose.model(
  'Rollcall',
  new mongoose.Schema({
    name: String,
    timestamp: { type: Date, default: Date.now },
    createdBy: PersonSchema,
    timeOpens: Date,
    timeCloses: Date,
    events: [EventSchema]
  })
)

const typeDefs = `
  type Person {
    id: ID!
    name: String!
    description: String!
  }

  type Rollcall {
    id: ID!
    name: String!
    description: String!
    createdBy: Person
    timestamp: String!
    timeOpens: String
    timeCloses: String
    events: [Event]
    personCount: Int
  }

  type Event {
    id: ID!
    eventType: EVENT_TYPE
    person: Person
    timestamp: String!
  }

  input PersonInput {
    name: String!
    description: String!
  }

  input RollcallInput {
    name: String!
    description: String!
  }

  type Mutation {
    create(person: PersonInput!, details: RollcallInput!): Rollcall
    answer(person: PersonInput!, rollcall: ID!): Rollcall
  }

  type Query {
    view(id: ID!): Rollcall
    rollcalls: [Rollcall]
  }

  type Subscription {
    live(id: ID!): Rollcall
  }

  enum EVENT_TYPE {
    ROLLCALL_CREATED PERSON_LOGGED
  }
`

const resolvers = {
  Rollcall: {
    personCount: (root, args, context) => {
      return root.events.length || 0
    }
  },
  Query: {
    view: (root, args, context) => {
      return new Promise((resolve, reject) => {
        Rollcall.findById(args.id, (err, rollcall) => {
          if (err) reject(err)
          resolve(rollcall)
        })
      })
    },
    rollcalls: (root, args, context) => {
      return new Promise((resolve, reject) => {
        Rollcall.find({}).exec((err, res) => {
          if (err) resolve(err)
          resolve(res)
        })
      })
    }
  },
  Subscription: {
    live: {
      subscribe: (parent, args, { pubsub }) => {
        const channel = Math.random()
          .toString(36)
          .substring(2, 15) // random channel name

        setInterval(() => {
          Rollcall.findById(args.id, function(err, rollcall) {
            pubsub.publish(channel, { live: rollcall })
          })
        }, 2000)
        return pubsub.asyncIterator(channel)
      }
    }
  },
  Mutation: {
    create: (root, { details, person }, context) => {
      return new Promise((resolve, reject) => {
        const newRollcall = new Rollcall({
          createdBy: person,
          ...details,
          events: [
            {
              eventType: 'PERSON_LOGGED',
              person
            }
          ]
        })

        newRollcall.save(function(err) {
          if (err) reject(err)

          resolve(newRollcall)
        })
      })
    },
    answer: (root, args, context) => {
      return new Promise((resolve, reject) => {
        Rollcall.findById(args.rollcall, {}, (err, doc) => {
          if (err) reject(err)

          // if a person with the same name has been logged, don't save it
          const { events } = doc

          const personIsInEvent = find(
            events,
            e =>
              e.person.name === args.person.name &&
              e.eventType == 'PERSON_LOGGED'
          )

          if (personIsInEvent) {
            resolve(doc)
            return
          }

          doc.events.unshift({
            eventType: 'PERSON_LOGGED',
            person: args.person
          })
          doc.save(err => {
            if (err) reject(err)
            resolve(doc)
          })
        })
      })
    }
  }
}

const pubsub = new PubSub()
const server = new GraphQLServer({ typeDefs, resolvers, context: { pubsub } })
const staticFiles = express.static(path.join(__dirname, '../client/build'))

server.express.use(staticFiles)

server.start(
  {
    port: process.env.PORT || 4000,
    endpoint: '/graphql',
    subscriptions: '/graphql',
    playground: '/playground'
  },
  () => console.log('Server is running on localhost:4000')
)
