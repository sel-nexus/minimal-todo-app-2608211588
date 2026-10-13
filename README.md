# Todo App

A small, self-contained todo list built with HTML5, plain CSS, and vanilla JavaScript. It is designed as a deterministic browser-test fixture: tasks are held in memory, IDs start at `1` and increase in add order, and state resets when the page reloads.

## Run

Open `index.html` directly in a browser. No server, build step, installation, or network connection is required.

## Behavior

- Add a task with the **Add** button or Enter.
- Whitespace-only input is ignored; accepted titles are trimmed.
- Tasks appear oldest first and can be checked or deleted.
- The exact empty state is `No tasks yet.`
- Stable `data-testid` selectors are provided for the input, button, list, empty state, and each task control.

## Browser tests

The Playwright suite is a development-time verification tool and is not required to run the app. With `@playwright/test` installed in the workspace, run:

```sh
node node_modules/@playwright/test/cli.js test
```
