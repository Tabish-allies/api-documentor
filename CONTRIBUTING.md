# Contributing to API Documentor

Thank you for your interest in contributing to API Documentor. This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Workflow](#development-workflow)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Reporting Issues](#reporting-issues)

---

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone. Be kind, constructive, and professional in all interactions.

---

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/<your-username>/api-documentor.git
   cd api-documentor
   ```
3. Add the upstream remote:
   ```bash
   git remote add upstream https://github.com/<original-owner>/api-documentor.git
   ```
4. Create a new branch for your feature or fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

---

## How to Contribute

### Types of Contributions Welcome

- Bug fixes
- New features and enhancements
- Documentation improvements
- Test coverage improvements
- Performance optimizations
- UI/UX improvements to the docs portal

### Before You Start

- Check existing issues and pull requests to avoid duplicate work
- For major changes, open an issue first to discuss the approach
- Ensure your changes align with the project's goals

---

## Development Workflow

### Prerequisites

- Java 21 or higher
- Maven 3.8+ (or use the included Maven wrapper)
- Node.js 18+ and npm 9+

### Setting Up the Development Environment

1. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

2. Start the backend:
   ```bash
   ./mvnw spring-boot:run
   ```

3. Start the frontend (in a separate terminal):
   ```bash
   cd docs-portal
   npm install
   npm run dev
   ```

4. Verify both are running:
   - Backend: http://localhost:8080/api-docs
   - Frontend: http://localhost:3000

### Running Tests

```bash
./mvnw test
```

### Code Style

- **Java**: Follow standard Java conventions. Use meaningful variable names and keep methods focused.
- **JavaScript/React**: Follow the existing code style. Use functional components and hooks.
- **Commits**: Write clear, concise commit messages. Use present tense ("Add feature" not "Added feature").

---

## Pull Request Guidelines

1. Update your branch with the latest upstream changes before submitting:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. Ensure all tests pass locally

3. Write a clear PR description that includes:
   - What the change does
   - Why the change is needed
   - How to test the change
   - Screenshots (for UI changes)

4. Keep PRs focused and small. One PR per feature or fix.

5. Link related issues using "Fixes #issue-number" or "Closes #issue-number"

---

## Reporting Issues

When reporting a bug, please include:

- A clear and descriptive title
- Steps to reproduce the issue
- Expected behavior vs actual behavior
- Your environment (OS, Java version, Node version)
- Relevant logs or screenshots

For feature requests, describe:

- The problem you are trying to solve
- Your proposed solution
- Any alternatives you have considered

---

## Project Structure

```
api-documentor/
├── src/main/java/com/tabish/ps18/   # Spring Boot backend
│   ├── config/                       # Configuration classes
│   ├── controller/                   # REST controllers
│   ├── model/                        # JPA entities
│   ├── repository/                   # Data repositories
│   └── service/                      # Business logic
├── docs-portal/                      # React frontend
│   └── src/                          # React source files
├── .env.example                      # Environment template
├── integrate.sh                      # Integration helper script
└── pom.xml                           # Maven configuration
```

---

## Questions?

If you have questions about contributing, feel free to open an issue with the "question" label.

Thank you for helping improve API Documentor.
