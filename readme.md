
*Project Title:* Personal Finance Tracker with Freemium Tier System

*Prepared By:* Prakhar Tripathi

---

*1. Introduction*

This document outlines the software requirements for a web-based Personal Finance Tracker. The system is designed to help users track income, expenses, budgets, and view financial analytics. It will support a freemium model, offering different feature sets based on the user's tier: Free, Plus, and Premium.

*2. Overall Description*

The app will be built using the MERN stack (MongoDB, Express, React, Node.js). It will feature user authentication, income/expense tracking, budget management, and visual analytics. The UI will be responsive and accessible via modern browsers.

RBAC (Role-Based Access Control) will be implemented to control feature access according to subscription tier.

*3. System Features by Tier*

*Free Tier:*

* User registration and login
* Add/edit/delete income and expenses
* View list of transactions
* View basic monthly summary (total income and expenses)

*Plus Tier:*

* All Free features
* Set and track budgets
* Category-wise analytics (charts)
* Download reports in .txt format
* View spending trends by category

*Premium Tier:*

* All Plus features
* Advanced reports in downloadable PDF format
* Recurring transactions setup
* Alerts and reminders for bills/budget limits
* Monthly financial goal tracking
* Sync with external accounts (mock integration)

*4. Functional Requirements*

* FR1: The system shall allow users to create and manage their account.
* FR2: The system shall allow users to record and edit income and expense entries.
* FR3: The system shall restrict or grant access to features based on user tier.
* FR4: The system shall generate financial summaries and charts based on transaction data.
* FR5: The system shall allow Plus and Premium users to download reports.
* FR6: The system shall notify Premium users with alerts/reminders for financial activities.

*5. Non-Functional Requirements*

* NFR1: The app shall respond within 2 seconds for user actions.
* NFR2: The system should be scalable to support tier-based user access.
* NFR3: Data should persist using MongoDB and be secured.
* NFR4: The application should have unit tests for core features.

*6. Constraints*

* Total time for project completion: \~210 hours (6 weeks at \~35 hrs/week)
* All features must be achievable with MERN stack, without reliance on paid third-party services.
* Must maintain a clean, modular codebase to allow for future enhancements.

*7. Assumptions and Dependencies*

* User base is individual users (not organizations).
* Deployment can be done using services like Vercel/Render/Heroku.
* Chrome or Firefox is the target browser for development.

*8. Future Scope*

* Integration with real bank APIs for sync
* Email invoice generation
* Mobile version using React Native
