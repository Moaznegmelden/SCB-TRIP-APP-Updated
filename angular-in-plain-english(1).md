# Angular in Plain English

## What Angular is

Angular is a framework for building web applications in the browser.

HTML alone can show a page. Angular adds structure and behavior:

- It turns a large screen into small components.
- It connects data to HTML.
- It changes the screen when data changes.
- It maps browser URLs to pages.
- It gives services to pages without manually creating them.
- It validates forms and calls backend APIs.

For this project, Angular is the employee and HR user interface. It does not own the final business decision.

## A simple analogy

Think of the application as a restaurant:

| Angular concept | Restaurant analogy | In this starter |
|---|---|---|
| Component | A station that prepares one part of the meal | TripListPage prepares the trips screen |
| Template | The plate seen by the customer | trip-list.page.html |
| SCSS | Presentation and visual style | trip-list.page.scss |
| TypeScript class | Instructions and page behavior | trip-list.page.ts |
| Service | The person who fetches ingredients | TripsService supplies trip data |
| Model | The agreed shape of an ingredient | Trip interface |
| Route | The sign that sends a visitor to a station | app.routes.ts |
| Dependency injection | Angular delivers a needed service | inject(TripsService) |

## The five files to understand first

### app.routes.ts

This file maps a URL to a page. The empty path means the home page. Angular lazy-loads TripListPage only when it is needed.

### trip-list.page.ts

This is the component class. The component asks Angular for TripsService and exposes its trips signal to the HTML.

### trip-list.page.html

This is the template users see. Important syntax:

- @for repeats the trip card for each trip.
- {{ value }} displays a TypeScript value.
- [disabled] sets an HTML property from data.
- (click) would run a TypeScript method after a click.

### trip-list.page.scss

This styles only the trips page. Angular keeps component styles scoped so they do not accidentally change unrelated screens.

### trips.service.ts

This is the data boundary for the feature. It uses mock data now. Later it will call the BFF endpoint:

GET /api/vacations-bff/v1/trips

The page should not know whether data is mocked or remote.

## What a signal is

A signal is a value Angular watches.

TripsService exposes trips as a signal. The template reads it with trips(). If the service changes the signal, Angular updates the screen.

For this starter:

- signal holds frontend screen state.
- HttpClient will call the BFF.
- SQL Server and Camunda do not live inside Angular.

## What happens when a user opens the page

1. The browser loads main.ts.
2. main.ts starts the root App component.
3. Angular reads app.routes.ts.
4. The home route loads TripListPage.
5. Angular creates TripsService and gives it to the page.
6. The HTML loops over the trip data.
7. The browser displays the cards.

Later, step 5 will call the BFF instead of reading local mock data.

## Frontend versus backend responsibility

The frontend may:

- Show fields and validation messages.
- Help users complete a form.
- Display eligibility explanations returned by the BFF.
- Disable actions that are clearly unavailable.
- Send commands and show their result.

The frontend must not:

- Trust an employee number typed in the browser.
- Guarantee the last available seat.
- Approve a request.
- Calculate payroll deductions as the final authority.
- Start enterprise calls directly through API Connect.
- call Camunda directly.

The BFF repeats all important validation because browser code can be changed by a user.

## First Angular habits

- Read the route, page, template, style, service, and model together.
- Keep data access in a service, not scattered across components.
- Use semantic HTML before adding custom widgets.
- Make forms keyboard accessible and show useful error messages.
- Keep pull requests small enough to explain in five minutes.
- Run npm run check before asking for review.

Angular feels large at first because it gives names to many responsibilities. The starter uses only the pieces needed for the first screen.
