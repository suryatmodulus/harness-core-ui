import React, { useEffect } from 'react'
import { Container } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import CVOnboardingTabs from '@cv/components/CVOnboardingTabs/CVOnboardingTabs'
import useCVTabsHook from '@cv/hooks/CVTabsHook/useCVTabsHook'
import { useStrings } from 'framework/exports'
import { ResponseActivitySourceDTO, useGetActivitySource } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import HarnessCDActivitySourceDetails from './HarnessCDActivitySourceDetails/HarnessCDActivitySourceDetails'
import SelectApplication from './SelectApplication/SelectApplication'
import SelectEnvironment from './SelectEnvironment/SelectEnvironment'
import SelectServices from './SelectServices/SelectServices'

function transformPayload(response: ResponseActivitySourceDTO) {
  const resource = response.data as any
  const apps: { [key: string]: string } = {}
  resource.envMappings?.forEach((env: any) => (apps[env.appId] = env.appName))
  resource.serviceMappings?.forEach((service: any) => (apps[service.appId] = service.appName))
  const environments: any = {}
  const services: any = {}
  resource.envMappings?.forEach((env: any) => {
    environments[env.envId] = {
      selected: true,
      appId: env.appId,
      appName: env.appName,
      id: env.envId,
      environment: { label: env.envIdentifier, value: env.envIdentifier }
    }
  })
  resource.serviceMappings?.forEach((service: any) => {
    services[service.serviceId] = {
      selected: true,
      appId: service.appId,
      appName: service.appName,
      id: service.serviceId,
      service: { label: service.serviceIdentifier, value: service.serviceIdentifier }
    }
  })

  return {
    identifier: resource.identifier,
    name: resource.name,
    uuid: resource.uuid,
    applications: apps,
    environments,
    services
  }
}

const HarnessCDActivitySource: React.FC = () => {
  const { getString } = useStrings()
  const { onNext, currentData, setCurrentData, onPrevious, ...tabInfo } = useCVTabsHook<any>({ totalTabs: 4 })
  const params = useParams<ProjectPathProps & { activitySourceId: string }>()

  const { refetch: loadActivitySource } = useGetActivitySource({
    queryParams: {
      accountId: params.accountId,
      orgIdentifier: params.orgIdentifier,
      projectIdentifier: params.projectIdentifier,
      identifier: params.activitySourceId
    },
    lazy: true,
    resolve: response => {
      setCurrentData(transformPayload(response))
      return response
    }
  })

  useEffect(() => {
    if (params.activitySourceId) {
      loadActivitySource()
    }
  }, [params])

  return (
    <Container>
      <CVOnboardingTabs
        iconName="cd-main"
        defaultEntityName={currentData?.name || getString('cv.activitySources.harnessCD.defaultName')}
        {...tabInfo}
        onPrevious={onPrevious}
        onNext={onNext}
        setName={val => setCurrentData({ ...currentData, name: val })}
        tabProps={[
          {
            id: 1,
            title: getString('cv.activitySources.harnessCD.selectActivitySource'),
            component: (
              <HarnessCDActivitySourceDetails
                initialValues={currentData}
                onSubmit={data => {
                  setCurrentData({ ...currentData, ...data })
                  onNext({ data: { ...currentData, ...data } })
                }}
              />
            )
          },
          {
            id: 2,
            title: getString('cv.activitySources.harnessCD.selectApplication'),
            component: (
              <SelectApplication
                stepData={currentData}
                onSubmit={data => {
                  setCurrentData({ ...currentData, ...data })
                  onNext({ data: { ...currentData, ...data } })
                }}
                onPrevious={onPrevious}
              />
            )
          },
          {
            id: 3,
            title: getString('cv.activitySources.harnessCD.selectEnvironment'),
            component: (
              <SelectEnvironment
                initialValues={currentData}
                onSubmit={data => {
                  setCurrentData({ ...currentData, ...data })
                  onNext({ data: { ...currentData, ...data } })
                }}
                onPrevious={onPrevious}
              />
            )
          },
          {
            id: 4,
            title: getString('cv.activitySources.harnessCD.selectService'),
            component: (
              <SelectServices
                initialValues={currentData}
                onSubmit={data => {
                  setCurrentData({ ...currentData, ...data })
                  onNext({ data: { ...currentData, ...data } })
                }}
                onPrevious={onPrevious}
              />
            )
          }
        ]}
      />
    </Container>
  )
}
export default HarnessCDActivitySource
