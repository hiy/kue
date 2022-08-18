# Kue

Kue is a simple and mobile-friendly planning poker.
## deploy
### API

```text
$ cd api
$ cp .env.sample .env

[development]
$ cdk deploy

[production]
$ cdk deploy -c target=prod
```

### Client

```text
$ npm i -g vercel

cd client
vercel --prod
```

## TODO

- Long polling support.
- Ignore messages from the server during card selection events.
- Reconnect when websocket connection is closed.
- Add tests.
- Other service integrations.
