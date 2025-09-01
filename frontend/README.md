# Chatroom Frontend (Next.js)

This is a [Next.js](https://nextjs.org) chatroom frontend (App Router + Tailwind v4).

## Getting Started

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Enter a username to join the chat.

## Configuration

- `NEXT_PUBLIC_WS_URL`: WebSocket endpoint of the Go backend. Example: `ws://localhost:8080/ws`.

Copy `.env.local.example` to `.env.local` and adjust if needed.

This project uses Tailwind for basic styling and the Next.js App Router.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

See the [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
