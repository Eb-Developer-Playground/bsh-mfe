import { safeLoadReactRemoteRoutes } from './react-remote-host/react-remote-route-loader';
import { routes } from './app.routes';

describe('shell routes', () => {
  it('loads React-owned routes through the shell host adapter', () => {
    const shellRoute = routes.find((route) => route.path === '');
    const reactRemoteRoute = shellRoute?.children?.find(
      (route) => route.path === 'react-remote',
    );

    expect(reactRemoteRoute?.component).toBeUndefined();
    expect(reactRemoteRoute?.loadChildren).toBe(safeLoadReactRemoteRoutes);
    expect(reactRemoteRoute?.children).toBeUndefined();
  });
});
