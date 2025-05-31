# Task Manager App - Application Structure and UI/UX Design

This document outlines the structure, key pages, and user flow for the Task Manager application.

## 1. Application Structure

The application will be a Single Page Application (SPA) built using React (or potentially plain HTML/CSS/JS as per the user's options). It will communicate with a backend API (Node.js/Express) for data persistence and user authentication.

## 2. Key Pages and Components

### a. Authentication Pages

*   **Login Page (`/login`)**
    *   **Components:**
        *   Header/Logo
        *   Email Input Field
        *   Password Input Field
        *   Login Button
        *   Link to Signup Page ("Don't have an account? Sign Up")
        *   Error Message Display Area
    *   **Functionality:** Submits credentials to the backend, handles success (redirect to Dashboard) or failure (show error message).

*   **Signup Page (`/register`)**
    *   **Components:**
        *   Header/Logo
        *   Username Input Field
        *   Email Input Field
        *   Password Input Field
        *   Confirm Password Input Field
        *   Signup Button
        *   Link to Login Page ("Already have an account? Login")
        *   Error Message Display Area
    *   **Functionality:** Submits registration details to the backend, handles success (redirect to Login or Dashboard) or failure (show error message).

### b. Main Application Pages (Authenticated Routes)

*   **Task Dashboard (`/`)**
    *   **Components:**
        *   Header (App Name, User Info/Logout Button)
        *   "Add New Task" Button/Link
        *   Task List Area:
            *   Filtering Options (All, Personal, Work, Study, etc.)
            *   Sorting Options (Priority, Due Date, Creation Date)
            *   Search Bar (Phase 7 Feature)
            *   Individual Task Items:
                *   Checkbox (for completion status)
                *   Task Title (strikethrough if completed)
                *   Priority Indicator
                *   Due Date
                *   Category Tag
                *   Edit Button
                *   Delete Button
        *   Empty State Display (when no tasks are present)
    *   **Functionality:** Fetches and displays user's tasks, allows task completion toggling, navigation to edit, triggers deletion, handles filtering and sorting.

*   **Add/Edit Task Page (`/tasks/new` or `/tasks/edit/:id`)**
    *   **Components:**
        *   Header/Navigation (Back to Dashboard)
        *   Form Title ("Add New Task" or "Edit Task")
        *   Title Input Field
        *   Description Text Area
        *   Priority Selector (Dropdown: High, Medium, Low)
        *   Due Date Picker
        *   Category Selector (Dropdown or Tags: Personal, Work, Study)
        *   Save/Update Button
        *   Cancel Button
    *   **Functionality:** Allows users to input/modify task details, validates input, submits data to the backend, redirects to Dashboard on success.

## 3. User Flow

1.  **New User:** Lands on Login -> Clicks "Sign Up" -> Fills Signup form -> Submits -> Redirected to Login (or Dashboard) -> Logs in -> Sees Dashboard.
2.  **Existing User:** Lands on Login -> Fills Login form -> Submits -> Sees Dashboard.
3.  **Adding Task:** On Dashboard -> Clicks "Add New Task" -> Fills Add Task form -> Clicks "Save" -> Redirected to Dashboard (new task appears).
4.  **Editing Task:** On Dashboard -> Clicks "Edit" on a task -> Fills Edit Task form -> Clicks "Update" -> Redirected to Dashboard (task updates).
5.  **Completing Task:** On Dashboard -> Clicks checkbox next to a task -> Task visually marked as complete (e.g., strikethrough).
6.  **Deleting Task:** On Dashboard -> Clicks "Delete" on a task -> Confirmation (optional) -> Task removed from list.
7.  **Filtering/Sorting:** On Dashboard -> Uses filter/sort controls -> Task list updates accordingly.
8.  **Logout:** On Dashboard -> Clicks Logout -> Redirected to Login page.

## 4. UI/UX Considerations

*   **Responsiveness:** The design must adapt to various screen sizes (desktop, tablet, mobile).
*   **Clarity:** Clear visual hierarchy, intuitive navigation, and feedback on actions.
*   **Consistency:** Consistent design language (colors, fonts, button styles) across all pages.
*   **Accessibility:** Consider ARIA attributes, keyboard navigation, and sufficient color contrast.
*   **Simplicity:** Avoid clutter; focus on the core task management functionality.
*   **Feedback:** Provide visual feedback for loading states, successful operations, and errors.
