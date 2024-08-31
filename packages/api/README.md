# Serverless Functions

This project contains serverless functions for deployment on Google Cloud Functions.

## Development

### Setting up environment variables

1. Create a `.env.sh` file based on the `.env.example.sh` template.
2. Source the environment variables:

```bash
source .env.sh
```

### Running the development server

To start the development server:

```bash
pnpm start
```

This will run the server locally, typically on `http://localhost:8080`.

### Locally test proxying

Use something like this

```bash
curl -vkL -H "Cookie: JSESSIONID=node01sdwb4l77sv941pqgn2qrat6s6818.node0;" https://94.138.189.89/boss/
```
