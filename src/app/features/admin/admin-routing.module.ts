const routes: Routes = [
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [AdminGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },
      {
        path: 'dashboard',
        component: AdminDashboardComponent
      },
      {
        path: 'posts',
        component: BlogManagementComponent
      },
      {
        path: 'posts/new',
        component: BlogEditorComponent
      },
      {
        path: 'posts/edit/:id',
        component: BlogEditorComponent
      },
      {
        path: 'media',
        component: MediaLibraryComponent
      }
    ]
  }
];
