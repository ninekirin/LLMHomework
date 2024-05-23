# LLM Homework

LLM Homework, a platform for teachers and students to properly use large language models for homework and assignments.

## Naming Specification

- `LLM Homework`: The name of the project
- `llm-homework`: The name of the repository, the yarn package workspace, and the root folder
- `llmhomework`: The name of the SQL database

## Directory Structure

- `frontend`: Frontend source code repository
  - `build`: Contains compiled static web page files
  - `config`: Some specifications for jest and webpack
  - `node_modules`: All package files (If any)
  - `public`: Static web page generation template
  - `scripts`: Used for debugging
  - `src`: **Core**, React code repository, containing all core source files
    - `assets`: Some non-JSX files
    - `common`: Layout files, etc.
    - `hooks`: React Router related
    - `models`: Redux model files
    - `pages`: All frontend pages
    - `router`: Used for indexing and navigation between pages
- `backend`: Backend source code repository
  - `core`: Backend core code
    - `apis`: Flask-RESTful backend routes
    - `models`: Flask-SQLAlchemy model files
    - `templates`: HTML templates to send the email
- `database`: database related files

- `README.md`: Project README file in Markdown format
- `README.pdf`: Project README file in PDF format

## Frontend File Usage Guide

Made with React, package manager configuration is required to build and run.

### Directly run the compiled static files (using XAMPP as an example) Using our deployed back-end site

The compiled static files was placed on the folder `./src/frontend/build`, and you just need to put the content of the `build` folder in the root directory into the XAMPP website directory, and access it via a browser.

### Running in development environment

#### Change backend API address (Modified by default)

**By default, the siteUrl and the apiBaseUrl are changed to `http://localhost:3000` and `http://localhost:8000/api/v1`.**

In `src/frontend/src/assets/js/config.js`.

```javascript
const siteName = 'LLM Homework';
const siteUrl = 'http://localhost:3000';
const siteDescription =
  'LLM Homework, a platform for teachers and students to properly use large language models for homework and assignments.';
const apiBaseUrl = 'http://localhost:8000/api/v1';

export { siteName, siteUrl, siteDescription, apiBaseUrl };
```

You can change the address of the API server used by the frontend.

#### Install dependencies and run directly

You should install NodeJS and yarn(optional) to run it via development environment.

How to install NodeJS: https://nodejs.dev/en/learn/how-to-install-nodejs/

```shell
cd frontend
npm install
npm start
```

or

```shell
cd frontend
yarn install
yarn start
```

Visit [here](http://localhost:3000/) then. (http://localhost:3000/)

#### Compile static files (We provide the compiled files)

```shell
cd frontend
yarn install
yarn build
```

## Backend File Usage Guide

Written in Python, but some packages need to be installed in advance.

#### Install the dependency packages and run

```shell
cd src/backend
pip3 install -r requirements.txt
python run.py
```

If any packages are still missing, just install it manually.

And you can visit [here](http://localhost:8000/) then to view all the APIs. (http://localhost:8000/)
