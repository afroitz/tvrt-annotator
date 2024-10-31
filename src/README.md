# Project structure overview
The following in an overview of the directories and files contained within this `src` directory:
- `/components`: Contains all react components used in the application
- `/screens`: Contains all screens of the application (i.e. the different pages)
- `/types`: Contains typescript types used throughout the application
- `/utils`: Contains utility functions used throughout the application
- `/app.tsx`: The main application component, initializes the router and mounts the application
- `/index.css`: Entry point for tailwind
- `/index.html`: HTML template into which the application is mounted
- `/index.ts`: Contains the main backend logic for the electron application, including the entire api logic. This should be broken up in the future.
- `/preload.ts`: Contains the preload script for the electron application, exposing the api to the renderer process
- `/renderer.ts`: Entry point for the renderer process
