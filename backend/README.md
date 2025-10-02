# EditorJS Backend

This is a simple Express.js backend server that provides file upload functionality for EditorJS image tool.

## Features

- File upload via multipart/form-data
- Image fetching from URLs
- CORS enabled for frontend integration
- File size limit (10MB)
- Image type validation
- Automatic file naming with timestamps

## Endpoints

### POST /uploadFile
Handles file uploads from EditorJS image tool.
- Accepts: `multipart/form-data` with `image` field
- Returns: JSON with file URL and metadata

### POST /fetchUrl
Fetches images from external URLs.
- Accepts: JSON with `url` field
- Returns: JSON with downloaded file URL and metadata

### GET /health
Health check endpoint.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

3. Server will run on http://localhost:8000

## File Storage

Uploaded files are stored in the `uploads/` directory and served statically at `/uploads/` endpoint.

## Configuration

- Port: 8000 (default) or set via PORT environment variable
- Max file size: 10MB
- Allowed file types: All image types (image/*)