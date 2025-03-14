Authentication and User Management:
- Bcrypt.js (password hashing)
- NextAuth 5 (authentication)

Core Technologies:
- React 19
- TypeScript
- Next 15 (framework)

Data Fetching and State Management:
- Immer (immutable state management)
- Prisma 6 (ORM for DB)
- React Hook Form (working with forms)

Email Services:
- Resend (send email)

Form and Validation:
- Zod (first schema validation)

Image Handling and Optimization:
- Sharp (image optimizer)

Middleware and Server Utilities:
- Concurrently (all projects are running in tandem)

Pagination:
- React window (working with infinite scroll)

Styling and UI Frameworks:
- Lucide React (stylization)
- Next Js TopLoader (using top progress bar)
- Next Themes (using theme switcher)
- shadcn/ui (stylization)
- Tailwind CSS (stylization)

Utilities and Libraries:
- Date-fns (date/time manipulation)
- Knip (code analyzer and declutter)
- PostCSS (transforms CSS code to AST)


To run the client and server via concurrently:
npm run all
npm run lint (loading ESLint checker)
npm run knip

npx prisma generate
npx prisma db push
npx prisma db pull
npx prisma db seed (loading test DB)
npx prisma migrate reset