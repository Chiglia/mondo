# Client

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.6.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Continent directory

Continent pages display a regional crop of the local world map and a compact,
alphabetically sorted nation grid. The desktop layout is designed to show around
40 nations at once (five columns from 1024px, six from 1280px).
Search and the nation details dialog remain available.
Smaller screens, increased text size, or longer lists can scroll normally so no
content is hidden.

The home page uses a viewport-height layout with a compact heading,
search and an automatically sized world map, without a footer or global counters.
On desktop, the heading sits alongside a smaller search input,
leaving most of the available height to the proportionally scaled, centered map.
These elements fit together without page scrolling on standard desktop and
portrait mobile screens. Viewports shorter than 620px retain scrolling rather
than clipping content; search results and nation details can scroll independently.

The map uses public-domain Natural Earth country boundaries grouped into five
interactive continents in `src/app/data/world-map-regions.data.ts`. Antarctica is
excluded and Russia's date-line polygons are joined on the right. All regions use
the same base color; hovering or keyboard focus highlights the entire continent
and shows its translated name in the information panel. Click or Enter opens that
continent. Interactive boundaries follow the visible country outlines, not
approximate hit boxes.

The home page makes five statistics API requests in parallel at startup:
`ConsultazioneService.getStatistiche()` for each continent (`AF`, `AM`, `AS`, `EU`,
`OC`). The map hover panel shows each continent's nation and commissioner totals.
Successful
statistics and in-flight requests are reused across home-page visits; hovering
does not trigger API calls. Each continent loads independently, with loading and
error feedback and a retry action that requests only failed statistics. No
directory requests are made at startup or on map hover.

Entering a continent calls `getNazioni` for that region and the active language;
the page count reflects that returned list. Opening a nation calls `getCommissari`
only for that nation. Successful results and in-flight requests are cached (nation
lists per continent/language). Language changes reload only the visible list.
Global search calls `getNazioneByDescrizione` with the entered description and active
language when at least two characters are typed, never on initial page load. It
does not fetch continent lists or filter nations locally. The API returns a single
nation without continent information, so selecting it opens its commissioners
directly. HTTP 404 shows no match, HTTP 409 asks for a more specific description,
and other failures expose a retry action.

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
