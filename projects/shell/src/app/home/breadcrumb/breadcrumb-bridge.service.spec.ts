import { TestBed } from '@angular/core/testing';

import { BreadcrumbBridgeService } from './breadcrumb-bridge.service';

describe('BreadcrumbBridgeService', () => {
  it('stores immutable remote breadcrumb state and clears it', () => {
    const service = TestBed.inject(BreadcrumbBridgeService);
    const source = {
      title: 'Cards',
      items: [{ label: 'Cards', path: '/react-remote/cards' }],
    };

    service.set(source);
    const initialState = service.state();
    service.set(source);
    source.items[0].label = 'Changed outside the service';

    expect(service.state()).toBe(initialState);
    expect(service.state()).toEqual({
      title: 'Cards',
      items: [{ label: 'Cards', path: '/react-remote/cards' }],
    });

    service.clear();

    expect(service.state()).toBeNull();
  });
});
