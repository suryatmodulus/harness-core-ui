import React from 'react'
import { UseGetProps, UseGetReturn, RestfulProvider } from 'restful-react'
import { compile } from 'path-to-regexp'
import { createMemoryHistory } from 'history'
import { Router, Route, Switch, useLocation, useHistory } from 'react-router-dom'
import { ModalProvider } from '@wings-software/uicore'
import qs from 'qs'

import { enableMapSet } from 'immer'
import { AppStoreContext, AppStoreContextProps } from 'framework/AppStore/AppStoreContext'
import { withAccountId, accountPathProps } from '@common/utils/routeUtils'
import type { Project } from 'services/cd-ng'
import { StringsContext } from 'framework/strings/StringsContext'

import './testUtils.scss'

export type UseGetMockData<TData, TError = undefined, TQueryParams = undefined, TPathParams = undefined> = Required<
  UseGetProps<TData, TError, TQueryParams, TPathParams>
>['mock']

export interface UseMutateMockData<TData, TRequestBody = unknown> {
  loading?: boolean
  mutate?: (data?: TRequestBody) => Promise<TData>
}

export type UseGetReturnData<TData, TError = undefined, TQueryParams = undefined, TPathParams = undefined> = Omit<
  UseGetReturn<TData, TError, TQueryParams, TPathParams>,
  'absolutePath' | 'cancel' | 'response'
>

export const findDialogContainer = (): HTMLElement | null => document.querySelector('.bp3-dialog')
export const findPopoverContainer = (): HTMLElement | null => document.querySelector('.bp3-popover-content')

export interface TestWrapperProps {
  path?: string
  pathParams?: Record<string, string | number>
  queryParams?: Record<string, unknown>
  defaultAppStoreValues?: Partial<AppStoreContextProps>
  projects?: Project[]
  enableBrowserView?: boolean
}

export const prependAccountPath = (path: string): string => withAccountId(() => path)(accountPathProps)

export const NotFound = (): JSX.Element => {
  const location = useLocation()
  return (
    <div>
      <h1>Not Found</h1>
      <div data-testid="location">{`${location.pathname}${
        location.search ? `?${location.search.replace(/^\?/g, '')}` : ''
      }`}</div>
    </div>
  )
}

export interface BrowserViewProps {
  enable?: boolean
  children: React.ReactNode
}

export function BrowserView(props: BrowserViewProps): React.ReactElement {
  const { enable, children } = props
  const location = useLocation()
  const history = useHistory()

  if (!enable) {
    return <>{children}</>
  }

  function handlePathChange(e: React.ChangeEvent<HTMLInputElement>): void {
    history.replace(e.currentTarget.value)
  }

  const search = location.search ? `?${location.search.replace(/^\?/, '')}` : ''

  return (
    <div className="browser">
      <div className="browser-header">
        <input className="browser-path" value={location.pathname + search} onChange={handlePathChange} />
      </div>
      <div className="browser-content">{children}</div>
    </div>
  )
}

export const TestWrapper: React.FC<TestWrapperProps> = props => {
  enableMapSet()
  const { path = '/', pathParams = {}, defaultAppStoreValues, queryParams = {} } = props

  const search = qs.stringify(queryParams, { addQueryPrefix: true })
  const routePath = compile(path)(pathParams) + search

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const history = React.useMemo(() => createMemoryHistory({ initialEntries: [routePath] }), [])

  /** TODO: Try fixing this later. This is causing some tests to fail */
  // React.useEffect(() => {
  //   history.replace(compile(path)(pathParams) + qs.stringify(queryParams, { addQueryPrefix: true }))
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [path, pathParams, queryParams])

  return (
    <StringsContext.Provider value={{ data: {} as any, getString: key => key }}>
      <AppStoreContext.Provider
        value={{
          featureFlags: {},
          updateAppStore: () => void 0,
          currentUserInfo: {},
          ...defaultAppStoreValues
        }}
      >
        <Router history={history}>
          <ModalProvider>
            <RestfulProvider base="/">
              <BrowserView enable={props.enableBrowserView}>
                <Switch>
                  <Route exact path={path}>
                    {props.children}
                  </Route>
                  <Route>
                    <NotFound />
                  </Route>
                </Switch>
              </BrowserView>
            </RestfulProvider>
          </ModalProvider>
        </Router>
      </AppStoreContext.Provider>
    </StringsContext.Provider>
  )
}
