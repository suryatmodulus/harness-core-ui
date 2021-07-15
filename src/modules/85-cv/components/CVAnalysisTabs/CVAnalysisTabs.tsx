import React, { useEffect, useState } from 'react'
import { Container, Tabs, Tab } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { Classes } from '@blueprintjs/core'
import cx from 'classnames'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { DatasourceTypeDTO, RestResponseSetDatasourceTypeDTO, useGetDataSourcetypes } from 'services/cv'
import { useToaster } from '@common/exports'
import css from './CVAnalysisTabs.module.scss'

type AnalysisType = { hasLogs: boolean; hasMetrics: boolean }
type MonitoringSourceTypes = DatasourceTypeDTO['dataSourceType']
export interface CVAnalysisTabsProps {
  onMonitoringSourceSelect: (selectedSource?: MonitoringSourceTypes) => void
  metricAnalysisView: JSX.Element
  logAnalysisView: JSX.Element
  environmentIdentifier?: string
  serviceIdentifier?: string
  className?: string
}

interface CVAnalysisTypeTabsProps {
  hasLogs: boolean
  hasMetrics: boolean
  metricAnalysisView: CVAnalysisTabsProps['metricAnalysisView']
  logAnalysisView: CVAnalysisTabsProps['logAnalysisView']
}

const LoadingTabs = [1, 2, 3]

function dataSourceTypeToLabel(monitoringSourceType: MonitoringSourceTypes): string {
  switch (monitoringSourceType) {
    case 'APP_DYNAMICS':
      return 'AppDynamics'
    case 'SPLUNK':
      return 'Splunk'
    case 'STACKDRIVER':
      return 'Google Cloud Operations'
    case 'NEW_RELIC':
      return 'New Relic'
    case 'PROMETHEUS':
      return 'Prometheus'
    default:
      return ''
  }
}

function transformDataSourceTypes(
  response?: RestResponseSetDatasourceTypeDTO | null
): Map<MonitoringSourceTypes, AnalysisType> {
  const monitoringSourceToAnalysisType = new Map<MonitoringSourceTypes, AnalysisType>()
  if (!response?.resource?.length) {
    return monitoringSourceToAnalysisType
  }

  for (const dataSourceType of response.resource) {
    if (!dataSourceType?.dataSourceType || !dataSourceType?.verificationType) continue
    const analysisType = monitoringSourceToAnalysisType.get(dataSourceType.dataSourceType) || {
      hasMetrics: false,
      hasLogs: false
    }

    if (dataSourceType.verificationType === 'LOG') {
      analysisType.hasLogs = true
    } else if (dataSourceType.verificationType === 'TIME_SERIES') {
      analysisType.hasMetrics = true
    }

    monitoringSourceToAnalysisType.set(dataSourceType.dataSourceType, analysisType)
  }

  return monitoringSourceToAnalysisType
}

function CVAnalysisTypeTabs(props: CVAnalysisTypeTabsProps): JSX.Element {
  const { hasLogs, hasMetrics, metricAnalysisView, logAnalysisView } = props
  const { getString } = useStrings()
  if (hasLogs && hasMetrics) {
    return (
      <Container className={css.analysisTypeTabs}>
        <Tabs id="AnalysisTypeTabs">
          <Tab
            id={getString('pipeline.verification.analysisTab.metrics')}
            title={getString('pipeline.verification.analysisTab.metrics')}
            panel={metricAnalysisView}
          />
          <Tab
            id={getString('pipeline.verification.analysisTab.logs')}
            title={getString('pipeline.verification.analysisTab.logs')}
            panel={logAnalysisView}
          />
        </Tabs>
      </Container>
    )
  } else if (hasLogs) {
    return logAnalysisView
  }

  return metricAnalysisView
}

export function CVAnalysisTabs(props: CVAnalysisTabsProps): JSX.Element {
  const {
    className,
    metricAnalysisView,
    logAnalysisView,
    serviceIdentifier,
    environmentIdentifier,
    onMonitoringSourceSelect
  } = props
  const { orgIdentifier, projectIdentifier, accountId } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { loading, error, data } = useGetDataSourcetypes({
    queryParams: { orgIdentifier, projectIdentifier, accountId, serviceIdentifier, environmentIdentifier }
  })
  const [analysisTypes, setAnalysisTypes] = useState<Map<MonitoringSourceTypes, AnalysisType>>(new Map())
  const allTypes = `${getString('all')} ${getString('cv.navLinks.adminSideNavLinks.monitoringSources')}`
  useEffect(() => {
    if (error?.message) showError(error.message, 5000)
  }, [error?.message])

  useEffect(() => {
    setAnalysisTypes(transformDataSourceTypes(data))
  }, [data])
  return (
    <Container className={cx(css.main, className)}>
      <Tabs
        id="AnalysisTabs"
        onChange={monitoringSource => {
          const source: MonitoringSourceTypes | string = monitoringSource as string
          onMonitoringSourceSelect(source === allTypes ? undefined : (monitoringSource as MonitoringSourceTypes))
        }}
      >
        <Tab
          id={allTypes}
          title={allTypes}
          panel={
            <CVAnalysisTypeTabs
              hasLogs={true}
              hasMetrics={true}
              metricAnalysisView={metricAnalysisView}
              logAnalysisView={logAnalysisView}
            />
          }
        />
        {loading
          ? LoadingTabs.map(numb => (
              <Tab
                id={`LoadingTab${numb}`}
                key={numb}
                title={<Container height={15} width={100} className={Classes.SKELETON} margin={{ right: 'small' }} />}
              />
            ))
          : Array.from(analysisTypes).map(analysisType => {
              return (
                <Tab
                  id={analysisType[0]}
                  key={analysisType[0]}
                  title={dataSourceTypeToLabel(analysisType[0])}
                  panel={
                    <CVAnalysisTypeTabs
                      {...analysisType[1]}
                      metricAnalysisView={metricAnalysisView}
                      logAnalysisView={logAnalysisView}
                    />
                  }
                />
              )
            })}
      </Tabs>
    </Container>
  )
}
