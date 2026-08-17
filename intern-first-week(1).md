# Intern First-Week Plan

The goal of week one is not to finish the product. It is to make every intern able to run, explain, change, and safely review one small Angular story.

## Day 1 - See the whole system

- Read the startup-kit README.
- Review the one-minute architecture map.
- Run npm install and npm start.
- Open the trips screen and inspect it with browser developer tools.
- Explain the difference between Angular, the BFF, SQL Server, Camunda, and API Connect.

Check: each intern can answer, “Why does the browser call only the BFF?”

## Day 2 - Follow one Angular screen

- Find the home route.
- Open TripListPage, its HTML, its SCSS, Trip, and TripsService.
- Change one mock trip title and status.
- Add a fourth mock trip.
- Run npm run check.

Check: each intern can explain component, template, service, model, route, and signal.

## Day 3 - Make a small accessible change

Pair on one of these:

- Add a visible empty state when there are no trips.
- Add a status filter using native buttons or a select.
- Improve the mobile layout.
- Add an accessible loading skeleton without animation.

Check: keyboard navigation works, visible focus remains, and no status is conveyed by color alone.

## Day 4 - Learn the contract

- Open the OpenAPI file under deliverables/api.
- Find GET /trips and its response.
- Compare TripSummary with the starter Trip model.
- Write a field-mapping note before coding.
- With a senior, replace mock data on a separate branch or connect to a mock server.

Check: the page never calls HRMS, payroll, API Connect, or Camunda directly.

## Day 5 - Review and demonstrate

- Rebase or update the branch using the team’s Git policy.
- Run npm run check.
- Ask another intern to review accessibility, naming, and file placement.
- Demonstrate the change in five minutes.
- Explain one item left for a later story and why it is outside the current scope.

## Good first backlog stories

1. Trips catalog empty state.
2. Open/upcoming status filter.
3. Reusable status-pill only after a second screen needs it.
4. Trip-details route using mock data.
5. Application-step header with keyboard-friendly navigation.
6. Error panel that renders an RFC 7807 problem response.
7. Contract example data for GET /trips.
8. Unit test for a pure status-to-label mapping.

## Stories not suitable as an intern’s unsupervised first task

- Login, tokens, route guards, or identity propagation.
- Last-seat allocation or database locking.
- Waitlist selection or cancellation compensation.
- Payroll instruction or reversal.
- Camunda timer, retry, incident, or deployment configuration.
- API Connect credential, truststore, or production route changes.
- Privacy retention or export masking.

Interns may pair on these topics, but a senior engineer owns the design and approval.

## Pull-request checklist

- The story has clear acceptance criteria.
- The change is limited to one feature.
- npm run check passes.
- Loading, empty, success, and error behavior are considered where relevant.
- Keyboard use and visible focus are checked.
- No secrets or sensitive employee/family data appear in code or logs.
- Important decisions remain in the BFF, SQL, Camunda, or DMN.
- The author can explain every changed line.
