# Setting up environment variables for Cloud Functions

## Development

Read .env file using bash and exporting the variables:

```bash
source .env.sh
```

## Deployment

For deployment, you'll need to set environment variables in the Google Cloud Console or use the `gcloud` CLI.

1. Using `gcloud` CLI:

   ```bash
   gcloud functions deploy hello \
     --runtime nodejs18 \
     --trigger-http \
     --allow-unauthenticated \
     --set-env-vars FIREBASE_PROJECT_ID=your-project-id,FIREBASE_CLIENT_EMAIL=your-client-email \
     --set-secrets FIREBASE_PRIVATE_KEY=projects/123456789/secrets/firebase-private-key/versions/1
   ```

   Note: For sensitive information like FIREBASE_PRIVATE_KEY, it's recommended to use Secret Manager in Google Cloud.

2. Update your deploy script in `package.json`:

   ```json
   "scripts": {
     "deploy": "gcloud functions deploy hello --runtime nodejs18 --trigger-http --allow-unauthenticated --env-vars-file=.env.yaml",
     ...
   }
   ```

3. Create a `.env.yaml` file (make sure to add this to .gitignore):

   ```yaml
   FIREBASE_PROJECT_ID: your-project-id
   FIREBASE_CLIENT_EMAIL: your-client-email
   FIREBASE_PRIVATE_KEY: your-private-key
   ```

Remember to never commit your `.env` or `.env.yaml` files to version control. Add them to your `.gitignore` file.
