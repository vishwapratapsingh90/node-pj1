# User Session Management Documentation

## Overview
This document explains how user login sessions are handled in the application using Express.js sessions with MySQL storage.

## Architecture

### Session Flow
```
1. User submits login form
2. validateLoginForm → Validates input
3. authenticateUser → Verifies credentials against database
4. createUserSession → Creates session in MySQL store
5. handleLogin → Redirects to success page
```

### Session Storage
- **Storage**: MySQL database with `sessions` table
- **Duration**: 24 hours (configurable)
- **Security**: HTTP-only cookies, CSRF protection, secure in production

## Implementation Details

### 1. Session Configuration (`middlewares/sessionMiddleware.js`)

**Key Features:**
- MySQL session store for persistence
- Auto-expiring sessions (24 hours default)
- Rolling sessions (reset on activity)
- Secure cookie settings

**Environment Variables:**
```env
SESSION_SECRET=your-secret-key-change-in-production
NODE_ENV=development  # Set to 'production' for HTTPS-only cookies
```

### 2. Session Creation Process

**Updated Login Route:**
```javascript
router.post('/login', 
    validateLoginForm,      // Validate input
    authenticateUser,       // Verify credentials
    createUserSession,      // Create session
    handleLogin            // Handle success/redirect
);
```

**Session Data Structure:**
```javascript
req.session = {
    user: {
        id: 123,
        username: 'admin',
        role: 'admin',
        name: 'Administrator',
        loginTime: '2025-10-11T...'
    },
    isAuthenticated: true
}
```

### 3. Protection Middlewares

**Available Middlewares:**
- `requireAuth`: Requires any authenticated user
- `requireRole(role)`: Requires specific role
- `redirectIfAuthenticated`: Redirects logged-in users (for login/register pages)

**Usage Examples:**
```javascript
// Protect admin routes
router.get('/admin', requireAuth, requireRole('admin'), adminController);

// Protect user dashboard
router.get('/dashboard', requireAuth, dashboardController);

// Redirect from login if already logged in
router.get('/login', redirectIfAuthenticated, showLoginForm);
```

### 4. View Integration

**User Data in Views:**
The `injectViewHelpers` middleware makes user data available in all EJS templates:

```html
<!-- Check if user is logged in -->
<% if (isAuthenticated) { %>
    <p>Welcome, <%= helpers.getUserDisplayName() %>!</p>
    <a href="<%= helpers.getLogoutUrl() %>">Logout</a>
<% } else { %>
    <a href="/login">Login</a>
<% } %>

<!-- Check user role -->
<% if (helpers.isAdmin()) { %>
    <a href="/admin">Admin Panel</a>
<% } %>

<!-- Display login time -->
<% if (user) { %>
    <p>Last login: <%= helpers.getLoginTime() %></p>
<% } %>
```

**Available View Helpers:**
- `user`: Current user object or null
- `isAuthenticated`: Boolean authentication status
- `helpers.hasRole(role)`: Check specific role
- `helpers.isAdmin()`: Check if user is admin
- `helpers.getUserDisplayName()`: Get display name
- `helpers.getLoginTime()`: Get formatted login time
- `helpers.getLogoutUrl()`: Get logout URL

## Usage Examples

### 1. Protected Route Example
```javascript
// modules/dashboard/routes/route.js
const { requireAuth } = require('../../../middlewares/sessionMiddleware');

router.get('/dashboard', requireAuth, (req, res) => {
    // req.user contains authenticated user info
    res.render('dashboard', {
        title: 'User Dashboard',
        user: req.user
    });
});
```

### 2. Admin-Only Route Example
```javascript
// modules/admin/routes/route.js
const { requireAuth, requireRole } = require('../../../middlewares/sessionMiddleware');

router.get('/admin', requireAuth, requireRole('admin'), (req, res) => {
    // Only admin users can access this route
    res.render('admin-dashboard', {
        title: 'Admin Dashboard'
    });
});
```

### 3. Logout Functionality
```javascript
// Already implemented in login routes
router.get('/logout', logoutUser);
router.post('/logout', logoutUser);

// Or manually in controller:
const { logoutUser } = require('../../../middlewares/sessionMiddleware');
logoutUser(req, res);
```

### 4. Check Session in Controller
```javascript
const { getCurrentUser } = require('../../../middlewares/sessionMiddleware');

const someController = (req, res) => {
    const user = getCurrentUser(req);
    
    if (user) {
        console.log('User is logged in:', user.username);
    } else {
        console.log('User is not logged in');
    }
};
```

## Database Tables

### Sessions Table (Auto-created)
```sql
CREATE TABLE sessions (
    session_id VARCHAR(128) PRIMARY KEY,
    expires BIGINT UNSIGNED NOT NULL,
    data MEDIUMTEXT
);
```

### User Credentials Table
```sql
CREATE TABLE pj1_credentials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Security Features

### 1. Cookie Security
- **HTTP-only**: Prevents XSS attacks
- **Secure**: HTTPS-only in production
- **SameSite**: CSRF protection
- **Signed**: Tamper protection

### 2. Session Security
- **MySQL storage**: Persistent and scalable
- **Auto-expiration**: Sessions expire after 24 hours
- **Rolling expiration**: Reset on user activity
- **Secure secret**: Configurable session secret

### 3. Route Protection
- **Authentication checks**: Verify logged-in users
- **Role-based access**: Control by user roles
- **Automatic redirects**: Redirect unauthorized users

## Development vs Production

### Development Settings
```javascript
cookie: {
    secure: false,          // Allow HTTP
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
}
```

### Production Settings
```javascript
cookie: {
    secure: true,           // HTTPS only
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'strict'      // Enhanced CSRF protection
}
```

## Installation Requirements

```bash
npm install express-session express-mysql-session mysql2
```

## Environment Variables
```env
# Required
SESSION_SECRET=your-very-secure-secret-key-here
NODE_ENV=development

# Database (already configured)
DB_DEV_HOST=localhost
DB_DEV_USER=your_username
DB_DEV_PASSWORD=your_password
DB_DEV_NAME=your_database
```

## Testing the Session System

### 1. Login Flow
1. Navigate to `/login`
2. Enter credentials (admin/password123)
3. Session created automatically
4. Redirected to homepage with welcome message

### 2. Protected Routes
1. Try accessing `/admin` without login → Redirected to login
2. Login with admin credentials
3. Access `/admin` → Success

### 3. Logout Flow
1. While logged in, navigate to `/logout`
2. Session destroyed
3. Redirected to login page

This session management system provides a secure, scalable, and user-friendly authentication experience for your Node.js application.