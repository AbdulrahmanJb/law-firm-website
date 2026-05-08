import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', children: [] },
  { path: 'services', children: [] },
  { path: 'blogs/:id', children: [] },
  { path: 'blogs', children: [] },
  { path: 'videos', children: [] },
  { path: 'admin', children: [] },
  { path: '**', redirectTo: '' }
];
