import React from 'react'
import { Layout } from '@wings-software/uicore'

import { PageHeader } from '@common/components/Page/PageHeader'
import { PageBody } from '@common/components/Page/PageBody'
import LandingDashboardFactory from '@dashboards/factories/LandingDashboardFactory'
import { ModuleName } from 'framework/types/ModuleName'
import LandingDashboardWidgetWrapper from '@dashboards/components/LandingDashboardWidgetWrapper/LandingDashboardWidgetWrapper'

const modules: Array<ModuleName> = [ModuleName.COMMON]

const LandingDashboardPage: React.FC = () => {
  return (
    <>
      <PageHeader title="Good Morning, name" />
      <PageBody>
        <Layout.Vertical spacing="large" padding="xlarge">
          {modules.map(moduleName => {
            const moduleHandler = LandingDashboardFactory.getModuleDashboardHandler(moduleName)
            return moduleHandler ? (
              <LandingDashboardWidgetWrapper icon={moduleHandler?.icon} title={moduleHandler?.label} key={moduleName}>
                {moduleHandler.moduleDashboardRenderer?.()}
              </LandingDashboardWidgetWrapper>
            ) : null
          })}
        </Layout.Vertical>
      </PageBody>
    </>
  )
}

export default LandingDashboardPage
