# myqa-backend

This is the backend for myqa.

## Setup

Run `npm install` on the cloned repository directory

## Run

Run `npm start`.

## Configuration

Local configuration should be added to a `config/local.js` file which will overwrite `config/default.js`.

## Docker

A Dockerfile is supplied with this project. To build the image run:

```
docker build -t myqa-backend .
```

Then run the image. You can specify any environment variable listed in `config/custom-environment-variables`. For instance:

```
docker run -e SERVER_PORT=3333 -p 3333:3333 -it myqa-backend
```
