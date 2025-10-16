# Admin Guide for The Hub

## Admin Features

Admins have special permissions in The Hub platform:

- **Delete Reviews**: Admins can delete any course rating/review to moderate inappropriate content

## Making a User an Admin

To grant admin privileges to a user, you need to update the database directly.

### Using SQL

```sql
UPDATE users SET is_admin = TRUE WHERE email = 'user@college.edu';
```

Replace `user@college.edu` with the email address of the user you want to make an admin.

### Using Replit Database Tool

1. Open the Database tool in Replit
2. Select the `users` table
3. Find the user you want to make an admin
4. Set the `is_admin` column to `true` for that user

## How Admins Delete Reviews

Once a user is an admin:

1. Navigate to any course page
2. Scroll to the Ratings & Reviews section
3. You'll see a trash icon (delete button) next to each review
4. Click the trash icon to delete a review
5. Confirm the deletion

The review will be permanently removed from the system.

## Security Notes

- Admin status is checked on the backend before allowing any delete operations
- Only users with `is_admin = true` can delete reviews
- All delete actions are logged in the application logs
