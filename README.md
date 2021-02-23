# Monorepo Development with Nx Workspaces

## Prerequisites

- Node installed
- yarn or npm

## Table of Contents

- [Monorepo Development with Nx Workspaces](#monorepo-development-with-nx-workspaces)
  - [Prerequisites](#prerequisites)
  - [Table of Contents](#table-of-contents)
  - [Learning Outcomes](#learning-outcomes)
  - [Generate an empty workspace](#generate-an-empty-workspace)
  - [Generate an Angular App](#generate-an-angular-app)
  - [Builders](#builders)
  - [Generate a component library](#generate-a-component-library)
  - [Generate a utility lib](#generate-a-utility-lib)
  - [Generate a route lib](#generate-a-route-lib)
  - [Add a NestJS API](#add-a-nestjs-api)
  - [Displaying a full game in the routed game-detail component](#displaying-a-full-game-in-the-routed-game-detail-component)
  - [Generate a type lib that the API and frontend can share](#generate-a-type-lib-that-the-api-and-frontend-can-share)
  - [Module boundaries](#module-boundaries)

## Learning Outcomes

- Understand how to bootstrap a new Nx workspace
- Generate new apps within your workspace using the Nx CLI
- Understand what an `architect` and `builder` is
- Invoking builders
- Configure builders by passing them different options
- Understand how a builder can use another builder
- Get familiar with generating project specific component libraries inside a folder
- Get familiar with generating project specific, framework agnostic, utility libs
- Get familiar with more advanced usages of Nx generate schematics to create an Angular route lib
- Explore other plugins in the Nx ecosystem
- Learn how to connect frontend and backend apps in an Nx workspace
- Explore other real-world examples of creating shared libs for a specific project
- Learn to use the `move` schematic
- Understand how to assign scopes and type tags to your libraries
- How to specify boundaries around your tags and avoid circular dependencies in your repo
- How to use linting to trigger warnings or errors when you are not respecting these boundaries

---

## Generate an empty workspace

```bash
npx create-nx-workspace game-stock
```

- Answer `NO` for NXCloud
- Copy the `examples` folder from the repo into `game-stock`
  - This is important if you want the links to the example files to work correctly
- Replace the auto-generated `README.md` with this one
- Inspect the files in the workspace and commit the changes

---

## Generate an Angular App

In this section we'll generate our first Angular application within the new monorepo.

Make sure you are in the `game-stock` directory.

- Check that Nx is installed

  ```bash
  nx --version
  ```

- Install the CLI globall (alternatively, you can run `yarn nx` in place of `nx`)

  ```bash
  npm i -g @nrwl/cli
  ```

- See a list of installed plugins

  ```bash
  nx list
  ```

- Add Angular Schematics

  ```bash
  yarn add @nrwl/angular
  ```

- Add Angular Material

  ```bash
  yarn add @angular/material @angular/cdk
  ```

- Generate an Angular app named **store**

  ```bash
  nx generate @nrwl/angular:application store
  Answer Yes for routing.
  ```

- Create a `fake-api/index.ts` file in the `apps/store/src` folder
- Copy the code from [here](examples/GenerateAnAngularApp/fake-api/index.ts) and paste it into the file
- Replace `apps/store/src/app/app.component.html` with [this](examples/GenerateAnAngularApp/app.component.html) code
- Replace `apps/store/src/app/app.component.css` with [this](examples/GenerateAnAngularApp/app.component.css) code
- Replace `apps/store/src/app/app.component.ts` with [this](examples/GenerateAnAngularApp/app.component.ts) code
- Add the Material Card Module to `apps/store/src/app/app.module.ts`
  
  ```ts
  import { MatCardModule } from '@angular/material/card`
  ```

- Serve the app
  
  ```bash
  nx serve store
  ```

- See your app live at [http://localhost:4200/](http://localhost:4200/)
- Inspect what changed from the last time you committed, then commit your changes

---

## Builders

We'll build the app we just created, and look at what builders are and how to customize them.

- Build the **store** app
  
  ```bash
  nx build store
  ```

- You now have a `dist` folder
- Open `workspace.json` and look at the object under `projects/store/targets/build`
  - This is the **architect**, and it has a **executor** option, that points to `@angular-devkit/build-angular:browser`

- Now build with the **production** flag

  ```bash
  nx build store --configuration=production
  ```

- Notice the `dist` folder no longer contains _sourcemaps_
- Modify `workspace.json` to instruct the builder to import Angular Material styles from `./node_modules/@angular/material/prebuilt-themes/deeppurple-amber.css`
  - So we see that we can modify builders through the command line and in `workspace.json`
- The **serve** architect (located a bit lower in `workspace.json`) also contains a builder, that _uses_ the output from the **build** architect we just changed
  - So we can just re-start `nx serve store` see the new styles you added!
- Inspect what changed from the last time you committed, then commit your changes

---

## Generate a component library

Let's add a header to our app. Because headers can be shared with other components, we will create a common lib that others can import as well.

- Stop `nx serve`
- Generate a new Angular lib called `ui-shared` in the `libs/store` folder

  ```bash
  nx generate @nrwl/angular:lib ui-shared --directory=store
  ```

- Generate a new Angular component, called `header`, inside the lib you just created, and pass the flag to make sure it is exported from the libs module

  ```bash
  nx generate @nrwl/angular:component header --export --project=store-ui-shared
  ```

- Import `MatToolbarModule` in the new shared module you just created

  ```ts
  import { MatToolbarModule } from '@angular/material/toolbar';

  @NgModule({
    imports: [CommonModule, MatToolbarModule],
    //...
  ```

- Replace the `header` component's .html with [this](examples/GenereateAComponentLibrary/header.component.html) code
- Replace the `header` component .ts with [this](examples/GenereateAComponentLibrary/header.component.ts) code
- Import the `StoreUiSharedModule` into `apps/store/src/app/app.module.ts`

  ```typescript
  import { StoreUiSharedModule } from '@game-stock/store/ui-shared';

  @NgModule({
    imports: [
      //...,
      StoreUiSharedModule,
    ],
    //...
  ```

- Add the new component to `apps/store/src/app/app.component.html`

  ```html
   <game-stock-header title="Game Stock"></game-stock-header>
   <!-- right at the top - above our container -->
   <div class="container"></div>
   ```

- Serve the project and inspect the changes
- Run the command to inspect the dependency graph

  ```bash
  nx dep-graph
  ```

- Inspect what changed from the last time you committed, then commit your changes

---

## Generate a utility lib

Let's fix the ratings. They don't look that good and they could benefit from some formatting.

We will create a shared utility lib where we'll add our formatters and see how to import them in our components afterwards.

- Stop `nx serve`
- Use the `@nrwl/workspace` package to generate another lib in the `libs/store` folder - let's call it `util-formatters`. Use the `--linter=tslint` option.

  ```bash
  nx generate @nrwl/workspace:lib util-formatters --directory=store --linter=tslint
  ```

- Add the [code for the utility function](examples/GenerateAUtilityLib/store-util-formatters.ts) to the new library you just created `libs/store/util-formatters/src/lib/store-util-formatters.ts`
- Use it in your frontend project to format the rating for each game

  `app.component.ts`:

  ```ts
  import { formatRating } from '@game-stock/store/util-formatters';

  export class AppComponent {
    //...
    formatRating = formatRating;
  }
  ```

  `app.component.html`:

  ```html
  {{ formatRating(game.rating) }}
  ```

- Serve the store app - notice how the ratings are formatted.
- Launch the dependency graph - notice how the app depends on two libs now.
- Inspect what changed from the last time you committed, then commit your changes

---

## Generate a route lib

- Stop `nx serve`
- Use the `@nrwl/angular:lib` schematic to generate a new routing library called `feature-game-detail` that:
  - lives under `libs/store`
  - has lazy loading
  - has routing enabled
  - its parent routing module is `apps/store/src/app/app.module.ts`

  ```bash
  nx generate @nrwl/angular:lib feature-game-detail --directory=store --lazy --routing --parentModule=apps/store/src/app/app.module.ts
  ```

- Generate a new Angular component called `game-detail` under the above lib you created

  ```bash
  nx generate @schematics/angular:component --name=game-detail --project=store-feature-game-detail --module=store-feature-game-detail.module.ts
  ```

- Change the routing path in `apps/store/src/app/app.module.ts` to pick up the game ID from the URL

  ```ts
  {
    path: 'game/:id', // <-- here
    loadChildren: () =>
      import('@game-stock/store/feature-game-detail').then(/* ... */)
  }
  ```

- Uncomment _line 11_ in `libs/store/feature-game-detail/src/lib/store-feature-game-detail.module.ts` and make sure it's pointing to the `game-detail` component you generated above
- Import `MatCardModule` in `store-feature-game-detail.module.ts` and add it to the module's `imports: [...]`:

  ```ts
  import { MatCardModule } from '@angular/material/card';
  ```

- Populate your new component with the provided files:
  - [game-detail.component.ts](examples/GenerateARouteLib/game-detail.component.ts)
  - [game-detail.component.css](examples/GenerateARouteLib/game-detail.component.css)
  - [game-detail.component.html](examples/GenerateARouteLib/game-detail.component.html)

- We now need to display your new routed component. Let's add a `<router-outlet>` below our list of cards:

  `apps/store/src/app/app.component.html`:

  ```html
  <div class="container">
    <div class="games-layout">
        <mat-card class="game-card" *ngFor="let game of games">
        <!-- -->
        </mat-card>
    </div>
    <router-outlet></router-outlet> <!-- Add it here -->
  </div>
  ```

- Make clicking on each card route to the `feature-game-detail` module with the game's ID:

  `apps/store/src/app/app.component.html`:

  ```html
  <div class="container">
      <div class="games-layout">
          <mat-card
            class="game-card"
            *ngFor="let game of games"
            [routerLink]="['/game', game.id]"> <!-- Add it here -->
            <!-- -->
          </mat-card>
      </div>
      <router-outlet></router-outlet>
  </div>
  ```

- Serve your app again, click on some games, and compare with the screenshot above
- Launch the dependency graph and see what's been added
- Inspect what changed from the last time you committed, then commit your changes

---

The result is still pretty simple though. Our route just displays the ID of the selected game in a card. It would be great if we had some API to get the full game from that ID!

---

## Add a NestJS API

Up until now we've had a single app in our repository, and a few other libs that it uses.

But remember how we created that `fake-api` way back in the second lab, that only our `store` app can access?

Our new routed component suddenly needs access to the games as well, so in this lab we'll be adding a completely new app, this time on the backend, as an API. And we'll use the `@nrwl/nest` package to easily generate everything we need.

You do not need to be familiar with Nest (and you can use the `@nrwl/express:app` plugin instead if you wish). All the NestJS specific code for serving the games is provided in the solution.

- Stop any running `nx serve` instance
- `yarn add @nrwl/nest`
- Generate a new NestJS app, called `api` with `--linter=tslint` option

  ⚠️ Make sure you instruct the schematic to configure a proxy from the frontend `store` to the new `api` service (use `--help` to see the available options)

  ```bash
  nx generate @nrwl/nest:application api --frontendProject=store --linter=tslint
  ```

- Copy the code from the `fake api` to the new Nest [apps/api/src/app/app.service.ts](examples/AddANestJsApi/app.service.ts) and expose the `getGames()` and `getGame()` methods

- Update the Nest [app.controller.ts](examples/AddANestJsApi/app.controller.ts) to use the new methods from the service

- Let's now inspect the dependency graph!
- Inspect what changed from the last time you committed, then commit your changes

---

## Displaying a full game in the routed game-detail component

Now that we have a proper API, we can remove the `fake-api` created earlier and make proper HTTP requests. We'll also look at how the Nrwl NestJS schematics created a helpful proxy configuration for us.

- We can now delete the `fake-api` from the `store` app
- Import the `HttpClientModule` in `apps/store/src/app.module.ts` and add it to the module's imports array:

  ```ts
    import { HttpClientModule } from '@angular/common/http';
  ```

- Within the same folder, inject the `HttpClient` in the [app.component.ts](examples/DisplayFullGameRouted/app.component.ts)'s constructor and call your new API as an _HTTP request_

   ⚠️ _Notice how we assume it will be available at `/api` (more on that below)_

- Because our list of `games` is now an Observable, we need to add an `async` pipe in the template that gets the games:

  ```html
   <mat-card
     class="game-card"
     *ngFor="let game of games | async"
     [routerLink]="['/game', game.id]"
     >...</mat-card
   >
  ```

- Run `nx serve api`

  ⚠️ Notice the _PORT_ number

- Everything should still look/function the same

---

Even though the frontend and server are being exposed at different ports, we can call `/api` from the frontend store because `Nx` created a proxy configuration for us (see `apps/store/proxy.conf.json`) so any calls to `/api` are being routed to the correct address/port where the API is running.

---

- Inside the `libs/store/feature-game-detail/src/lib` folder, replace the following files:
  - [/game-detail/game-detail.component.ts](examples/DisplayFullGameRouted/game-detail/game-detail.component.ts)
  - [/game-detail/game-detail.component.css](examples/DisplayFullGameRouted/game-detail/game-detail.component.css)
  - [/game-detail/game-detail.component.html](examples/DisplayFullGameRouted/game-detail/game-detail.component.html)
  - [/store-feature-game-detail.module.ts](examples/DisplayFullGameRouted/store-feature-game-detail.module.ts)

   ⚠️ Notice how we're using the shared `formatRating()` function in our routed component as well!

- Your component should look similar to the provided screenshot! (you might need to restart your `nx serve store` so the new button styles can be copied over)
- Inspect what changed from the last time you committed, then commit your changes

---

## Generate a type lib that the API and frontend can share

- Stop serving both the API and the frontend
- Generate a new `@nrwl/workspace` lib called `util-interface` inside the `libs/api` folder. Use `--linter=tslint` option

  ```bash
  nx generate @nrwl/workspace:lib util-interface --directory=api --linter=tslint
  ```

  ⚠️ It's **important** that we create it in the `/api` folder for now

- Create your `Game` interface: see `libs/api/util-interface/src/lib/`[util-interface.ts](examples/GenerateSharedTypeLib/util-interface.ts)
- Import it in the API service: `apps/api/src/app/app.service.ts`

  ⚠️ You might need to restart the Typescript compiler in your editor

  ```typescript
    import { Game } from '@game-stock/api/util-interface';
    const games: Game[] = [...];
  ```

- Build the API and make sure there are no errors
- Inspect the dependency graph

---

Our frontend store makes calls to the API via the `HttpClient` service:

```typescript
this.http.get<any>(`/api/games/${id}`);
```

But it's currently typed to `any` - so our component has no idea about the shape of the objects it'll get back

Let's fix that - we already have a `Game` interface in a lib. But it's nested in the `api` folder - we need to move it out to the root `libs/` folder so any project can use it

---

- Use the `@nrwl/workspace:move` schematic to move the interface lib created above into the root `/libs` folder

  ```shell
  nx generate @nrwl/workspace:move --projectName=api-util-interface util-interface
  ```

- We can now import it in the frontend components and use it when making the `http` request:

    Frontend store shell app: `apps/store/src/app/app.component.ts`

    ```typescript
    import { Game } from '@game-stock/util-interface';

    this.http.get<Game[]>('/api/games');
    ```

    Routed game detail component: `libs/store/feature-game-detail/src/lib/game-detail/game-detail.component.ts`

    ```typescript
    this.http.get<Game>(`/api/games/${id}`);
    ```

    ⚠️ Notice how we didn't have to update the imports in the API. The `move` schematic took care of that for us!

- Trigger a build of both the store and the API projects and make sure it passes
- Inspect the dependency graph
- Inspect what changed from the last time you committed, then commit your changes

---

## Module boundaries

1. Open `nx.json` and finish tagging the apps accordingly:

    ```json
      "projects": {
        "store": {
          "tags": ["scope:store", "type:app"]
        },
        "store-e2e": {
          "tags": ["scope:store", "type:e2e"],
          "implicitDependencies": ["store"]
        },
        "store-ui-shared": {
          "tags": ["scope:store", "type:ui"]
        },
        "store-util-formatters": {
          "tags": ["scope:store", "type:util"]
        },
        "store-feature-game-detail": {
          "tags": ["scope:store", "type:feature"]
        },
        "api": {
          "tags": ["scope:api", "type:app"]
        },
        "util-interface": {
          "tags": ["scope:shared", "type:util"]
        },
        "store-ui-shared-e2e": {
          "tags": ["scope:store", "type:e2e"],
          "implicitDependencies": ["store-ui-shared"]
        }
      }"
    ```

2. Open the root `tslint.json`, find the `"nx-enforce-module-boundaries"` rule and set the `depConstraints`:

    ```json
    "depConstraints": [
        {
          "sourceTag": "scope:store",
          "onlyDependOnLibsWithTags": ["scope:store", "scope:shared"]
        },
        {
          "sourceTag": "scope:api",
          "onlyDependOnLibsWithTags": ["scope:api", "scope:shared"]
        },
        {
          "sourceTag": "type:feature",
          "onlyDependOnLibsWithTags": [
            "type:feature",
            "type:ui",
            "type:util"
          ]
        },
        {
          "sourceTag": "type:ui",
          "onlyDependOnLibsWithTags": ["type:ui", "type:util"]
        },
        {
          "sourceTag": "type:util",
          "onlyDependOnLibsWithTags": ["type:util"]
        }
    ]
    ```

3. Run `nx run-many --target=lint --all --parallel`
    - `nx run-many` allows you run a specific target against a specific set of projects
    via the `--projects=[..]` option. However, you can also pass it the `--all` option
    to run that target against all projects in your workspace.
    - `--parallel` launches all the `lint` processes in parallel

4. We talked about how importing a **Feature** lib should not be allowed from a **UI** lib. Let's test our lint rules by doing just that:
    - In `libs/store/ui-shared/src/lib/store-ui-shared.module.ts`
    - Try to `import { StoreFeatureGameDetailModule } from '@game-stock/store/feature-game-detail';`

5. Run linting against all the projects again.
6. You should see the expected error. Great! You can now delete the import above.
7. We also talked about the importance of setting boundaries between your workspace scopes.
Let's try and import a `store` lib from an `api` scope.
    - In `apps/api/src/app/app.service.ts`
    - Try to `import { formatRating } from '@game-stock/store/util-formatters';`
8. Run linting on all projects - you should see another expected error.
9. You can now delete the import above.
10. Run linting again and check if all the errors went away.
    - Pass the suggested `--only-failed` option, so it doesn't relint everything.

---
