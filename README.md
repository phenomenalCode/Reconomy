Netlify link: https://darius-reconomy-proj.netlify.app/
Check-in system and admin dashboard designed for Reconomy AB. A full-stack employee time-tracking system built with Node.js, Express, and MySQL, featuring Employee Management , Create, update, and filter employee records Time Logging , Log check-in/out events with optional comments Admin Login , Session-based authentication for protected routes Cross-Origin Support , Fully functional CORS setup for Netlify Heroku deployment, Backend hosted on Heroku, frontend on Netlify
Made by myself :)


This is a desktop-oriented web application designed for use on desktop and laptop screens. The interface is not optimized for mobile devices, as responsive media queries have not been implemented.

Security Architecture of the Reconomy Check-In System

User Browser
   ↓ HTTPS
Netlify (Frontend)
   ↓ HTTPS + CORS
Heroku API (Express)
   ↓
MySQL Database

THREATS AND MITIGATIONS
SQL Injection

Risk: User input is used in employee filters, record creation, and time log queries. If input were directly concatenated into SQL statements, an attacker could manipulate queries to access, modify, or delete employee data.
Mitigation: All database queries use prepared statements via mysql2/promise. Parameterized queries separate SQL logic from user input, ensuring that input is treated strictly as data and cannot alter query structure. This effectively prevents injection attacks even when malicious payloads are submitted.

Session Hijacking

Risk: The admin dashboard relies on session-based authentication. If session identifiers were exposed or intercepted, an attacker could impersonate an administrator and gain full access to employee management features.
Mitigation: Session IDs are stored in HTTP-only cookies, preventing access from client-side JavaScript. Sessions are transmitted over HTTPS, reducing the risk of interception, and protected routes require a valid active session before access is granted.

CORS Abuse

Risk: The frontend and backend are hosted on separate domains, which introduces the risk of unauthorized websites making authenticated requests to the API if cross-origin access is not properly restricted.
Mitigation: CORS is configured with an explicit origin whitelist, allowing requests only from the approved frontend domain. This prevents malicious third-party sites from interacting with the backend API and reduces the attack surface for cross-origin attacks.

