import React from 'react'
import { Icon } from '@wings-software/uicore'
import { Switch } from '@blueprintjs/core'
import { NavLink, useParams, useLocation, matchPath } from 'react-router-dom'

import routes from '@common/RouteDefinitions'
import { useQueryParams, useUpdateQueryParams } from '@common/hooks'
import { accountPathProps, executionPathProps, pipelineModuleParams } from '@common/utils/routeUtils'
import type { ExecutionPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import type { CIWebhookInfoDTO } from 'services/ci'
import type { ExecutionQueryParams } from '@pipeline/utils/executionUtils'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import { String, useStrings } from 'framework/strings'

import css from './ExecutionTabs.module.scss'

export default function ExecutionTabs(props: React.PropsWithChildren<unknown>): React.ReactElement {
  const { children } = props
  const { getString } = useStrings()
  const { pipelineExecutionDetail } = useExecutionContext()
  const params = useParams<PipelineType<ExecutionPathProps>>()
  const location = useLocation()
  const { view } = useQueryParams<ExecutionQueryParams>()
  const { updateQueryParams } = useUpdateQueryParams<ExecutionQueryParams>()

  const isPipeLineView = !!matchPath(location.pathname, {
    path: routes.toExecutionPipelineView({ ...accountPathProps, ...executionPathProps, ...pipelineModuleParams })
  })
  // const isGraphView = !view || view === 'graph'
  const isLogView = view === 'log'
  const indicatorRef = React.useRef<HTMLDivElement | null>(null)
  const isCI = params.module === 'ci'
  const isCIInPipeline = pipelineExecutionDetail?.pipelineExecutionSummary?.moduleInfo?.ci

  const ciData = pipelineExecutionDetail?.pipelineExecutionSummary?.moduleInfo?.ci
    ?.ciExecutionInfoDTO as CIWebhookInfoDTO
  // NOTE: hide commits tab if there are no commits
  // by default we are showing Commits tab > 'isEmpty(pipelineExecutionDetail)'
  const ciShowCommitsTab = !!ciData?.branch?.commits?.length || !!ciData?.pullRequest?.commits?.length

  function handleLogViewChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const { checked } = e.target as HTMLInputElement

    updateQueryParams({ view: checked ? 'log' : 'graph' })
  }

  /* The following function does not have any business logic and hence can be ignored */
  /* istanbul ignore next */
  React.useEffect(() => {
    const id = window.setTimeout(() => {
      if (!indicatorRef.current) return

      const parent = indicatorRef.current.parentElement
      const activeLink = parent?.querySelector(`.${css.activeLink}`)

      if (!parent || !activeLink) return
      const parentRect = parent.getBoundingClientRect()
      const rect = activeLink.getBoundingClientRect()

      indicatorRef.current.style.transform = `translateX(${rect.x - parentRect.x}px) scaleX(${rect.width / 10})`
    }, 100)

    return () => {
      clearTimeout(id)
    }
  }, [location.pathname])

  return (
    <div className={css.main}>
      <div className={css.tabs}>
        <NavLink
          to={routes.toExecutionPipelineView(params) + location.search}
          className={css.tabLink}
          activeClassName={css.activeLink}
        >
          <Icon name="alignment-vertical-center" size={16} />
          <span>{getString('pipelines')}</span>
        </NavLink>
        <NavLink
          to={routes.toExecutionInputsView(params) + location.search}
          className={css.tabLink}
          activeClassName={css.activeLink}
        >
          <Icon name="manually-entered-data" size={16} />
          <span>{getString('inputs')}</span>
        </NavLink>
        {isCI && (
          <>
            <NavLink
              to={routes.toExecutionArtifactsView(params) + location.search}
              className={css.tabLink}
              activeClassName={css.activeLink}
            >
              <Icon name="add-to-artifact" size={16} />
              <span>{getString('artifacts')}</span>
            </NavLink>
            {ciShowCommitsTab ? (
              <NavLink
                to={routes.toExecutionCommitsView(params) + location.search}
                className={css.tabLink}
                activeClassName={css.activeLink}
              >
                <Icon name="git-commit" size={16} />
                <span>{getString('commits')}</span>
              </NavLink>
            ) : null}
          </>
        )}
        {(isCI || isCIInPipeline) && (
          <NavLink
            to={routes.toExecutionTestsView(params) + location.search}
            className={css.tabLink}
            activeClassName={css.activeLink}
          >
            <Icon name="lab-test" size={16} />
            <span>{getString('tests')}</span>
          </NavLink>
        )}
        <div ref={indicatorRef} className={css.tabIndicator} />
      </div>
      <div className={css.children}>{children}</div>
      {isPipeLineView ? (
        <div className={css.viewToggle}>
          <String stringID="consoleView" />
          <Switch checked={isLogView} name="console-view-toggle" onChange={handleLogViewChange} />
        </div>
      ) : null}
    </div>
  )
}
