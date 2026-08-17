# Project Structure

## The full system

The project has several layers. They are separate because each has a different job.

| Layer | Technology | Simple responsibility |
|---|---|---|
| Frontend | Angular | Displays screens and gathers user input |
| BFF | Spring Boot | Secures requests and runs application rules |
| Database | SQL Server | Stores the authoritative business state |
| Workflow | Camunda 8 | Controls tasks, timers, reminders, retries, and next steps |
| Integration | IBM API Connect | Protects and routes calls to enterprise systems |
| Contracts | OpenAPI, BPMN, DMN, SQL | Shared agreements between teams |

## End-to-end request flow

Example: an employee submits a trip request.

1. Angular validates required screen fields.
2. Angular sends POST /applications/{id}/submit to the BFF.
3. The BFF validates identity, ownership, policy, duplicate requests, and current state.
4. SQL Server saves the submission and an outbox command in one transaction.
5. A reliable worker starts the Camunda process.
6. Camunda creates the next task or invokes a worker.
7. Enterprise calls leave the BFF through API Connect.
8. Angular reads the resulting status from the BFF.

## Recommended repository shape

~~~text
trips-vacations-system/
├── trips-vacations-fe/       Angular user interface
├── trips-vacations-bff/      Spring Boot API and Camunda workers
├── contracts/
│   └── openapi/              FE/BFF contract
├── workflow/
│   ├── bpmn/                 Process models
│   └── dmn/                  Business decision tables
├── database/                 Versioned SQL migrations
└── docs/                     Architecture and team guidance
~~~

This workspace already contains the contracts under deliverables. Do not make a second copy unless the team chooses a final repository layout; duplicate contracts drift.

## Angular starter structure

~~~text
trips-vacations-fe/
├── public/
│   └── assets/brand/         Static images copied unchanged to the build
├── src/
│   ├── app/
│   │   ├── features/
│   │   │   └── trips/
│   │   │       ├── trip-list.page.ts
│   │   │       ├── trip-list.page.html
│   │   │       ├── trip-list.page.scss
│   │   │       ├── trip.model.ts
│   │   │       └── trips.service.ts
│   │   ├── app.config.ts     Application-wide providers
│   │   ├── app.routes.ts     URL-to-page mapping
│   │   ├── app.ts            Root component
│   │   ├── app.html          Header and router outlet
│   │   └── app.scss          Root-only styles
│   ├── index.html            Browser entry document
│   ├── main.ts               Starts Angular
│   └── styles.scss           Global tokens and reset
├── angular.json              Angular build configuration
├── package.json              Commands and dependencies
├── proxy.conf.cjs            Local /api forwarding to the BFF
└── tsconfig.json             Strict TypeScript rules
~~~

## Where should a new frontend file go?

Use this decision:

1. Is it used by one business feature? Put it inside that feature.
2. Is the same UI or utility genuinely used by two or more features? Move it to shared.
3. Is it application-wide infrastructure such as authentication, error handling, or configuration? Put it in core only when it exists.

Do not create core, shared, factories, facades, or state stores in advance. Add a folder when a real second use proves the need.

## Suggested feature folders as the product grows

~~~text
features/
├── trips/             Catalog and trip details
├── applications/      Draft, family, transport, review, submit
├── requests/          Employee history and timeline
├── tasks/             Manager and HR decisions
├── administration/    Trip setup and publication
└── reports/           Capacity, waitlist, workflow health, export
~~~

Each feature may contain:

- pages: route-level screens.
- components: smaller feature-only UI pieces.
- models: TypeScript shapes used by the feature.
- services: BFF calls and feature state.

Create those subfolders only when the feature has enough files to justify them.

## Source-of-truth rules

| Question | Source of truth |
|---|---|
| What should the screen display now? | Angular component state |
| What API shape is allowed? | OpenAPI contract |
| Is the employee allowed to act? | BFF authorization |
| Is capacity available? | SQL transaction |
| What task happens next? | Camunda process |
| What policy outcome applies? | Versioned DMN plus BFF validation |
| How do we reach payroll or HRMS? | API Connect-managed integration |

## Naming rules

- Pages end with .page.
- Angular services end with .service.
- Models use singular business names such as Trip and Application.
- API paths use business nouns, not screen names.
- Avoid abbreviations unless they are organization standards such as BFF, HRMS, API, BPMN, or DMN.

## Review boundaries for fresh interns

Interns can own:

- Presentational components.
- Empty, loading, and error states.
- Accessible form fields.
- Mock data and contract examples.
- Unit tests for validators and status mapping.
- Documentation and small dashboard panels.

Senior review is mandatory for:

- Authentication and authorization.
- Family-data privacy and masking.
- Capacity concurrency and waitlist fairness.
- Camunda retries, incidents, and compensation.
- API Connect credentials and provider contracts.
- Payroll instructions, reversals, and production deployment.
