# FastAPI

## Development

### Python uv

1. Install uv: `powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"`
2. Install Python in uv: `uv python install 3.12`; upgrade Python in uv: `uv python upgrade 3.12`
3. Configure requirements:
  ```bash
  uv sync --refresh
  ```

### PyCharm

Add New Interpreter >> Add Local Interpreter
  - Environment: Select existing
  - Type: uv

### Environment Variables

- Copy `./.env.example` and rename it to `.env`, then fill in the Env variables.

## OpenAPI

### Requirements

1. Install openapi-generator-cli globally.
  ```bash
  npm i -g @openapitools/openapi-generator-cli@latest
  ```
2. Install Java.

### Generate Client Package

```bash
rm -r ../next/src/client/fastapi
```
```bash
openapi-generator-cli generate -i http://localhost:8000/openapi.json -g typescript-axios -o ../next/src/client/fastapi
```
