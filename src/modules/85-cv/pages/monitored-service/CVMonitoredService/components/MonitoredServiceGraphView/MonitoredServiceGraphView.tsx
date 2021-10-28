import React, { useState, useCallback } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import type { Chart as HighchartsChart, TooltipFormatterContextObject } from 'highcharts'
import { Layout, Container, Views } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getCVMonitoringServicesSearchParam } from '@cv/utils/CommonUtils'
import FilterCard from '@cv/components/FilterCard/FilterCard'
import { HighchartCustomTooltip } from '@cv/utils/HighchartCustomTooltip'
import ServiceDependenciesLegend from '@cv/components/ServiceDependenciesLegend/ServiceDependenciesLegend'
import { DependencyGraph } from '@cv/components/DependencyGraph/DependencyGraph'
import GraphSummaryCard from '../GraphSummaryCard/GraphSummaryCard'
import type { MonitoredServiceGraphViewProps } from '../../CVMonitoredService.types'
import { getMonitoredServiceFilterOptions } from '../../CVMonitoredService.utils'
import { getListingPageDependencyGraphOptions } from './MonitoredServiceGraphView.utils'
import css from '../../CVMonitoredService.module.scss'

const MonitoredServiceGraphView: React.FC<MonitoredServiceGraphViewProps> = ({
  monitoredServiceListData,
  monitoredServiceDependencyData,
  selectedFilter,
  setSelectedFilter,
  onEditService,
  onDeleteService,
  onToggleService,
  healthMonitoringFlagLoading
}) => {
  const history = useHistory()
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  const [chart, setChart] = useState<HighchartsChart | null>(null)

  const renderDependencyData = useCallback(() => {
    return monitoredServiceDependencyData ? (
      <DependencyGraph
        dependencyData={monitoredServiceDependencyData}
        highchartsCallback={setChart}
        options={getListingPageDependencyGraphOptions(serviceIdentifier => {
          if (serviceIdentifier) {
            history.push({
              pathname: routes.toCVAddMonitoringServicesEdit({
                accountId,
                orgIdentifier,
                projectIdentifier,
                identifier: serviceIdentifier,
                module: 'cv'
              }),
              search: getCVMonitoringServicesSearchParam({ view: Views.GRID })
            })
          }
        })}
      />
    ) : (
      <></>
    )
  }, [monitoredServiceDependencyData])

  const getHighchartCustomTooltipContent = (formatterContext: TooltipFormatterContextObject): JSX.Element => {
    const { key } = formatterContext

    const monitoredService = monitoredServiceListData?.content?.find(
      mService => mService.identifier === (key as unknown as string)
    )

    return monitoredService ? (
      <GraphSummaryCard
        monitoredService={monitoredService}
        onEditService={onEditService}
        onDeleteService={onDeleteService}
        onToggleService={onToggleService}
        healthMonitoringFlagLoading={healthMonitoringFlagLoading}
      />
    ) : (
      <></>
    )
  }

  return (
    <Layout.Vertical
      height="100%"
      className={css.dependencyGraph}
      padding={{ top: 'medium', left: 'xlarge', right: 'xlarge', bottom: 'xlarge' }}
    >
      <FilterCard
        data={getMonitoredServiceFilterOptions(getString, monitoredServiceListData)}
        cardClassName={css.filterCard}
        selected={selectedFilter ?? getMonitoredServiceFilterOptions(getString, monitoredServiceListData)[0]}
        onChange={item => setSelectedFilter(item)}
      />
      <Container style={{ flexGrow: 1 }}>
        {renderDependencyData()}
        <HighchartCustomTooltip chart={chart}>{getHighchartCustomTooltipContent}</HighchartCustomTooltip>
      </Container>
      <ServiceDependenciesLegend margin={{ top: 'medium' }} />
    </Layout.Vertical>
  )
}

export default MonitoredServiceGraphView
