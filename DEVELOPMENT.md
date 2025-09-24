# Development Guide

This document provides instructions for setting up the development environment and contributing to **express-cargo**.  
It is intended for developers who want to build, test, or extend the library.

---

## Prerequisites

- [Node.js](https://nodejs.org/) (>= 20)
- [pnpm](https://pnpm.io/) (>= 9)
- Git

Install pnpm globally if you don’t have it already:

```bash
npm install -g pnpm
```

---

## Documentation

We provide two documentation sites:

- Development : https://dev-docs.express-cargo.beyond-imagination.net/
- Production : https://beyond-imagination.github.io/express-cargo/

---

## Setup

Clone the repository and install dependencies:

```
git clone https://github.com/beyond-imagination/express-cargo.git
cd express-cargo
pnpm install
```

---

## Build

Build the library:

```
pnpm build
```

This will generate compiled JavaScript files under packages/express-cargo/dist.

---

## Running Example App

You can run the example Express app to test changes:

```
cd apps/example
pnpm dev
```

The server will start on http://localhost:3000

---

## Linting & Formatting

We use ESLint and Prettier for code quality.

Format code:
```
pnpm format
```

---

## Testing

We use jest to test express-cargo code

test code:
```
pnpm test
```

---

## Repository Structure
```
/
├── apps/
│   ├── docs/          # Documentation site (Docusaurus)
│   └── example/       # Example Express app using express-cargo
└── packages/
    └── express-cargo/ # express-cargo library source code
```

- packages/express-cargo → The main library
- apps/example → A demo app showing how to use express-cargo
- apps/docs → Documentation site
