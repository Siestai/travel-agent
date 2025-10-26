# Delete File Flow

## Overview

Files deleted in the app are deleted from both the database and Google Drive.

## Components

### DeleteConfirmationDialog (`components/delete-confirmation-dialog.tsx`)

- Reusable AlertDialog component
- Customizable title and description
- Used for confirmation before destructive actions

### Updated DriveFileList (`components/drive-file-list.tsx`)

- Uses DeleteConfirmationDialog instead of browser confirm()
- Tracks file to delete in state
- Shows file name in confirmation dialog
- Proper cleanup on cancel/confirm

## Delete Flow

### 1. User Action

User clicks delete button on a file card

### 2. Confirmation Dialog

```
┌─────────────────────────────────────────┐
│ Delete istanbul-bangkok.pdf?           │
│                                         │
│ This file will be permanently deleted  │
│ from Google Drive and cannot be        │
│ recovered.                              │
│                                         │
│ [Cancel]              [Delete]         │
└─────────────────────────────────────────┘
```

### 3. API Processing (DELETE `/api/drive/files`)

1. Get `driveFileId` from request
2. Query database to find file record by `driveFileId`
3. Delete file from Google Drive using Drive API
4. Delete file record from database
5. Return success response

### 4. UI Update

- Refresh file list to show updated state
- Dialog closes automatically

## Database Schema

### DriveFile Table

- `id` - Database UUID (primary key)
- `driveFileId` - Google Drive file ID
- `travelId` - Foreign key to Travel
- Other metadata fields

## API Route: DELETE /api/drive/files

**Query Parameters:**

- `driveFileId` - Google Drive file ID

**Process:**

1. Authenticate user
2. Get Google account and decrypt access token
3. Initialize Drive client
4. Query database for file record (by `driveFileId`)
5. Delete from Google Drive (uses `driveFileId`)
6. Delete from database (uses database `id`)
7. Return success

## Security

- Files are permanently deleted from Drive
- No recovery possible after deletion
- Requires active Google connection
- User must be authenticated
- Only user's own files can be deleted

## Error Handling

- File not found in database → 404
- Google account not connected → 401
- Drive deletion fails → 500
- Database deletion fails → logged, still returns success (Drive deleted)

## Future Enhancements

- Soft delete option (trash instead of permanent delete)
- Bulk delete support
- Delete confirmation with file preview
- Undo delete (within time limit)
