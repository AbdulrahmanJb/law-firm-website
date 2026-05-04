import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', children: [] },
  { path: 'blogs', children: [] },
  { path: 'videos', children: [] },
  { path: 'admin', children: [] },
  { path: '**', redirectTo: '' }
];
