# NUTM Nexus

[![Vercel Deployment Status](https://vercel.com/button)](https://vercel.com) 

A simple, modern web application built with Next.js to serve as a centralized hub for accessing course materials and resources at NUTM. It uses a GitHub repository as its data source, keeping things lightweight and free.

<!-- ![NUTM Nexus Screenshot](link/to/your/screenshot.png) -->
<!-- **TODO:** Add a screenshot of the application homepage here! -->

## Features

*   **Course Listing:** Displays available courses fetched directly from the GitHub repository.
*   **Course Detail Pages:** Shows detailed information for each course, including metadata, associated files (notes, assignments), Moodle links, and embedded YouTube playlists.
*   **GitHub Data Source:** Course data (`metadata.json`) and resource files (PDFs, etc.) are managed directly within the `/courses` directory of this GitHub repository.
*   **Client-Side Search:** Filter courses instantly by title, code, or description on the homepage.
*   **Filtering & Sorting:** Filter courses by Department, Level, and Credits. Sort by Code, Title, Level, or Credits.
*   **Resource Icons:** File lists display icons based on file type (PDF, DOCX, Video, etc.).
*   **Responsive Design:** Adapts to various screen sizes using Tailwind CSS.
*   **Dark/Light Mode:** Includes a theme toggle with system preference detection using `next-themes`.
*   **Static Pages:** Includes "About" and "Team" pages.
*   **Simple & Free:** Built entirely using free services (GitHub, Vercel) and open-source libraries.

## Technology Stack

*   **Framework:** [Next.js](https://nextjs.org/) (v15.x.x - React App Router)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Data Fetching:** [GitHub REST API](https://docs.github.com/en/rest) (via `Octokit`) accessed through Next.js API Routes
*   **UI Components:** [Heroicons](https://heroicons.com/) (for icons)
*   **Themeing:** [next-themes](https://github.com/pacocoursey/next-themes)
*   **Deployment:** [Vercel](https://vercel.com/)

## Getting Started

Follow these instructions to get a local copy up and running for development purposes.

### Prerequisites

*   **Node.js:** LTS version recommended (e.g., v18 or v20). Download from [nodejs.org](https://nodejs.org/).
*   **npm** or **yarn:** Package manager (comes with Node.js).
*   **Git:** Version control system. [git-scm.com](https://git-scm.com/).
*   **GitHub Account:** To clone the repository and generate an access token.
*   **GitHub Personal Access Token (PAT):** Required for the application to fetch data from your GitHub repository via the API.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/<YOUR_GITHUB_USERNAME>/nutm-nexus.git
    cd nutm-nexus
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

### Environment Variables

The application requires certain environment variables to connect to the GitHub API.

1.  **Create a `.env.local` file** in the root directory of the project.
2.  **Add the following variables**, replacing the placeholder values with your actual credentials:

    ```bash
    # .env.local (This file should be in your .gitignore!)

    # --- GitHub API Access (Required for fetching course data) ---
    # Your GitHub Personal Access Token (Classic, with 'repo' scope)
    GITHUB_TOKEN=ghp_YOUR_COPIED_GITHUB_PAT_HERE

    # Your GitHub username (the owner of the repository)
    GITHUB_REPO_OWNER=<YOUR_GITHUB_USERNAME>

    # The exact name of this repository on GitHub
    GITHUB_REPO_NAME=nutm-nexus

    # --- Authentication Variables (NOT NEEDED - Auth Removed) ---
    # GITHUB_ID=...
    # GITHUB_SECRET=...
    # NEXTAUTH_URL=...
    # NEXTAUTH_SECRET=...
    ```
3.  **IMPORTANT:** Ensure `.env.local` is added to your `.gitignore` file to prevent committing secrets.

### Running Locally

1.  **Start the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
2.  Open your browser and navigate to `http://localhost:3000`.

## Deployment

This project is optimized for deployment on [Vercel](https://vercel.com/).

1.  **Import Project:** Import your GitHub repository into Vercel.
2.  **Framework Preset:** Vercel should detect "Next.js".
3.  **Environment Variables:** Configure the **exact same** environment variables on Vercel as listed for `.env.local` (under Project Settings -> Environment Variables):
    *   `GITHUB_TOKEN`
    *   `GITHUB_REPO_OWNER`
    *   `GITHUB_REPO_NAME`
    *   Ensure they are set for the **Production** environment.
4.  **Deploy:** Click "Deploy". Vercel will build and deploy your site.
5.  **Automatic Deployments:** Pushing to the connected GitHub branch (usually `main`) will automatically trigger new deployments on Vercel.
