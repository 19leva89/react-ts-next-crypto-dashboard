# This project contains the following technologies

Authentication and User Management:
- Bcrypt-ts (password hashing)
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
- Nodemailer (send email)

Form and Validation:
- Zod (first schema validation)

Image Handling and Optimization:
- Sharp (image optimizer)

Middleware and Server Utilities:
- Concurrently (all projects are running in tandem)
- tRPC (end-to-end type safe APIs)

Pagination:
- React window (working with infinite scroll)

Styling and UI Frameworks:
- Lucide React (stylization)
- Next Js TopLoader (using top progress bar)
- Next Themes (using theme switcher)
- shadcn/ui (stylization)
- Tailwind CSS (stylization)

Testing and QA (Quality Assurance):
- jsdom (DOM testing)
- Vitest (unit testing)

Utilities and Libraries:
- Date-fns (date/time manipulation)
- Javascript obfuscator (code obfuscation)
- Knip (code analyzer and declutter)
- PostCSS (transforms CSS code to AST)
- UAParser.js (user agent parser)


# Project setup commands:
terminal powershell -> `npm i` (install dependencies)
terminal powershell -> `npx npm-check-updates --interactive` (update dependencies)
terminal powershell -> `npm run all`
terminal powershell -> `npm run lint` (loading ESLint checker)
terminal powershell -> `npm run types` (loading TypeScript checker)
terminal powershell -> `npm run knip` (loading Knip checker)

# Database commands:
terminal powershell -> `npx prisma generate`
terminal powershell -> `npx prisma db push`
terminal powershell -> `npx prisma migrate reset`

terminal powershell -> `npx prisma db seed` (loading test DB)

# GitHub commands:
terminal powershell -> `git pull origin master` (get latest changes)

terminal powershell -> `git add .` (add all changes)
terminal powershell -> `git commit -m "commit message"` (commit changes)
terminal powershell -> `git checkout -b <branch-name>` (create new branch)

terminal powershell -> `git push origin master` (push changes to master)
terminal powershell -> `git push origin master:<branch-name>` (if branch already exists)
terminal powershell -> `git push origin <branch-name>` (push changes to branch)