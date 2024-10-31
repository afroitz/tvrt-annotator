# Annotation Tool for the TeleVision Rumor Tracking Project
This is an annotation tool for rumor tracking tasks on Telegram or similar data. Users can import datasets, annotate them and export their annotations. The application is built using electron, react, typescript and tailwind. The project structure is explained in detail in an additional README file in the `src` directory.

## Dataset structure
A valid annotation dataset needs to be a zip-archive containing three files:
- `filtered.csv`: The samples for annotation
- `full.csv`: Additional samples for resolving reply threads
- `task.json`: The task file containing rumors and labels

Currently, the application is not robust to different methods of creating zip archives. Creating the archive on MacOS using right-click -> compress works best.

## Setting up the development environment
1. Clone the repository
2. Run `npm install` to install the dependencies
3. Run `npm start` to start the development server

## Building the application
Run `npm run build` to build the application for the current platform