# Rollcall

A friendly Roll call app powered by GraphQL

## Installation

`yarn && cd client && yarn`

## Running locally

Make sure the following environment variables are set in your `.env` file

```
export MONGOPATH=<path-to-your-mongodb-instance>
```

Then

```
source .env
yarn dev
```

Open a new terminal, then run

```
cd client
yarn start
```

The app will be available on `http://localhost:3000`

## Deploying to Heroku

* Fork this repository
* Bind your forked Github repo to a Heroku app
* Configure your environment vars so MONGOPATH is exported
