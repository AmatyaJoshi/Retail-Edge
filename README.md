# Retail Edge


A complete, full-stack, cloud-native retail management platform for modern businesses. Retail Edge goes beyond POS, delivering advanced analytics, real-time dashboards, multimodal AI/LLM chatbot support, and enterprise-grade security. Built with a modular Next.js frontend and decoupled Express backend, it leverages PostgreSQL (Supabase), Azure Blob Storage, and multi-provider authentication for seamless, scalable operations. Automated CI/CD, robust RBAC/IAM, and a rich, responsive UI/UX make it a resilient, future-ready solution.

## Screenshots

Paste your application screenshots in the `client/public` directory (e.g., `client/public/screenshots/`).
Reference them below using Markdown:

```
![Dashboard](client/public/screenshots/dashboard.png)
![POS Interface](client/public/screenshots/pos.png)
![AI Assistant Chatbot](client/public/screenshots/ai-assistant.png)
```

_Replace the filenames above with your actual screenshot filenames._

## Key Features

- Modular, decoupled architecture: Next.js frontend & Express backend with REST APIs
- Responsive POS with barcode generation/scanning
- Advanced product, inventory, expense, and budget management
- Employee, vendor, and customer management modules
- Automated invoice generation and print-friendly modals
- Real-time analytics dashboards (Recharts) and in-app notifications
- Multimodal AI assistant chatbot (6 LLMs: Gemini, Deepseek, Llama, Qwen, Mistral, Microsoft Mai)
- Robust role-based access control (Owner, Manager, Admin, Staff) and IAM policies
- Multi-provider authentication (Clerk, Appwrite) with secure session management
- File/image uploads via Azure Blob Storage
- Automated CI/CD pipelines (GitHub Actions) for Vercel & Azure deployments
- Internationalization (i18n), dark/light themes, and enterprise-grade security (Helmet, CORS, JWT)
- Integration with Supabase (PostgreSQL), DigitalOcean Managed PostgreSQL, and Prisma ORM

## Tech Stack

- **Frontend:** Next.js 13+, React, TypeScript, Tailwind CSS, Shadcn/ui, Redux Toolkit, Recharts
- **Backend:** Node.js, Express.js, TypeScript, REST APIs
- **Database:** PostgreSQL (Supabase, DigitalOcean), Prisma ORM
- **Authentication:** Clerk, Appwrite
- **File Storage:** Azure Blob Storage
- **AI/LLM:** Multimodal chatbot (Gemini, Deepseek, Llama, Qwen, Mistral, Microsoft Mai)
- **DevOps:** GitHub Actions (CI/CD), Vercel (frontend), Azure App Service (backend)
- **Security:** Helmet, CORS, JWT, RBAC/IAM

## Project Structure

```
retail-edge/
├── client/                  # Next.js frontend
│   ├── components.json
│   ├── eslint.config.mjs
│   ├── next-env.d.ts
│   ├── next-i18next.config.js
│   ├── next-intl.config.js
│   ├── next.config.ts
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── public/
│   │   ├── favicon.ico
│   │   ├── retail-edge-logo-dark.svg
│   │   ├── ...
│   │   └── locales/
│   ├── README.md
│   ├── src/
│   │   ├── app/
│   │   │   ├── associates/
│   │   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── customers/
│   │   │   ├── dashboard/
│   │   │   ├── employees/
│   │   │   ├── expenses/
│   │   │   ├── inventory/
│   │   │   ├── pos/
│   │   │   ├── products/
│   │   │   ├── profile/
│   │   │   ├── settings/
│   │   │   ├── transactions/
│   │   │   └── ...
│   │   └── lib/
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── ...
├── server/                  # Express backend
│   ├── nodemon.json
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   ├── scripts/
│   │   ├── seed/
│   │   └── ...
│   ├── src/
│   │   ├── controllers/
│   │   ├── lib/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   └── ...
│   ├── tmp/
│   └── ...
├── deploy.sh
├── package.json
├── README.md
└── ...
```

## Getting Started

### Prerequisites
- **Node.js 18+** (recommended: latest LTS)
- **npm** (comes with Node.js) or **yarn** for package management
- **PostgreSQL database** (Supabase or DigitalOcean, or local instance)
- **Azure account** (for Blob Storage integration, if using file/image uploads)
- **Clerk and/or Appwrite accounts** (for authentication)
- **Vercel and/or Azure App Service accounts** (for deployment)
- **Git** (for version control)
- (Optional) **GitHub account** (for CI/CD with GitHub Actions)
- (Optional) **pnpm** (alternative package manager)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/retail-edge.git
cd retail-edge
```

### 2. Set up environment variables
- Copy `.env.example` to `.env` in both `client/` and `server/` folders
- Fill in your database URLs and API keys

### 3. Install dependencies
```bash
cd client && npm install
cd ../server && npm install
```

### 4. Run the development servers
- **Frontend:**
	```bash
	cd client
	npm run dev
	```
- **Backend:**
	```bash
	cd server
	npm run dev
	```


### 5. Open in browser
- **Production:** [https://retailedge.tech](https://retailedge.tech)
	- You will need to create a new account. You can use random values for phone, Aadhaar, and PAN card details, but make sure your email address is correct for OTP verification.
- **Frontend (local):** [http://localhost:3000](http://localhost:3000)
- **Backend API (local):** [http://localhost:3001](http://localhost:3001) (or your configured port)

### Video Walkthroughs
Access video walkthroughs of the application here: [Google Drive - Retail Edge Walkthroughs](https://drive.google.com/drive/folders/1TYpqoC4Jt7eVSf80Lwgo8bHr9dJkI0Nt?usp=sharing)


## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](LICENSE)

---

**Retail Edge** © 2025 Amatya Joshi. All rights reserved.
