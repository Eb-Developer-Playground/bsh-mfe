export type BreadcrumbItem = Readonly<{
  label: string
  path: string
}>

export type BreadcrumbState = Readonly<{
  title: string
  items: readonly BreadcrumbItem[]
}>

export type BreadcrumbChangeHandler = (state: BreadcrumbState) => void
