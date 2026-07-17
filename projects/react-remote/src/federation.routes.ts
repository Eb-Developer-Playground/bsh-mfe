import { REACT_REMOTE_ROUTE_DEFINITIONS } from './route-manifest'

export type FederatedReactRoute = Readonly<{
  path: string
  pathMatch?: 'full'
}>

export const routes: readonly FederatedReactRoute[] = REACT_REMOTE_ROUTE_DEFINITIONS.map(
  ({ path }) => (path === '' ? { path, pathMatch: 'full' as const } : { path }),
)
