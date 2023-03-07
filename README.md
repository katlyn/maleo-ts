# UA Scholars

This repository houses the backend for the new UA Scholars application after the migration off Roxen. The backend is
implemented in [TypeScript](https://www.typescriptlang.org/docs/) with [Fastify](https://www.fastify.io/docs/latest/)
and [Prisma](https://www.prisma.io/docs).

## Development

Before you can start development, you will need to run through some initial configuration to set up the environment.

1. Run `pnpm install` to install dependencies
2. Copy `example.env` to `.env`, and fill it with suitable data.
3. Start a Postgres database server that the development server will be able to connect to. You may use the
   `docker-compose.yaml` file to help bootstrap this database without needing to install it on your system.
    - This Compose file will also start an [Adminer](https://www.adminer.org/) instance on port 8081.
4. Run `pnpm prisma migrate dev` to initialize the database structure. This will also generate the Prisma client module.

Once you have completed the above steps, you can start the dev server with `npm run start:dev`.

### Notes

- ESLint is configured for this project. Make sure your editor is configured to provide linting information and output.
  Some quick notes about the current configuration:
    - Double quotes are preferred over single quotes
    - Two spaces are used for indentation
    - Semicolons are used only as necessary
- Node Tap is used for tests. You can run tests with `pnpm test` or run tests on file change with `pnpm test:watch`
