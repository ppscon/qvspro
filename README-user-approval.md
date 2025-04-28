# Beta User Approval Workflow

This feature implements a workflow where new user registrations require admin approval before they can access the application.

## Features Implemented

1. **User Registration Flow**:

   - Users can sign up as normal
   - After registration, accounts are marked as "pending approval"
   - Users see a clear message that their account needs approval
   - When logged in but not approved, users see a waiting screen

2. **Admin Dashboard**:

   - Added a "Pending Users" section showing all users waiting for approval
   - Admins can approve users with one click
   - Admins can promote users to admin status
   - Interface is consistent with existing dashboard design

3. **Database Changes**:
   - Created `approved_users` table to track approved accounts
   - Added `approval_status` field to user profiles
   - Added Supabase functions for the approval process
   - Implemented proper row-level security policies

## Technical Implementation

### Database

- **Tables**:

  - `approved_users`: Stores records of approved users
  - Updated `profiles` table with `approval_status` field

- **Functions**:
  - `approve_user()`: Approves a user by adding them to the approved_users table

### Frontend Components

- **AdminDashboard.tsx**:

  - Added UI for viewing and approving pending users
  - Implemented functions to handle user approval

- **ProtectedRoute.tsx**:

  - Enhanced to check for user approval status
  - Added waiting screen for unapproved users

- **Auth.tsx**:
  - Updated to inform users about the approval process
  - Modified registration flow to set correct status

### Authentication

- **useAuth.tsx**:
  - Added `isApproved` status to track user approval
  - Implemented functions to check approval status

## How to Test

1. **Create a new user**:

   - Sign up with a new email
   - Verify you see the "waiting for approval" message
   - Try to access protected routes (should see waiting screen)

2. **Admin approval**:

   - Log in as an admin
   - Go to Admin Dashboard
   - Find the new user in the "Pending Users" section
   - Click "Approve"
   - Verify the user disappears from the pending list

3. **Approved user access**:
   - Log in as the newly approved user
   - Verify you can now access the application

## Troubleshooting

### Database Error When Creating New User

If you encounter a "Database error saving new user" message:

1. **Apply migrations**: Run the SQL migrations in `supabase/migrations/20250427_user_approval.sql`

   ```
   psql -U postgres -d postgres -f supabase/migrations/20250427_user_approval.sql
   ```

   Or via the Supabase dashboard SQL editor.

2. **Check profiles table structure**: Ensure the profiles table has:

   - `email` column (text)
   - `approval_status` column (text)

3. **Verify approve_user function**: The function should be available in the database.

4. **Check policies**: Make sure RLS policies are correctly applied to the approved_users table.

### Approval Not Working

If users remain in pending state after approval:

1. **Check admin status**: Ensure your account has admin privileges
2. **Verify function permissions**: The approve_user function requires SECURITY DEFINER privileges
3. **Test manually**: Run `SELECT approve_user('user-uuid')` from an admin account in the SQL editor

## Future Improvements

- Email notifications when users are approved
- Ability to reject users with a reason
- Admin notes on user accounts
- Approval history tracking
