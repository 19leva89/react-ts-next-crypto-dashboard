apexcharts

Core Technologies:
- React 19
- TypeScript
- Next 15 (framework)

Data Fetching and State Management:
- Prisma 5 (ORM for DB)

Middleware and Server Utilities:
- Concurrently (all projects are running in tandem)

Styling and UI Frameworks:
- Lucide React (stylization)
- React Icons (stylization)
- shadcn/ui (stylization)
- Tailwind CSS (stylization)

Utilities and Libraries:
- ApexCharts (data visualization)
- PostCSS (transforms CSS code to AST)


To run the client and server via concurrently:
npm run all
npm run lint (loading ESLint checker)

npx prisma migrate reset
npx prisma db push
npx prisma generate