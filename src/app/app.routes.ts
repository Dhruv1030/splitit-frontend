import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Default redirect
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },

  // Public routes (Authentication)
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register').then((m) => m.RegisterComponent),
  },

  // Error pages (public)
  {
    path: '403',
    loadComponent: () =>
      import('./shared/forbidden/forbidden').then((m) => m.ForbiddenComponent),
  },
  {
    path: '404',
    loadComponent: () =>
      import('./shared/not-found/not-found').then((m) => m.NotFoundComponent),
  },

  // Protected routes (with Layout)
  {
    path: '',
    loadComponent: () => import('./shared/layout/layout').then((m) => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then((m) => m.DashboardComponent),
      },
      {
        path: 'groups',
        loadComponent: () =>
          import('./features/groups/groups-list/groups-list').then(
            (m) => m.GroupsListComponent
          ),
      },
      {
        path: 'groups/:id',
        loadComponent: () =>
          import('./features/groups/group-detail/group-detail').then(
            (m) => m.GroupDetailComponent
          ),
      },
      {
        path: 'expenses',
        loadComponent: () =>
          import('./features/expenses/expenses-list/expenses-list').then(
            (m) => m.ExpensesListComponent
          ),
      },
      {
        path: 'expenses/:id',
        loadComponent: () =>
          import('./features/expenses/expense-detail/expense-detail').then(
            (m) => m.ExpenseDetailComponent
          ),
      },
      {
        path: 'settlements',
        loadComponent: () =>
          import('./features/settlements/settlements-list/settlements-list').then(
            (m) => m.SettlementsListComponent
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile').then((m) => m.ProfileComponent),
      },
      {
        path: 'profile/email-preferences',
        loadComponent: () =>
          import('./features/profile/email-preferences/email-preferences').then(
            (m) => m.EmailPreferencesComponent
          ),
      },
    ],
  },

  // Wildcard route (404 Not Found)
  {
    path: '**',
    loadComponent: () =>
      import('./shared/not-found/not-found').then((m) => m.NotFoundComponent),
  },
];

