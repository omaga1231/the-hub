# Admin Guide for The Hub

## Admin Features

Admins have special permissions in The Hub platform:

- **Delete Reviews**: Admins can delete any course rating/review to moderate inappropriate content
- **Add Colleges**: Admins can add new colleges to the platform
- **Add Courses**: Admins can add new courses to colleges

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

## Using Admin Features

### Accessing the Admin Dashboard

Once a user is an admin:

1. Look for the **"Admin"** section in the sidebar
2. Click on **"Manage Platform"** to access the admin dashboard

### Adding Colleges

1. Go to the Admin Dashboard
2. Click on the **"Add College"** tab
3. Fill in the college information:
   - College Name (e.g., "Delaware Technical Community College")
   - Abbreviation (e.g., "DTCC")
   - Description (optional)
4. Click **"Create College"**

### Adding Courses

1. Go to the Admin Dashboard
2. Click on the **"Add Course"** tab
3. Fill in the course information:
   - Select the college
   - Course Code (e.g., "CS-101")
   - Course Name (e.g., "Introduction to Computer Science")
   - Department (e.g., "Computer Science")
   - Description (optional)
4. Click **"Create Course"**

### Deleting Reviews

1. Navigate to any course page
2. Scroll to the Ratings & Reviews section
3. You'll see a trash icon (delete button) next to each review
4. Click the trash icon to delete a review
5. Confirm the deletion

The review will be permanently removed from the system.

## Security Notes

- Admin status is checked on the backend before allowing any admin operations
- Only users with `is_admin = true` can:
  - Delete reviews
  - Add new colleges
  - Add new courses
- All admin actions are logged in the application logs
- The admin dashboard shows an "Access Denied" message to non-admin users
