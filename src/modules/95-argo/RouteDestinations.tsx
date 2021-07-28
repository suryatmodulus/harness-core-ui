import React from 'react'

import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import { MinimalLayout } from '@common/layouts'
import { RouteWithLayout } from '@common/router'

import ArgoCDHomePage from '@argo/pages/home/ArgoCDHomePage'

export default (
  <>
    <RouteWithLayout layout={MinimalLayout} exact path={routes.toArgo({ ...accountPathProps })}>
      <ArgoCDHomePage />
    </RouteWithLayout>
  </>
)
