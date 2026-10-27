# Trip Management System

> **Documentation note:** This README documents the application represented by the current repository source. It describes implemented code and calls out incomplete or inconsistent areas rather than treating planned architecture or mock screens as completed functionality.
>
> **Confidentiality note:** This project appears to be associated with a banking environment. Publish this documentation or the source code only if the project owner has explicitly authorized it. Do not commit real employee data, database backups, credentials, tokens, internal URLs, or other confidential material.

## Contents

- [1. System Overview](#1-system-overview)
- [2. Technology Stack](#2-technology-stack)
- [3. High-Level Architecture](#3-high-level-architecture)
- [4. Business Roles](#4-business-roles)
- [5. End-to-End Business Workflow](#5-end-to-end-business-workflow)
- [6. Functional Modules](#6-functional-modules)
- [7. Application Statuses](#7-application-statuses)
- [8. Frontend Structure](#8-frontend-structure)
- [9. Backend Structure](#9-backend-structure)
- [10. Database Model](#10-database-model)
- [11. REST API Reference](#11-rest-api-reference)
- [12. Authentication and Authorization](#12-authentication-and-authorization)
- [13. Configuration and Local Setup](#13-configuration-and-local-setup)
- [14. Testing and Troubleshooting](#14-testing-and-troubleshooting)
- [15. Implementation Notes and Known Gaps](#15-implementation-notes-and-known-gaps)
- [16. Security and Data-Handling Checklist](#16-security-and-data-handling-checklist)

---

## 1. System Overview

The Trip Management System is a web application for administering employee trips. It provides functionality for creating trip records, defining departure batches and room capacity, collecting employee applications, routing applications to line managers for decisions, selecting applicants, recording outcomes, and presenting application and approval history.

The application is organized around two main business records:

- **Trip:** the trip offering, including its title, destination, registration window, duration, lifecycle status, and associated batches.
- **Application:** an employee's request to participate in a particular trip and batch. It stores requested rooms, transport and pickup information, price, participants, approval status, and selection outcome.

A trip can have multiple batches. Each batch has its own date range and room capacity. An application belongs to one employee, one trip, and one batch.

The current repository implements an Angular frontend, a Spring Boot REST API, and a SQL Server persistence layer. Some pages or service methods are placeholders or use demo/static data; those are identified in the implementation notes below.

## 2. Technology Stack

### Frontend

- Angular 22
- TypeScript
- Angular Router
- Angular `HttpClient`
- RxJS
- Bootstrap 5
- HTML and CSS

### Backend

- Java 21
- Spring Boot 4.1
- Spring Web / REST controllers
- Spring Data JPA and Hibernate
- Spring Security
- JSON Web Tokens (JWT)
- Bean Validation dependency
- Lombok
- Springdoc OpenAPI / Swagger UI

### Database

- Microsoft SQL Server
- Relational schema mapped through JPA entities
- SQL Server JDBC driver
- H2 is also declared as a runtime dependency, but the checked-in main configuration is set up for SQL Server.

### Development tools

- npm
- Angular CLI
- Maven
- Git
- Postman or a similar HTTP client
- SQL Server management tooling

## 3. High-Level Architecture

```text
User's Browser
     |
     v
Angular UI
  - Pages and forms
  - Router and route guards
  - Services using HttpClient
  - JWT interceptor
     |
     | HTTP / JSON
     v
Spring Boot REST API
  - Controllers: HTTP endpoints
  - Services: business rules and workflows
  - Repositories: database access
  - Entities and DTOs: persistence and API shapes
  - Spring Security + JWT filter
     |
     | JPA / Hibernate
     v
Microsoft SQL Server
  - Employees and roles
  - Trips and batches
  - Applications and participants
  - Statuses and approval history
  - Selection requests
```

### Request lifecycle

A typical authenticated request follows this path:

1. A user interacts with an Angular page.
2. The page calls an Angular service or sends an HTTP request using `HttpClient`.
3. The authentication interceptor adds a `Bearer` token when one is available in browser storage.
4. Spring Security processes the request. The JWT filter validates the token and loads the associated user details.
5. The controller identifies the endpoint and obtains the current employee or request parameters.
6. The service layer applies business rules and reads or updates entities through Spring Data repositories.
7. Hibernate maps entity changes to SQL operations.
8. The API returns a JSON response; Angular updates the page.

The browser is responsible for presenting the interface and collecting input. Business-critical decisions such as authorization, trip state transitions, manager approval, and applicant selection are implemented on the backend. Frontend route guards improve navigation but are not a replacement for backend authorization.

### Architecture boundary

The checked-in executable application is a direct Angular-to-Spring-Boot-to-SQL-Server application. Separate notes in the repository describe a possible broader architecture involving a BFF, Camunda, API Connect, OpenAPI/BPMN/DMN contracts, and enterprise integrations. Those components are **not evidenced as running components in the current Angular/Spring Boot source tree** and should not be described as implemented features unless their code and deployment configuration are added and verified.

## 4. Business Roles

The database and application code use these role names:

| Role | Main responsibility represented in the code |
|---|---|
| `EMPLOYEE` | Browse active trips, submit an application, and view their own requests and history. |
| `LINE_MANAGER` | Review applications from employees who report to them, approve or reject applications, and view manager approval history. |
| `HR_ADMIN` | Create trips and batches, submit trips for HR review, view applications ready for selection, and initiate selection-related operations. |
| `HR_MANAGER` | Review trip submissions, approve/reject/return trips, and review selection requests in the selection-request workflow. |

The employee record can reference a department, a manager (another employee record), and a role. The backend's current-user service derives the authenticated employee from the security context and employee number rather than accepting an arbitrary employee ID for ordinary application actions.

The actual enforcement is split across Spring Security endpoint rules and role checks inside service/controller code. The Angular router also has guards for HR Admin, HR Manager, and Line Manager pages.

## 5. End-to-End Business Workflow

### 5.1 Trip creation

1. An HR Admin opens the trip-creation page.
2. The trip record captures fields such as title, destination, duration, registration opening and closing times, and other trip configuration.
3. The backend creates the trip with the `DRAFT` status and records its creator and creation time.
4. One or more batches can be associated with the trip. A batch stores its start date, end date, number of rooms, active flag, creator, and creation time.

The backend's trip-submission rule requires at least one batch before a trip can be submitted for approval.

### 5.2 Submit a trip for HR review

1. HR Admin submits a trip in `DRAFT` or `RETURNED`.
2. The backend checks the current status and verifies that the trip has at least one batch.
3. The trip moves to `PENDING_APPROVAL`.
4. The HR Manager can retrieve trips waiting for approval.

### 5.3 HR Manager decision on a trip

The HR Manager can take one of three actions on a trip in `PENDING_APPROVAL`:

- **Approve:** changes the trip status to `ACTIVE`.
- **Reject:** changes the trip status to `CANCELLED`.
- **Return:** changes the trip status to `RETURNED`, allowing it to be revised and resubmitted.

The current `TripService` contains TODO comments for persisting decision comments into a trip-history feature; a dedicated trip-history entity/table is not present in the listed entity set.

### 5.4 Employee application

1. An employee browses active trips and opens a trip detail page.
2. The employee chooses a batch and supplies application details.
3. The request may include transport type, pickup point, number of rooms requested, total price, and participant details.
4. The backend resolves the employee from the authenticated user context, loads the trip and batch, and checks that the trip is active.
5. It checks the trip's registration window when opening/closing timestamps are configured.
6. It verifies that the chosen batch belongs to the selected trip.
7. The application is created with the initial status `PENDING_MANAGER`. The backend-generated creation timestamp is used instead of trusting a client-supplied submission time.
8. Participant records are associated with the application.

The current implementation rejects applications before the registration opening time or after the registration closing time. The backend also checks that the requested trip is `ACTIVE` and that the batch belongs to that trip.

### 5.5 Line Manager application review

1. A Line Manager opens the manager task list.
2. The backend returns applications associated with employees reporting to that manager, with a separate pending-task endpoint.
3. The manager approves or rejects an application and may provide comments.
4. An approval moves the application to `APPROVED_BY_MANAGER`.
5. A rejection moves it to `REJECTED_BY_MANAGER`.
6. An approval-history record is written for the decision, including the application, acting employee, role at the time of action, action, comments, and timestamp.

The service includes a manager-ownership validation step. Manager actions are not intended to be performed against arbitrary employees' applications.

### 5.6 Applicant selection

The code supports two selection methods:

- **FIFO:** candidates are ordered by application creation time, oldest first.
- **RANDOM:** the candidate list is shuffled before allocation.

The candidate set is intended to include applications in `APPROVED_BY_MANAGER`. The selection logic moves candidates through `IN_SELECTION` and then assigns a final outcome based on available batch rooms and the number of rooms requested:

- `SELECTED`: the request fits in the remaining room capacity. The system records `selected_at`.
- `WAITLIST`: the request does not fit in the remaining capacity. `selected_at` is cleared.

The selection method is recorded on each processed application. The service also records selection-related actions in approval history.

**Important implementation detail:** there are two `performSelection` overloads in `ApplicationService`: one operates on approved applications for a whole trip, and one filters to a specific trip and batch. The selection-request approval path currently invokes the trip-level overload even though the selection request itself is batch-specific. See [Implementation Notes and Known Gaps](#15-implementation-notes-and-known-gaps).

The allocation code uses `Batch.numberOfRooms` as the capacity measure and subtracts `Application.roomsRequested` from that capacity. It does not currently demonstrate a separate participant-count or confirmed-quota allocation algorithm.

### 5.7 Selection request review

The separate selection-request workflow works as follows:

1. HR Admin submits a request for a specific trip and batch with method `FIFO` or `RANDOM`.
2. The trip must be `ACTIVE`.
3. The selected batch must belong to the trip.
4. A pending request for the same trip and batch prevents another pending request from being submitted.
5. At least one application in that batch must already be `APPROVED_BY_MANAGER`.
6. The request is stored with status `PENDING`.
7. HR Manager can list pending requests and approve or reject them.
8. Approval records the reviewer and review time, then triggers applicant selection.
9. Rejection requires a non-empty reason and records the reviewer, review time, and reason.

The selection request has its own status values (`PENDING`, `APPROVED`, and `REJECTED`) separate from the application status table.

### 5.8 Results, history, and announcement

- Employees can view their requests, previous requests, and application history.
- Line Managers can view approval history.
- HR-facing result functionality retrieves selected/waitlisted applications and includes trip-level allocation metadata.
- The announcement endpoint stores an announcement message on the trip.
- The UI includes an announcement page, but the exact completeness of the page and its data flow should be checked against the current source before treating it as a fully finished production workflow.

## 6. Functional Modules

### Login and identity

- Accepts username and password.
- Uses Spring Security's authentication manager to authenticate credentials.
- Loads the employee record and role.
- Generates a JWT containing employee ID and role claims, with the employee number as the token subject.
- Returns employee information and the token to the frontend.

### Trip administration

- Create a trip.
- Add departure batches.
- Submit a trip for approval.
- Retrieve pending-approval trips.
- Approve, reject, or return a trip.
- Retrieve active trips and trip details.

### Employee application management

- Submit a trip application.
- Include participant records.
- View the current employee's applications.
- View the employee's history.
- Retrieve an individual application and its history, subject to backend access checks.

### Manager tasks

- List applications for the current manager.
- List pending manager applications.
- Approve or reject an application with optional comments.
- Retrieve manager approval history.

### Selection and allocation

- List applicants across active trips, for a trip, or for a trip batch.
- Create a batch-specific selection request.
- Retrieve the latest request for a trip/batch.
- List pending selection requests for an HR Manager.
- Approve or reject a selection request.
- Apply FIFO or random ordering and allocate requested rooms.
- Retrieve the allocation result for a trip.

### Status lookup

The `/api/statuses` endpoint returns status records stored in the database. The UI can use these values to display state labels, but not every UI page necessarily uses the endpoint as its only source of status mapping.

## 7. Application Statuses

The SQL seed script includes these status values. The code may use only a subset in a particular workflow, and status-name spelling/case should remain consistent between the database and application code.

| Status | Meaning in the current workflow |
|---|---|
| `DRAFT` | Trip created but not submitted for review. |
| `PENDING_APPROVAL` | Trip is awaiting HR Manager review. |
| `ACTIVE` | Trip approved and available for the application workflow. |
| `RETURNED` | Trip sent back for revision before resubmission. |
| `CANCELLED` | Trip rejected by the HR Manager in the current trip workflow. |
| `PENDING_MANAGER` | Application awaiting Line Manager decision. |
| `APPROVED_BY_MANAGER` | Application approved by the Line Manager and eligible for selection. |
| `REJECTED_BY_MANAGER` | Application rejected by the Line Manager. |
| `IN_SELECTION` | Application is being processed by selection logic. |
| `SELECTED` | Application fits within the room capacity assigned by the selection routine. |
| `WAITLIST` | Application did not fit within the remaining room capacity. |
| `NOT_SELECTED` | Present in the database seed and referenced by one selection overload, but the current allocation loop shown in that overload assigns `WAITLIST` rather than `NOT_SELECTED`. |
| `Approved`, `Rejected`, `Pending` | Legacy/general values also present in the SQL seed; do not assume these are interchangeable with the workflow-specific uppercase statuses. |

The `selection_requests` table uses a separate text status (`PENDING`, `APPROVED`, `REJECTED`), not a foreign key into the `Status` table.

## 8. Frontend Structure

The Angular application is under `Trip-Management-System/`.

```text
src/app/
├── app.ts
├── app.config.ts
├── app.routes.ts
├── guards/
├── header/
├── models/
├── pages/
│   ├── announcement/
│   ├── app-approval/
│   ├── application/
│   ├── creation/
│   ├── employee-dashboard/
│   ├── follow-up/
│   ├── history/
│   ├── hr-approval/
│   ├── hr-approval-details/
│   ├── login/
│   ├── manager-history/
│   ├── my-requests/
│   ├── publish/
│   ├── selection/
│   └── trip-details/
├── services/
└── shared/
    ├── navbar/
    └── page-header/
```

### Pages and purpose

| Page / route | Purpose represented in the frontend |
|---|---|
| `/login` | Sign in and route the user after successful authentication. |
| `/employee-dashboard` | Browse active trip offerings. |
| `/trip-details` | Display details for a selected trip. |
| `/application` | Collect and submit an application. |
| `/my-requests` | Show the current employee's requests. |
| `/history` | Show application history. |
| `/follow-up/:id` | Show an individual request and its status timeline. |
| `/manager-approval` | Line Manager application tasks. |
| `/approval-history` | Line Manager decision history. |
| `/admin/trips/create` | HR Admin trip creation. |
| `/admin/trips/publish` | HR Admin trip submission/publishing UI. |
| `/admin/trips/selection` | HR Admin selection interface. |
| `/admin/trips/approvals` | HR Manager trip approval list. |
| `/admin/trips/approvals/:id` | HR Manager trip approval details and decision actions. |
| `/admin/trips/announcement` and `/admin/trips/announcement/:tripId` | Announcement interface. |

### Frontend services

- `AuthService`: calls the login API.
- `TripService`: exposes active-trip retrieval; its pending-trip method currently returns an empty observable rather than calling the backend.
- `ApplicationService`: application-related HTTP operations.
- `HrTripService`: retrieves allocation results.
- `StatusService`: retrieves status records and caches the observable with `shareReplay(1)`.
- `UserService`: user-related frontend operations.
- `AnnouncementService`: announcement-related frontend operations.
- `auth.interceptor.ts`: adds the bearer token to outgoing HTTP requests when available.

### Route guards

The routes use guards for HR Admin, HR Manager, and Line Manager screens. The guards read the current user from browser session storage and redirect users who do not have the expected role. This protects navigation and improves the user experience; the API must still enforce authorization independently.

## 9. Backend Structure

The Spring Boot application is under `tripsystem-Back/tripsystem-Back/`.

```text
src/main/java/com/scb/tripsystem/
├── config/
│   ├── CorsConfig.java
│   ├── DataSeeder.java
│   └── SecurityConfig.java
├── controller/
│   ├── ApplicationController.java
│   ├── AuthController.java
│   ├── HrTripController.java
│   ├── SelectionController.java
│   ├── StatusController.java
│   ├── SwaggerController.java
│   └── TripController.java
├── dto/
├── entity/
├── repository/
├── security/
│   ├── CustomUserDetailsService.java
│   ├── JwtAuthenticationFilter.java
│   └── JwtService.java
├── service/
│   ├── AllocationService.java
│   ├── ApplicationService.java
│   ├── CurrentUserService.java
│   ├── SelectionService.java
│   ├── StatusService.java
│   └── TripService.java
└── TripsystemApplication.java
```

### Responsibilities by layer

- **Controllers:** define HTTP routes, read path/query/body values, obtain the current user where applicable, and return response DTOs.
- **Services:** contain business rules such as trip lifecycle validation, registration-window checks, manager decisions, selection, and room allocation.
- **Repositories:** provide database queries through Spring Data JPA, including status-based and employee/manager-based lookups.
- **Entities:** map persistent tables and relationships.
- **DTOs:** shape request and response payloads rather than exposing every entity field directly.
- **Security classes:** load user details, generate/validate JWTs, and populate Spring Security's authentication context.
- **Configuration:** configure CORS, endpoint authorization, and optional seed data.

## 10. Database Model

The SQL script defines these principal tables. Column names below are summarized from the schema and JPA entities; consult the actual SQL script for exact data types, constraints, and indexes.

| Table / entity | Purpose | Key relationships |
|---|---|---|
| `Employees` / `Employee` | Employee identity, employee number, name, email, active state, password, and organizational links. | Links to `Departments`, `Roles`, a manager employee, and the employee who created the record. |
| `Roles` / `Role` | Role names and active flags. | Referenced by employees. |
| `Departments` / `Department` | Department records. | Referenced by employees. |
| `Status` / `Status` | Status IDs and status names used by trips and applications. | Referenced by trips and applications. |
| `Trips` / `Trip` | Trip title, destination, registration window, duration, status, creator, allocation metadata, and announcement message. | Links to status and creator; one trip has many batches and applications. |
| `Batches` / `Batch` | Departure date range, room capacity, active flag, creator, and associated trip. | Each batch belongs to a trip and can be referenced by applications. |
| `Applications` / `Application` | Employee's request, selected trip and batch, status, transport/pickup, room count, total price, creation/selection timestamps, and selection method. | Links to employee, trip, batch, status; has participants and approval-history records. |
| `Application_Participants` / `ApplicationParticipant` | Names, relationships, and dates of birth for participants attached to an application. | Each participant belongs to one application. |
| `Approval_History` / `ApprovalHistory` | Audit trail for application actions, actor, role, comments, and timestamp. | Links to an application and the employee who performed the action. |
| `selection_requests` / `SelectionRequestEntity` | Batch-specific selection request, method, request status, requester, reviewer, timestamps, and rejection reason. | Links to a trip, batch, requesting employee, and optional reviewing employee. |
| `Fields`, `FieldType` | Additional tables present in the SQL script. | Their role in the current executable workflow is not established by the primary JPA entity set listed above. |

### Relationship summary

```text
Department 1 ---- * Employee
Role       1 ---- * Employee
Employee   1 ---- * Employee (manager relationship)
Employee   1 ---- * Trip (created_by)
Trip       1 ---- * Batch
Trip       1 ---- * Application
Batch      1 ---- * Application
Employee   1 ---- * Application
Status     1 ---- * Trip
Status     1 ---- * Application
Application 1 -- * ApplicationParticipant
Application 1 -- * ApprovalHistory
Employee   1 ---- * ApprovalHistory (action_by)
Trip       1 ---- * SelectionRequest
Batch      1 ---- * SelectionRequest
Employee   1 ---- * SelectionRequest (requester/reviewer)
```

### Important persistence details

- JPA/Hibernate maps entity properties to SQL Server tables.
- Application submission timestamps are generated on the server through the entity's creation-timestamp mapping.
- Application status and trip status are represented by references to status records.
- Selection request statuses are stored directly as text in the selection-request table.
- Room allocation is performed using the room count on the batch and the room count requested by each application.

## 11. REST API Reference

The routes below are taken from the controllers in the repository. The exact response fields are defined by the DTOs. Requests requiring authentication should include a valid bearer token unless the endpoint is explicitly configured as public.

### Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate using `username` and `password`; returns employee details and a JWT. |
| `POST` | `/api/auth/encode` | Returns a password hash for the supplied password. This endpoint is currently included in the public auth route group and should be reviewed before any deployment. |

### Trips

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/trips` | Create a trip. HR Admin role required by the service/security configuration. |
| `POST` | `/api/trips/{tripId}/batches` | Add a batch to a trip. |
| `POST` | `/api/trips/{tripId}/submit` | Submit a draft/returned trip for HR approval. |
| `GET` | `/api/trips/pending` | List trips awaiting HR Manager approval. |
| `POST` | `/api/trips/{tripId}/approve` | Approve a pending trip. |
| `POST` | `/api/trips/{tripId}/reject` | Reject a pending trip. |
| `POST` | `/api/trips/{tripId}/return` | Return a pending trip for revision. |
| `GET` | `/api/trips/active` | List active trips. |
| `GET` | `/api/trips/{tripId}` | Retrieve trip details. |

### Applications

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/applications?tripId={tripId}&batchId={batchId}` | Submit an application for a trip and batch. Participant/application data is sent in the JSON body. |
| `GET` | `/api/applications/my` | List the current employee's applications. |
| `GET` | `/api/applications/my/history` | List the current employee's history. |
| `GET` | `/api/applications/{applicationId}` | Retrieve one application, subject to service-level access checks. |
| `GET` | `/api/applications/{applicationId}/history` | Retrieve an application's approval history after access checks. |
| `GET` | `/api/applications/manager` | List applications for the current Line Manager's reports. |
| `GET` | `/api/applications/manager/pending` | List pending manager tasks. |
| `POST` | `/api/applications/{applicationId}/approve` | Approve an application as Line Manager; optional comments may be supplied. |
| `POST` | `/api/applications/{applicationId}/reject` | Reject an application as Line Manager; optional comments may be supplied. |
| `GET` | `/api/applications/trip/{tripId}/ready-for-selection` | List manager-approved applications for selection. |
| `POST` | `/api/applications/trip/{tripId}/select` | Start trip-level selection using `FIFO` or `RANDOM`. |
| `GET` | `/api/applications/manager/approval-history` | Retrieve manager approval history. |

### Selection requests

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/selections/applicants` | List applicants for active trips. |
| `GET` | `/api/selections/trip/{tripId}/applicants` | List applicants for one trip. |
| `GET` | `/api/selections/trip/{tripId}/batch/{batchId}/applicants` | List applicants for one trip batch. |
| `GET` | `/api/selections/trip/{tripId}/batch/{batchId}/latest` | Retrieve the latest selection request for a trip/batch; returns no content if none exists. |
| `POST` | `/api/selections/trip/{tripId}/batch/{batchId}/requests?hrUserId={id}` | Create a selection request for a batch. Body includes the selection method. |
| `GET` | `/api/selections/pending?managerId={id}` | List pending selection requests for the specified HR Manager. |
| `POST` | `/api/selections/requests/{requestId}/approve?managerId={id}` | Approve a selection request. |
| `POST` | `/api/selections/requests/{requestId}/reject?managerId={id}` | Reject a selection request; request body carries comments/rejection reason. |

**Security review required:** unlike the application endpoints that derive the current user from the JWT, several selection-request controller methods accept `hrUserId` or `managerId` as query parameters. Verify that these IDs cannot be spoofed and that controller/service authorization is consistently enforced before using these routes in a real environment.

### HR allocation and announcement

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/hr/trips/{tripId}/allocation/result` | Return the trip name, allocation method, quota metadata, and applications with selection-related statuses. |
| `POST` | `/api/hr/trips/{tripId}/announcement/publish` | Store an announcement message for a trip. The controller checks for the HR Manager role. |

### Statuses and API documentation

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/statuses` | List status records. |
| `GET` | `/swagger` | Redirect to Swagger UI. |
| `GET` | `/v3/api-docs/**` | OpenAPI document routes provided by Springdoc. |

## 12. Authentication and Authorization

### Login and JWT

1. The frontend submits the employee number/username and password to `/api/auth/login`.
2. Spring Security authenticates the credentials using the configured user-details service and password encoder.
3. The backend creates a signed JWT with the employee number as the subject and employee ID/role claims.
4. The frontend receives the token and uses it for subsequent API requests.
5. The JWT filter reads the `Authorization: Bearer <token>` header, validates the token, reloads user details, and sets the security context.

The configured token expiration is controlled by `jwt.expiration`. The signing key must be provided through a secure environment-specific configuration mechanism; it must not be committed to source control.

### Authorization layers

- **Spring Security:** endpoint-level role rules and stateless request handling.
- **Controller/service checks:** current employee and role checks for operations such as trip management, manager decisions, and selection workflows.
- **Angular route guards:** role-aware navigation in the browser.

Do not rely on client-side role values or hidden buttons as a security boundary. The backend must independently derive identity from the validated token and check that the user is authorized to access the requested resource.

## 13. Configuration and Local Setup

These are general local-development steps. Use approved local credentials and a disposable development database. Do not reuse production or confidential database files.

### Prerequisites

- JDK 21
- Maven (or the project's Maven wrapper, if added)
- Node.js and npm compatible with the installed Angular CLI
- SQL Server instance
- A clean development database initialized from an approved schema script

### Backend

1. Open a terminal in `tripsystem-Back/tripsystem-Back/`.
2. Configure the datasource URL, database name, username, and password using environment variables or an untracked local configuration file.
3. Configure a fresh JWT signing secret outside source control.
4. Confirm that the database schema matches the JPA entity mappings and required status records.
5. Start the backend with Maven:

   ```bash
   mvn spring-boot:run
   ```

6. The checked-in properties file configures the backend to listen on port `8081`; verify the active local configuration before starting.

### Frontend

1. Open a terminal in `Trip-Management-System/`.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the Angular development server:

   ```bash
   npm start
   ```

4. The package script starts Angular on port `4200` and uses `proxy.conf.json`. Some services also use explicit `http://localhost:8081` URLs, so confirm the actual request URLs in browser developer tools if a call fails.

5. Open the local frontend at `http://localhost:4200/`.

### Database

- Use the approved `DB/DB.sql` schema only after reviewing it for sensitive data and ensuring it is suitable for local development.
- Do not distribute or commit a database backup unless the data has been verified as synthetic and publication is authorized.
- The backend configuration uses `spring.jpa.hibernate.ddl-auto=none`; the application does not automatically create or update the schema through Hibernate in that configuration.
- Check that the status rows required by the code exist. The code expects workflow-specific status names such as `DRAFT`, `PENDING_APPROVAL`, `ACTIVE`, `PENDING_MANAGER`, and `APPROVED_BY_MANAGER`.

## 14. Testing and Troubleshooting

### Available commands

Frontend:

```bash
npm test
npm run build
```

Backend:

```bash
mvn test
mvn spring-boot:run
```

Run these commands from their respective project directories. A successful compile does not by itself prove that every business workflow works end-to-end.

### Common problems

| Symptom | What to check |
|---|---|
| Login fails | Employee number, password hash format, user active state, role mapping, and backend logs. |
| API returns `401` | Token presence, token expiration, signing-secret consistency, and the `Authorization` header. |
| API returns `403` | The authenticated role and endpoint-level authorization rules. |
| Browser reports CORS errors | Frontend origin, backend CORS configuration, and whether the browser is calling the intended host/port. |
| Trip/application is rejected by business logic | Trip status, registration opening/closing times, batch-to-trip relationship, and required status rows. |
| `Status not found` exception | The exact status name expected by the service must exist in the database. Check capitalization and spelling. |
| Selection returns no candidates | At least one application must be in `APPROVED_BY_MANAGER` for the relevant trip/batch. |
| Allocation result is empty | Check application statuses; the result query returns only selected/waitlisted and other configured selection outcome statuses. |
| Frontend page shows empty data | Check whether the service calls a real API or currently returns mock/empty data; inspect Network tab and console. |
| SQL Server connection fails | SQL Server availability, database name, JDBC URL, network/port, database user permissions, and local TLS settings. |

## 15. Implementation Notes and Known Gaps

These are important observations from the current source and should be resolved or consciously accepted before presenting the application as production-ready.

1. **Trip-level versus batch-level selection:** `ApplicationService` contains both trip-level and batch-level selection methods. `SelectionService.approveRequest` currently calls the trip-level overload after approving a batch-specific request. This can process approved applications across the trip instead of only the batch named in the request. Confirm the intended behavior and route the request to the appropriate overload.
2. **Selection algorithm naming:** `Trip.allocationMethod` comments mention `LOTTERY` / `FCFS`, while the selection services accept `RANDOM` / `FIFO`. Define one consistent public vocabulary and mapping.
3. **Capacity semantics:** allocation uses `number_of_rooms` and `rooms_requested`. Confirm whether one application consumes rooms or participants, and whether the capacity rule matches the actual business policy.
4. **Quota metadata:** `confirmedQuota` and `waitlistQuota` are returned in allocation results, but the shown allocation loop uses batch room capacity as its selection limit. Do not assume those quota fields drive the allocation unless the code is updated and verified.
5. **`NOT_SELECTED` status:** the status is present in the database seed and loaded by one selection method, but the displayed allocation branches assign `SELECTED` or `WAITLIST`. Confirm whether `NOT_SELECTED` is still needed.
6. **Frontend placeholder data:** `TripService.getPendingTrips()` returns an empty observable, and the publish page contains hard-coded example trip/departure data. Some screens may therefore be illustrative rather than fully connected to live backend data.
7. **Seed data:** `DataSeeder` can create initial status/role/user/trip/batch records when corresponding tables are empty. Review this behavior and ensure it cannot create demo identities or data in a non-development environment.
8. **Selection endpoint identity:** selection-request controller methods receive employee/manager IDs as query parameters. Prefer deriving the actor from the validated authentication context and checking the role/ownership on the server.
9. **Trip decision comments/history:** the trip reject/return methods include TODO notes for saving comments in trip history. The current entity list does not show a dedicated trip-history entity.
10. **Error handling:** several business-rule failures throw `RuntimeException` or `IllegalStateException`. Verify that the API returns consistent HTTP status codes and safe error messages rather than exposing internal details.
11. **Logging:** review authentication and current-user logs to ensure usernames, employee information, and exception details are not exposed in shared or production logs.
12. **Broader architecture notes:** repository notes mentioning Camunda, a BFF, API Connect, BPMN, and DMN appear to describe a target/reference design. Keep documentation clear about which components are implemented in this codebase and which are proposals or external dependencies.
13. **Automated tests:** test files exist for many Angular pages, but their presence does not prove coverage of all critical paths. Add backend tests for permissions, registration windows, batch validation, manager ownership, selection fairness, capacity boundaries, and concurrent submissions.

## 16. Security and Data-Handling Checklist

Before making this repository public or sharing it outside its authorized audience:

- [ ] Confirm that the project owner permits publication of the code, project context, screenshots, architecture, and documentation.
- [ ] Remove database usernames/passwords and JWT signing secrets from tracked configuration.
- [ ] Rotate any credentials or signing keys that have ever been committed, not just remove them from the latest file.
- [ ] If a secret was committed, review Git history and all remote branches/tags; consider history cleanup after rotation.
- [ ] Check SQL scripts, database backups, IDE data-source files, notebooks, logs, test fixtures, and Git history for real employee or internal data.
- [ ] Remove database backups and data exports from public repositories unless the data is confirmed synthetic and publication is explicitly approved.
- [ ] Ensure `.gitignore` excludes local configuration, build output, dependency folders, IDE-local files, logs, database backups, and secret files.
- [ ] Move configuration to environment variables or an approved secret manager.
- [ ] Review the public `/api/auth/encode` endpoint and ensure it is not unnecessarily exposed.
- [ ] Review all selection endpoints for server-side authentication, role validation, and identity derived from the JWT.
- [ ] Ensure production CORS, transport security, logging, password storage, error handling, and database permissions follow the organization's security requirements.

---

## Summary

The current implementation provides a role-based employee trip workflow built with Angular, Spring Boot, Spring Security/JWT, JPA/Hibernate, and SQL Server. Its core domain consists of trips, batches, employee applications, participants, approval history, status records, and selection requests.

The most important areas to verify before relying on the system are the batch-specific selection path, capacity/quota semantics, identity enforcement on selection-request endpoints, placeholder frontend pages, and the secure handling of configuration and database artifacts.
