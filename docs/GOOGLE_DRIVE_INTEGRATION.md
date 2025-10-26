# Google Drive OAuth Integration

## Overview

The Google Drive integration allows users to sync their travel documents with Google Drive. Each travel gets its own folder in Drive, and users can sync files bidirectionally.

## Features Implemented

### 1. OAuth Authentication

- Users connect their Google Drive account via OAuth
- Tokens are encrypted and stored securely in the database
- Scopes: `drive.file`, `drive.readonly`, `drive.appdata`
- One Google account per user

### 2. Folder Structure

- Root folder: "Siestai Travel Agent" (created automatically)
- Each travel gets its own folder under the root
- Folder naming: `Siestai Travel Agent/[Travel Name]/`

### 3. Travel Management

- Users can create multiple travels
- One active travel at a time
- Each travel has its own Drive folder
- Easy travel switching via dropdown

### 4. File Sync

- Manual sync button to refresh files from Drive
- Syncs files uploaded directly to Drive
- File metadata stored in database
- Files can be viewed in Drive or deleted

### 5. User Flow

1. Connect Google Drive (OAuth flow)
2. Create a travel (folder created in Drive)
3. Upload files to Drive folder
4. Click "Sync Now" to refresh file list
5. View files in the app

## Database Tables

### GoogleAccount

- Stores OAuth tokens (encrypted)
- Linked to user account
- Email and Google ID

### Travel

- Represents individual trips/travels
- Links to Drive folder via `driveFolderId`
- Active travel flag

### DriveFile

- Tracks synced Drive files
- Links to travel and optionally document
- Sync status tracking

## API Routes

### Google OAuth

- `GET /api/google/connect` - Start OAuth flow
- `GET /api/google/callback` - Handle OAuth callback
- `POST /api/google/disconnect` - Remove Google connection
- `GET /api/google/status` - Check connection status

### Travel Management

- `GET /api/travel` - Get all travels
- `POST /api/travel` - Create new travel (creates Drive folder)
- `PUT /api/travel` - Update travel (set active, etc.)

### Drive Operations

- `GET /api/drive/files` - Get files for active travel
- `DELETE /api/drive/files?driveFileId=...` - Delete file from Drive
- `POST /api/drive/sync` - Sync files from Drive to database

## Components

### Drive Dashboard (`components/drive-dashboard.tsx`)

- Main page for Drive integration
- Shows connection status
- Travel selector
- File list
- Sync button

### Create Travel Modal (`components/create-travel-modal.tsx`)

- Two-step flow explaining how it works
- Travel name input
- Creates folder in Drive

### Drive File List (`components/drive-file-list.tsx`)

- Displays synced files
- View and delete actions
- Empty state

### Travel Selector (`components/travel-selector.tsx`)

- Dropdown to switch between travels
- Shows active travel
- New travel option

### Connection Status (`components/drive-connection-status.tsx`)

- Shows connected email
- Disconnect button

## Environment Variables

Required:

- `GOOGLE_CLIENT_ID` - OAuth client ID
- `GOOGLE_CLIENT_SECRET` - OAuth client secret
- `NEXTAUTH_URL` - Callback URL
- `ENCRYPTION_KEY` - For token encryption

## Setup Instructions

1. Create OAuth credentials in Google Cloud Console
2. Add authorized redirect URIs:
   - `http://localhost:3000/api/google/callback` (dev)
   - `https://your-domain.com/api/google/callback` (prod)
3. Enable Google Drive API in Google Cloud Console
4. Set environment variables
5. Run migration: `pnpm db:migrate`
6. Reconnect Google Drive to get new scopes

## Key Points

- Files uploaded directly to Drive are visible after sync
- Each travel maintains its own folder structure
- Sync is manual (user clicks "Sync Now")
- Files are shown but not automatically imported as documents
- Delete operations remove files from both Drive and database

## Future Enhancements

- Automatic background sync
- File upload from app
- Import files as Document artifacts
- File preview/download
- Multiple Google accounts per user (optional)
