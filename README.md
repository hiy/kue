# Kue

Kue is a simple and mobile-friendly planning poker.

![screen](https://user-images.githubusercontent.com/2444124/185391483-81e2e651-7728-4094-8083-509c0e2e79b7.png)

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
