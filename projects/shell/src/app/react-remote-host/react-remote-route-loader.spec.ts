import { Component } from '@angular/core';

import { mapReactRemoteRoutes } from './react-remote-route-loader';

@Component({ template: '' })
class TestHostComponent {}

describe('mapReactRemoteRoutes', () => {
  it('maps framework-neutral remote definitions onto the shell host component', () => {
    const routes = mapReactRemoteRoutes(
      [
        { path: '', pathMatch: 'full' },
        { path: 'services' },
        { path: 'cards' },
        { path: '**' },
      ],
      TestHostComponent,
    );

    expect(routes.map(({ path }) => path)).toEqual(['', 'services', 'cards', '**']);
    expect(routes.every(({ component }) => component === TestHostComponent)).toBe(true);
  });
});
