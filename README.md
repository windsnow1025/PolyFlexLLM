# PolyFlexLLM

A full-stack web platform for interacting with various LLMs (OpenAI, Gemini, Claude), featuring full conversation context control, and Markdown + LaTeX rendering.

## Tech Stack

- **Front End**: Node.js, React.js, Next.js, Tailwind CSS, MUI
- **Back End**: Node.js (Nest.js), Python (FastAPI)
- **Storage**: PostgreSQL, RustFS, Redis
- **Authentication**: Firebase (Email Verification)
- **Infrastructure**: Linux (Debian 12), Kubernetes (K3S), Nginx
- **DevOps**: GitHub Actions
- **Payment**: Creem

## Live Demo

[https://www.windsnow1025.com](https://www.windsnow1025.com)

## Setup

### Prepare Environment

1. Copy `./app-secret.example.yaml` to `./app-secret.yaml` and `./app-secret-test.yaml`, modify value for each key.

### Debian Production

1. Create and configure a Debian VM with at least 4GB RAM
2. JetBrains IDEA >> `Settings` >> `SSH Configurations`: login as root

### Nginx Installation

1. Install Nginx with Stream module
2. In `<nginx_config_path>`: create `./nginx.conf` and `./sites-available/default`

    - Stream Block in `./nginx.conf`:
      ```
      stream {
          server {
              listen 3306;
              proxy_pass localhost:33306;
          }
          server {
              listen 6379;
              proxy_pass localhost:36379;
          }
          server {
              listen 9000;
              proxy_pass localhost:39000;
          }
      }
      ```
    
    - HTTP Block in `./sites-available/default`:
      ```
      server {
      
        server_name <domain_name>;
      
        client_max_body_size 100M;
      
          location / {
              proxy_pass http://localhost:30080/;
              
              proxy_buffering off;
              proxy_request_buffering off;
      
              proxy_set_header Host $http_host;
              proxy_set_header X-Real-IP $remote_addr;
              proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
              proxy_set_header X-Forwarded-Proto $scheme;
              proxy_set_header X-Forwarded-Port $server_port;
              proxy_set_header X-Forwarded-Host $host;
      
              proxy_http_version 1.1;
              proxy_set_header Upgrade $http_upgrade;
              proxy_set_header Connection "upgrade";
          }
      
          location /kubernetes/ {
              proxy_pass https://localhost:38443/;
      
              proxy_ssl_verify off;
      
              proxy_set_header Host $http_host;
              proxy_set_header X-Real-IP $remote_addr;
              proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
              proxy_set_header X-Forwarded-Proto $scheme;
              proxy_set_header X-Forwarded-Port $server_port;
              proxy_set_header X-Forwarded-Host $host;
          }
      }
      ```

#### Config and Environment Setup

JetBrains IDEA >> `Settings` >> `Build, Execution, Deployment` >> `Deployment`
1. Add `SFTP`
2. Add `Mapping`
    - Deployment Path: `/root/kubernetes`, Local Path: `./kubernetes`
    - Deployment Path: `/etc/nginx`, Local Path: `<nginx_config_path>`
3. Select `Deployment Path`s in `Remote Host`: `Sync with local...`

#### Nginx Configuration

1. Install Certbot
2. Nginx `Sync with local`

#### K3S Installation and Configuration

See `./K3S.md`

#### Apply Custom Configs

See `./KubernetesCommand.md`

#### Usage

- Main
  - `http://localhost:30080/`
  - `https://<domain_name>/`
- Kubernetes Dashboard
  - `https://localhost:38443/`
  - `https://<domain_name>/kubernetes/`

### Development

#### Windows Develop Environment

1. Setup and run K3S in Test Server.
2. Setup and run Next.js, Nest.js, FastAPI separately by JetBrains IDE according to their documentations.
  - Configure Next.js backend URL in UI - Settings - Developer - API Base URL.
  - Configure FastAPI related backend URL in environment variables.

#### CI/CD

GitHub >> Repository >> Settings >> Security >> Secrets and variables >> Actions
- Secrets >> Repository secrets: add `DOCKERHUB_TOKEN`
- Variables >> Repository variables: add `DOCKERHUB_USERNAME`

## Make Contributions

We welcome contributions! Please follow these steps:

### Contributor Workflow:
1. **Create a Branch**: Create a new branch based on `main` (e.g., `feat/xxx`).
2. **Commit Changes**: Develop your feature and commit changes to the new branch.
3. **Open a Pull Request (PR)**: Submit a PR targeting the `test` branch and wait for review.

### Repository Owner Workflow:
1. **Deploy to Test Environment**: The repository owner will deploy the changes to the test server via the Kubernetes Dashboard.
2. **Verify in Test Environment**: The repository owner will test the changes in the test environment.
3. **Merge to Production**: If everything works as expected, the repository owner will merge `test` into `main`.
4. **Deploy to Production**: The repository owner will manually restart the deployment in the production server via the Kubernetes Dashboard.
