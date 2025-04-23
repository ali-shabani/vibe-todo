# Todo App

A simple, clean todo application built with vanilla JavaScript, HTML, and CSS.

## Live Demo

You can try out the application at: [https://ali-shabani.github.io/vibe-todo/](https://ali-shabani.github.io/vibe-todo/)

## Features

- Create new todos
- Edit existing todos
- Delete todos
- Mark todos as complete/incomplete using checkboxes
- Filter todos by status (All/Active/Completed)
- Add detailed descriptions to todos with multi-line support
- Todos persist via localStorage

## Usage

1. Simply open `index.html` in your browser
2. Add a new todo by typing in the input field
3. Add a detailed description in the textarea (optional)
4. Click "Add" or press Enter to create the todo
5. Click the checkbox to mark a todo as complete/incomplete
6. Use the tabs to filter between All, Active, and Completed todos
7. Use the Edit button to modify a todo and its description
8. Use Ctrl+Enter to save while editing descriptions
9. Use the Delete button to remove a todo

## Development

To run the project with a development server with live reloading:

1. Make sure you have Node.js installed
2. Install dependencies with `npm install`
3. Run the development server with `npm run dev`
4. Open your browser to http://localhost:3000
5. Any changes to HTML, CSS, or JavaScript files will automatically reload the page

## Implementation Details

- Pure vanilla JavaScript - no frameworks or libraries
- Responsive design with CSS
- Data persistence using localStorage
- Dynamic DOM manipulation

## Deployment

This application is deployed via GitHub Pages using GitHub Actions. The deployment workflow automatically deploys the latest changes from the 'main' branch.
