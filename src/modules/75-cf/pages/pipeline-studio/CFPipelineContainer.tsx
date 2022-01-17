/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams, Link, matchPath, useLocation } from 'react-router-dom'
import { Layout } from '@wings-software/uicore'
import cx from 'classnames'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import routes from '@common/RouteDefinitions'
import css from './CFPipelineStudio.module.scss'

export const CFPipelineContainer: React.FC = ({ children }) => {
  const module = 'cf'
  const { withActiveEnvironment } = useActiveEnvironment()
  const { getString } = useStrings()
  const params = useParams<PipelinePathProps>()
  const location = useLocation()
  const toDeployments = routes.toDeployments({ ...params, module })
  const toPipelines = routes.toPipelines({ ...params, module })
  const isDeployments = !!matchPath(location.pathname, { path: toDeployments })

  return (
    <>
      <Layout.Horizontal style={{ position: 'fixed', top: '23px', right: '25px' }} spacing="medium">
        <Link className={cx(css.link, isDeployments && css.active)} to={withActiveEnvironment(toDeployments)}>
          {getString('deploymentsText')}
        </Link>
        <Link className={cx(css.link, !isDeployments && css.active)} to={withActiveEnvironment(toPipelines)}>
          {getString('cf.pipeline.listing')}
        </Link>
      </Layout.Horizontal>
      {children}
    </>
  )
}
