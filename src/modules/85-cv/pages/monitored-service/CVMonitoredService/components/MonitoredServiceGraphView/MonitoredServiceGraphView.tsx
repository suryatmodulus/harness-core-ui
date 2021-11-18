import React, { useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Layout, Container, NoDataCard } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import noServiceAvailableImage from '@cv/assets/noServiceAvailable.png'
import FilterCard from '@cv/components/FilterCard/FilterCard'
import ServiceDependenciesLegend from '@cv/components/ServiceDependenciesLegend/ServiceDependenciesLegend'
import { DependencyGraph } from '@cv/components/DependencyGraph/DependencyGraph'
import GraphSummaryCard from '../GraphSummaryCard/GraphSummaryCard'
import type { MonitoredServiceGraphViewProps } from '../../CVMonitoredService.types'
import { getMonitoredServiceFilterOptions } from '../../CVMonitoredService.utils'
import { getDependencyGraphOptions } from './MonitoredServiceGraphView.utils'
import css from '../../CVMonitoredService.module.scss'

const MonitoredServiceGraphView: React.FC<MonitoredServiceGraphViewProps> = ({
  serviceCountData,
  monitoredServiceListData,
  monitoredServiceDependencyData,
  selectedFilter,
  onFilter,
  onEditService,
  onDeleteService,
  onToggleService,
  healthMonitoringFlagLoading
}) => {
  const { getString } = useStrings()
  const [point, setPoint] = useState<{ sticky: any; point: any }>()

  const renderDependencyData = useCallback(() => {
    if (monitoredServiceDependencyData) {
      return (
        <DependencyGraph
          dependencyData={monitoredServiceDependencyData}
          options={getDependencyGraphOptions(setPoint)}
        />
      )
    }

    return <></>
  }, [monitoredServiceDependencyData])

  const renderSummaryCard = (): JSX.Element => {
    const monitoredService = monitoredServiceListData?.content?.find(
      mService => mService.identifier === point?.point.id
    )

    if (monitoredService && point?.sticky.element) {
      return createPortal(
        <foreignObject className="node" width="360px" height="435px">
          <GraphSummaryCard
            monitoredService={monitoredService}
            onEditService={onEditService}
            onDeleteService={onDeleteService}
            onToggleService={onToggleService}
            healthMonitoringFlagLoading={healthMonitoringFlagLoading}
          />
        </foreignObject>,
        point.sticky.element
      )
    }

    return <></>
  }

  const filterOptions = getMonitoredServiceFilterOptions(getString, serviceCountData)

  return (
    <Layout.Vertical
      height="100%"
      className={css.dependencyGraph}
      padding={{ top: 'medium', left: 'xlarge', right: 'xlarge', bottom: 'xlarge' }}
    >
      <FilterCard
        data={filterOptions}
        cardClassName={css.filterCard}
        selected={filterOptions.find(card => card.type === selectedFilter)}
        onChange={item => onFilter(item.type)}
      />
      {monitoredServiceDependencyData?.nodes?.length ? (
        <Container style={{ flexGrow: 1 }}>
          {renderDependencyData()}
          {renderSummaryCard()}
        </Container>
      ) : (
        <NoDataCard
          image={noServiceAvailableImage}
          message={getString('cv.monitoredServices.youHaveNoMonitoredServices')}
          imageClassName={css.noServiceAvailableImage}
          containerClassName={css.noDataContainer}
        />
      )}
      <ServiceDependenciesLegend margin={{ top: 'medium' }} />
    </Layout.Vertical>
  )
}

export default MonitoredServiceGraphView
