import React, { useEffect } from 'react'
import { omit } from 'lodash-es'
import { useParams } from 'react-router-dom'
import CVOnboardingTabs from '@cv/components/CVOnboardingTabs/CVOnboardingTabs'
import { Page } from '@common/exports'
import { useGetActivitySource, ResponseActivitySourceDTO } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import useCVTabsHook from '@cv/hooks/CVTabsHook/useCVTabsHook'
import { useStrings } from 'framework/strings'
import { SelectActivitySource } from './SelectActivitySource/SelectActivitySource'
import { SelectKubernetesConnector } from './SelectKubernetesConnector/SelectKubernetesConnector'
import { SelectKubernetesNamespaces } from './SelectKubernetesNamespaces/SelectKubernetesNamespaces'
import { MapWorkloadsToServices } from './MapWorkloadsToServices/MapWorkloadsToServices'
import { ReviewKubernetesActivitySource } from './ReviewKubernetesActivitySource/ReviewKubernetesActivitySource'
import type {
  KubernetesActivitySourceDTO,
  KubernetesActivitySourceInfo,
  WorkloadInfo
} from './KubernetesActivitySourceUtils'

export function transformApiData(activitySource?: KubernetesActivitySourceDTO): KubernetesActivitySourceInfo {
  if (!activitySource || !activitySource?.activitySourceConfigs?.length) return {} as KubernetesActivitySourceInfo
  const data: KubernetesActivitySourceInfo = {
    ...omit(activitySource, ['lastUpdatedAt', 'activitySourceConfigs']),
    selectedNamespaces: [],
    uuid: activitySource.uuid,
    connectorRef: { value: activitySource.connectorIdentifier, label: activitySource.connectorIdentifier },
    selectedWorkloads: new Map<string, Map<string, WorkloadInfo>>(),
    connectorType: 'Kubernetes'
  }
  for (const activitySourceConfig of activitySource.activitySourceConfigs) {
    if (
      !activitySourceConfig ||
      !activitySourceConfig.namespace ||
      !activitySourceConfig.envIdentifier ||
      !activitySourceConfig.workloadName ||
      !activitySourceConfig.serviceIdentifier
    ) {
      continue
    }

    if (!data.selectedNamespaces.find(namespace => namespace === activitySourceConfig.namespace)) {
      data.selectedNamespaces.push(activitySourceConfig.namespace)
    }

    let namespaceWithWorkload = data.selectedWorkloads.get(activitySourceConfig.namespace)
    if (!namespaceWithWorkload) {
      namespaceWithWorkload = new Map<string, WorkloadInfo>()
      data.selectedWorkloads.set(activitySourceConfig.namespace, namespaceWithWorkload)
    }

    namespaceWithWorkload.set(activitySourceConfig.workloadName, {
      serviceIdentifier: {
        label: activitySourceConfig.serviceIdentifier,
        value: activitySourceConfig.serviceIdentifier
      },
      environmentIdentifier: { label: activitySourceConfig.envIdentifier, value: activitySourceConfig.envIdentifier },
      workload: activitySourceConfig.workloadName,
      selected: true
    })
  }

  return data
}

export function KubernetesActivitySource(): JSX.Element {
  const { onNext, currentData, setCurrentData, ...tabInfo } = useCVTabsHook<KubernetesActivitySourceInfo>({
    totalTabs: 5
  })
  const { getString } = useStrings()
  const params = useParams<ProjectPathProps & { activitySourceId: string }>()
  const {
    loading,
    error,
    refetch: fetchKubernetesSource
  } = useGetActivitySource({
    lazy: true,
    resolve: function (activitySource: ResponseActivitySourceDTO) {
      setCurrentData(transformApiData(activitySource?.data as KubernetesActivitySourceDTO))
      return activitySource
    },
    queryParams: {
      projectIdentifier: params.projectIdentifier,
      orgIdentifier: params.orgIdentifier,
      accountId: params.accountId,
      identifier: params.activitySourceId || ''
    }
  })

  useEffect(() => {
    if (params.activitySourceId && !currentData) {
      fetchKubernetesSource()
    }
  }, [params])

  return (
    <Page.Body loading={loading} key={loading?.toString()} error={error?.message}>
      <CVOnboardingTabs
        iconName="service-kubernetes"
        defaultEntityName={currentData?.name || getString('cv.activitySources.kubernetes.defaultName')}
        {...tabInfo}
        onNext={onNext}
        setName={val => setCurrentData({ ...currentData, name: val } as KubernetesActivitySourceInfo)}
        tabProps={[
          {
            id: 1,
            title: getString(`cv.activitySources.harnessCD.select`),
            component: (
              <SelectActivitySource
                data={currentData as KubernetesActivitySourceInfo}
                isEditMode={Boolean(params.activitySourceId)}
                onSubmit={(submittedInfo: KubernetesActivitySourceInfo) => {
                  if (submittedInfo) {
                    if (currentData?.connectorRef?.value !== submittedInfo?.connectorRef?.value) {
                      submittedInfo.selectedNamespaces = []
                      submittedInfo.selectedWorkloads = new Map()
                    }
                    setCurrentData({ ...currentData, ...submittedInfo })
                  }
                  onNext({ data: { ...currentData, ...submittedInfo } })
                }}
              />
            )
          },
          {
            id: 2,
            title: getString(`cv.activitySources.kubernetes.tabNames.tab1`),
            component: (
              <SelectKubernetesConnector
                data={currentData as KubernetesActivitySourceInfo}
                onSubmit={(submittedInfo: KubernetesActivitySourceInfo) => {
                  if (submittedInfo) setCurrentData({ ...currentData, ...submittedInfo })
                  onNext({ data: { ...currentData, ...submittedInfo } })
                }}
                onPrevious={tabInfo.onPrevious}
                isEditMode={Boolean(params.activitySourceId)}
              />
            )
          },
          {
            id: 3,
            title: getString(`cv.activitySources.kubernetes.tabNames.tab2`),
            component: (
              <SelectKubernetesNamespaces
                data={currentData as KubernetesActivitySourceInfo}
                onSubmit={(submittedInfo: KubernetesActivitySourceInfo) => {
                  if (submittedInfo) setCurrentData({ ...currentData, ...submittedInfo })
                  onNext({ data: { ...currentData, ...submittedInfo } })
                }}
                onPrevious={tabInfo.onPrevious}
              />
            )
          },
          {
            id: 4,
            title: getString(`cv.activitySources.kubernetes.tabNames.tab3`),
            component: (
              <MapWorkloadsToServices
                data={currentData as KubernetesActivitySourceInfo}
                onSubmit={(submittedInfo: KubernetesActivitySourceInfo) => {
                  if (submittedInfo) setCurrentData({ ...currentData, ...submittedInfo })
                  onNext({ data: { ...currentData, ...submittedInfo } })
                }}
                onPrevious={tabInfo.onPrevious}
              />
            )
          },
          {
            id: 5,
            title: getString('review'),
            component: (
              <ReviewKubernetesActivitySource
                data={currentData as KubernetesActivitySourceInfo}
                onSubmit={(submittedInfo: KubernetesActivitySourceInfo) => {
                  if (submittedInfo) setCurrentData({ ...currentData, ...submittedInfo })
                  onNext({ data: { ...currentData, ...submittedInfo } })
                }}
                onPrevious={tabInfo.onPrevious}
              />
            )
          }
        ]}
      />
    </Page.Body>
  )
}
