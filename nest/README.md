# Nest.js

## Development

### pnpm

1. Install Node.js
2. Install pnpm: `npm install -g pnpm`
3. Install dependencies: `pnpm install`

### WebStorm

Settings >> Languages & Frameworks >> JavaScript Runtime >> Package manager: `~\AppData\Roaming\npm\pnpm.cmd`

### Environment Variables

- Copy `./.env.example` and rename it to `.env`, then fill in the Env variables.
- Copy `./firebaseConfig.example.json` and rename it to `./firebaseConfig.json`, then fill in the Env variables.
- Copy `./serviceAccountKey.example.json` and rename it to `./serviceAccountKey.json`, then fill in the Env variables.

### Run

```bash
pnpm run dev
```

## OpenAPI

### Requirements

1. Install openapi-generator-cli globally.
    ```bash
    npm i -g @openapitools/openapi-generator-cli@latest
    ```
2. Install Java.
3. Install Python.
4. Install openapi-python-client.
    ```bash
    pip install --upgrade openapi-python-client
    ```

### Generate Client Package

```bash
rm -r ../next/client/nest # TypeScript
rm -r ../fastapi/app/client # Python
```

```bash
# TypeScript
openapi-generator-cli generate -i http://localhost:3001/docs-json -g typescript-axios -o ../next/client/nest

# Python
openapi-python-client generate --url http://localhost:3001/docs-json --output-path ../fastapi/app/client
```

## Run

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
