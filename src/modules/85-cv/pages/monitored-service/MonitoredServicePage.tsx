import React from 'react'
import { useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { BGColorWrapper, HorizontalLayout } from '@cv/pages/health-source/common/StyledComponents'
import MonitoredService from './component/MonitoredService'
import { MonitoringServicesHeader } from './monitoredService.styled'

function MonitoredServicePage(): JSX.Element {
  const { getString } = useStrings()
  const params = useParams<ProjectPathProps & { identifier: string }>()
  const isEdit = !!params.identifier
  return (
    <BGColorWrapper>
      <MonitoringServicesHeader height={'80px'}>
        <HorizontalLayout alignItem={'flex-end'}>
          <div>
            <NGBreadcrumbs
              links={[
                {
                  url: routes.toCVMonitoringServices({
                    orgIdentifier: params.orgIdentifier,
                    projectIdentifier: params.projectIdentifier,
                    accountId: params.accountId
                  }),
                  label: getString('cv.monitoredServices.title')
                }
              ]}
            />
            <p>
              {!isEdit
                ? getString('cv.monitoredServices.addNewMonitoredServices')
                : getString('cv.monitoredServices.editMonitoredServices')}
            </p>
          </div>
        </HorizontalLayout>
      </MonitoringServicesHeader>
      <MonitoredService />
    </BGColorWrapper>
  )
}

export default MonitoredServicePage
