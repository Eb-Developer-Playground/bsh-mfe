import { BrowserRouter } from 'react-router'

import type { BreadcrumbChangeHandler } from './breadcrumb.types'
import { ReactRemoteRoutes } from './routes'

type AppProps = {
  basename: string
  onBreadcrumbChange?: BreadcrumbChangeHandler
}

function App({ basename, onBreadcrumbChange }: AppProps) {
  return (
    <BrowserRouter basename={basename}>
      <ReactRemoteRoutes onBreadcrumbChange={onBreadcrumbChange} />
    </BrowserRouter>
  )
}

export default App
