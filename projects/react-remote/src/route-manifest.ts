import type { BreadcrumbState } from './breadcrumb.types'

export type ReactRemoteRouteId = 'home' | 'services' | 'cards' | 'notFound'

export type ReactRemoteRouteDefinition = Readonly<{
  id: ReactRemoteRouteId
  path: string
  breadcrumb: BreadcrumbState
}>

const REACT_REMOTE_ROOT = '/react-remote'

export const REACT_REMOTE_ROUTE_DEFINITIONS = [
  {
    id: 'home',
    path: '',
    breadcrumb: {
      title: 'React Remote',
      items: [{ label: 'React Remote', path: REACT_REMOTE_ROOT }],
    },
  },
  {
    id: 'services',
    path: 'services',
    breadcrumb: {
      title: 'Services',
      items: [
        { label: 'React Remote', path: REACT_REMOTE_ROOT },
        { label: 'Services', path: `${REACT_REMOTE_ROOT}/services` },
      ],
    },
  },
  {
    id: 'cards',
    path: 'cards',
    breadcrumb: {
      title: 'EQUITY.BSH',
      items: [
        { label: 'React Remote', path: REACT_REMOTE_ROOT },
        { label: 'Cards', path: `${REACT_REMOTE_ROOT}/cards` },
      ],
    },
  },
  {
    id: 'notFound',
    path: '**',
    breadcrumb: {
      title: 'Page not found',
      items: [
        { label: 'React Remote', path: REACT_REMOTE_ROOT },
        { label: 'Page not found', path: REACT_REMOTE_ROOT },
      ],
    },
  },
] as const satisfies readonly ReactRemoteRouteDefinition[]
