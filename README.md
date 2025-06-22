# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Firebase Configuration

Your Firebase project credentials have been configured directly in the source code to resolve a persistent issue with the development environment.

You can find the configuration in the `src/lib/firebase.ts` file.

**Note for Production:** While this setup works for development, it is a security best practice to **not** commit credentials directly into your source code repository. For a production deployment, you should move these keys into your hosting provider's secret manager or environment variable system (e.g., using a `.env.local` file that is not checked into version control).
