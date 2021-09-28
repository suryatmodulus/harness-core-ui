import React, { useCallback, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Color, Container, Icon } from '@wings-software/uicore'
import { DependencyGraph } from '@cv/components/DependencyGraph/DependencyGraph'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { useGetServiceDependencyGraph } from 'services/cv'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { PageError } from '@common/components/Page/PageError'
import { NoDataCard } from '@common/components/Page/NoDataCard'
import Card from '@cv/components/Card/Card'
import noDataImage from '@cv/assets/noData.svg'
import { getDependencyData } from './MonitoredServiceDependenciesChart.utils'
import type { MonitoredServiceDependenciesChartProps } from './MonitoredServiceDependenciesChart.types'
import css from './MonitoredServiceDependenciesChart.module.scss'

export default function MonitoredServiceDependenciesChart(props: MonitoredServiceDependenciesChartProps): JSX.Element {
  const { serviceIdentifier, envIdentifier } = props
  const { getString } = useStrings()
  const { orgIdentifier, projectIdentifier, accountId } = useParams<ProjectPathProps>()
  const queryParams = useMemo(
    () => ({ accountId, orgIdentifier, projectIdentifier, serviceIdentifier, envIdentifier }),
    [accountId, envIdentifier, orgIdentifier, projectIdentifier, serviceIdentifier]
  )
  const {
    data: serviceDependencyGraphData,
    refetch: fetchServiceDependencyData,
    loading,
    error
  } = useGetServiceDependencyGraph({
    queryParams,
    lazy: true
  })

  useEffect(() => {
    if (serviceIdentifier && envIdentifier) {
      fetchServiceDependencyData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [envIdentifier, serviceIdentifier])

  const dependencyData = useMemo(() => getDependencyData(serviceDependencyGraphData), [serviceDependencyGraphData])

  const renderContent = useCallback(() => {
    if (loading) {
      return (
        <Container>
          <Icon name="steps-spinner" color={Color.GREY_400} size={30} />
        </Container>
      )
    } else if (error) {
      return (
        <Container>
          <PageError message={getErrorMessage(error)} onClick={() => fetchServiceDependencyData({ queryParams })} />
        </Container>
      )
    } else if (!dependencyData) {
      return (
        <Container>
          <NoDataCard message={getString('cv.monitoredServices.noAvailableData')} image={noDataImage} />
        </Container>
      )
    } else {
      return <DependencyGraph dependencyData={dependencyData} options={{ chart: { height: 500 } }} />
    }
  }, [dependencyData, error, fetchServiceDependencyData, getString, loading, queryParams])

  return (
    <Card className={css.cardContainer} contentClassName={css.cardContent}>
      {renderContent()}
    </Card>
  )
}
