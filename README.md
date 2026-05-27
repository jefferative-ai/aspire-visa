This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

This project is compatible with Vercel's Next.js platform.

### Recommended deployment steps

1. Push the repository to GitHub or another supported Git provider.
2. Open the Vercel dashboard and import the repository.
3. Set the following environment variables in Vercel:
   - `ANTHROPIC_API_KEY`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_APP_URL`
   - `DATABASE_URL` (recommended: external PostgreSQL/MySQL database; SQLite is not persistent on Vercel serverless runtime)
4. Deploy the project. Vercel will use `npm run build` and the Next.js framework automatically.

### Important database note

This app currently uses SQLite via Prisma and `@prisma/adapter-better-sqlite3`. That works locally, but on Vercel the filesystem is ephemeral and file-based SQLite will not persist across invocations. For production deployment, use a managed external database and set `DATABASE_URL` accordingly.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
