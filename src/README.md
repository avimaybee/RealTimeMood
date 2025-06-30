# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Firebase Configuration

Your Firebase project credentials have been configured directly in the source code to resolve a persistent issue with the development environment.

You can find the configuration in the `src/lib/firebase.ts` file.

**Note for Production:** While this setup works for development, it is a security best practice to **not** commit credentials directly into your source code repository. For a production deployment, you should move these keys into your hosting provider's secret manager or environment variable system (e.g., using a `.env.local` file that is not checked into version control).

### Authentication Error (`auth/unauthorized-domain`)

If you see this error, it means your current development environment's URL is not whitelisted in your Firebase project. To fix this:
1. Go to the **Firebase Console**.
2. Navigate to **Authentication** > **Settings** tab.
3. Under the **Authorized domains** section, click **Add domain**.
4. Enter the **domain name only** of your development environment. Do not include `https://` or any slashes (`/`).
   - If your preview URL is `https://1234-my-app.cloudworkstations.dev`, you must add `1234-my-app.cloudworkstations.dev`.
   - If you are running locally, you must add `localhost`.
5. Double-check for typos and click **Add**. It may take a minute for the changes to apply.
