import { type ReactNode, useEffect } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router'

import type { BreadcrumbChangeHandler, BreadcrumbState } from './breadcrumb.types'
import { CardsPage } from './CardsPage'
import { HomePage } from './HomePage'
import {
  REACT_REMOTE_ROUTE_DEFINITIONS,
  type ReactRemoteRouteId,
} from './route-manifest'
import { ServicesPage } from './ServicesPage'

function breadcrumbForPath(pathname: string): BreadcrumbState {
  const routeSegment = pathname.split('/').filter(Boolean).at(-1) ?? ''
  const route = REACT_REMOTE_ROUTE_DEFINITIONS.find(
    ({ path }) => path !== '**' && path === routeSegment,
  )
  const fallback = REACT_REMOTE_ROUTE_DEFINITIONS.find(({ id }) => id === 'notFound')

  if (!fallback) {
    throw new Error('React remote route manifest must define a notFound route')
  }

  return (route ?? fallback).breadcrumb
}

type ReactRemoteRoutesProps = {
  onBreadcrumbChange?: BreadcrumbChangeHandler
}

function BreadcrumbPublisher({ onBreadcrumbChange }: ReactRemoteRoutesProps) {
  const location = useLocation()

  useEffect(() => {
    onBreadcrumbChange?.(breadcrumbForPath(location.pathname))
  }, [location.pathname, onBreadcrumbChange])

  return null
}

function NotFoundPage() {
  return (
    <main className="route-not-found">
      <p className="route-not-found__eyebrow">React Remote</p>
      <h1>Page not found</h1>
      <p>The requested React service route does not exist.</p>
      <Link to="/">Return to the React home page</Link>
    </main>
  )
}

const ROUTE_ELEMENTS = {
  home: <HomePage />,
  services: <ServicesPage />,
  cards: <CardsPage />,
  notFound: <NotFoundPage />,
} satisfies Record<ReactRemoteRouteId, ReactNode>

export function ReactRemoteRoutes({ onBreadcrumbChange }: ReactRemoteRoutesProps) {
  return (
    <>
      <BreadcrumbPublisher onBreadcrumbChange={onBreadcrumbChange} />
      <Routes>
        {REACT_REMOTE_ROUTE_DEFINITIONS.map((route) =>
          route.path === '' ? (
            <Route key={route.id} index element={ROUTE_ELEMENTS[route.id]} />
          ) : (
            <Route
              key={route.id}
              path={route.path === '**' ? '*' : route.path}
              element={ROUTE_ELEMENTS[route.id]}
            />
          ),
        )}
      </Routes>
    </>
  )
}
