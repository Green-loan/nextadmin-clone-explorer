
# Green Finance

## Project Overview

Green Finance is an innovative and futuristic financial platform designed to provide loans to users with an interest return of 39.99%. The platform allows users to apply for loans with or without logging in, while also offering a seamless user experience through a user dashboard and an admin dashboard for managing loan applications, approvals, and analytics.

The platform leverages AI for document verification, fraud detection, and loan approval processes. Additionally, it includes a chatbot integrated with Deepseek R1 to assist users and provide suggestions. The platform is visually appealing, responsive, and feature-rich, with advanced analytics, notifications, and financial tracking for both users and administrators.

## Key Features

### 1. Landing Page
- Attractive, futuristic design to engage users
- Analytics to track user interactions (e.g., clicks, time spent, etc.)
- Call-to-action buttons for loan applications (with/without login)

### 2. User Dashboard
- **Loan Application**: Users can apply for loans with or without logging in
- **Stokvela Members Table**: Display members, their payment status (previous and upcoming months)
- **Notifications**: Notify users of due dates, payment reminders, and platform updates
- **Top Clients**: Highlight users who frequently interact and pay on time
- **Financial Overview**: Display net worth, available funds, and other financial metrics
- **Settings**: Allow users to manage their profiles and preferences

### 3. Admin Dashboard
- **Loan Applications**: View and manage all loan applications, including uploaded documents
- **AI Document Verification**: Automatically verify documents for authenticity and check for previous delays or fraud
- **Approval Process**: Approve or reject loans based on AI analysis and manual review
- **Financial Analytics**: Graphs and charts for monthly revenue, profits, and loan disbursements
- **Funds Management**: Automatically deduct approved loan amounts from the business account and transfer them to users
- **User Management**: View and manage all users, including their loan history and payment status
- **Notifications**: Notify users about due dates, approvals, and rejections

### 4. AI Integration
- **Document Verification**: AI checks for document authenticity and user history
- **Fraud Detection**: AI analyzes user behavior and flags suspicious activity
- **Chatbot**: Integrated with Deepseek R1, trained to answer platform-related queries and provide suggestions

### 5. Analytics and Reporting
- **User Interaction**: Track user behavior on the landing page and dashboard
- **Financial Reports**: Monthly revenue, profits, and loan disbursement graphs
- **Top Clients**: Identify and reward top-performing clients

### 6. Notifications
- **Due Date Reminders**: Notify users of upcoming payments
- **Fund Availability**: Notify users when Green Finance has sufficient funds
- **Approval/Rejection Alerts**: Notify users of loan application status

### 7. Responsive Design
- Fully responsive design for seamless access on desktop, tablet, and mobile devices

### 8. Additional Features
- **Net Worth Indicator**: Display the net worth of the business
- **Profit Tracking**: Track profits from loans and other financial activities
- **User Feedback**: Allow users to provide feedback and suggestions

## Development Plan

### 1. Technology Stack
- **Frontend**: React with TypeScript
- **Backend**: Supabase for database, authentication, and storage
- **AI Integration**: Deepseek R1 for chatbot functionality
- **Hosting**: Netlify or custom domain

### 2. Development Phases

#### Phase 1: Planning and Design
- Define project scope and requirements
- Create wireframes and UI/UX designs for all pages
- Set up Supabase project (Database, Authentication, Storage)

#### Phase 2: Frontend Development
- Develop the landing page with analytics integration
- Build the user dashboard with loan applications, Stokvela members table, and notifications
- Create the admin dashboard with loan management, AI integration, and financial analytics

#### Phase 3: Backend Development
- Set up Supabase tables and relations
- Develop APIs for loan applications, approvals, and notifications
- Integrate Supabase Authentication for user login/signup

#### Phase 4: AI Integration
- Develop AI models for document verification and fraud detection
- Integrate Deepseek R1 API for the chatbot
- Train the chatbot to answer platform-related queries

#### Phase 5: Testing
- Test the platform for responsiveness, functionality, and performance
- Conduct user testing to gather feedback and improve the platform

#### Phase 6: Deployment
- Deploy the platform to production
- Monitor the platform for bugs and performance issues

#### Phase 7: Maintenance
- Regularly update the platform with new features and improvements
- Monitor AI models and chatbot performance for accuracy and efficiency

## Project Setup

### URL
**URL**: https://lovable.dev/projects/0ab6ace3-ff47-4625-9620-645b41493729

### How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/0ab6ace3-ff47-4625-9620-645b41493729) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Technologies Used

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (for backend, authentication, and storage)

## Deployment

Simply open [Lovable](https://lovable.dev/projects/0ab6ace3-ff47-4625-9620-645b41493729) and click on Share -> Publish.

## Custom Domain

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)
