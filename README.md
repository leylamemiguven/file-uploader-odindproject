# File Uploader Project

This project is a stripped-down version of Google Drive (or any other personal storage service). It allows users to upload files, manage folders, and view file details.

## Features

- **File Uploads**: Users can upload files with or without associating them with a folder.
- **Folder Management**: Users can create, rename, and delete folders.
- **File Details**: View file information such as name, size, and folder association.
- **Preview Uploaded Files**: Images are displayed as previews on the user interface.

## Technologies Used

- **Node.js**: Server-side JavaScript runtime.
- **Express.js**: Web application framework for Node.js.
- **Prisma**: ORM for database management.
- **PostgreSQL**: Database for storing files and folders.
- **EJS**: Template engine for rendering dynamic HTML.
- **Multer**: Middleware for handling file uploads.
- **CSS**: Used for styling the application.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/leylamemiguven/file-uploader-odindproject.git
   cd file-uploader-odindproject


2.  Install Dependencies
Run the following command to install all required dependencies:

```bash
npm install
```

## Set up the Database

1. Configure your `.env` file with the following variables:
   ```env
   DATABASE_URL="your_postgresql_connection_string"
   SESSION_SECRET="your_secret_key"
   ```

## Start the Server

1. Start the server by running:
   ```bash
   node app.js

## Usage

### Upload Files

1. Navigate to the **Upload File** page.
2. Choose a file to upload and optionally select a folder.
3. Click **Upload** to save the file.

### Manage Folders

1. Navigate to the **Folders** page.
2. Use the provided forms to:
   - Create new folders.
   - Rename existing folders.
   - Delete unwanted folders.

### View Files

1. Uploaded files are displayed on the **Upload File** page.
2. File details such as name, size, and associated folder (if any) are shown.
3. Image files include a preview.




