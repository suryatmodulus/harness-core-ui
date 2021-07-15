import React from 'react'
import { useParams } from 'react-router-dom'
import { Color, Layout, Text } from '@wings-software/uicore'
import type { ProjectPathProps, ServicePathProps } from '@common/interfaces/RouteInterfaces'
import {
  GetActiveServiceInstanceCountBreakdownQueryParams,
  useGetActiveServiceInstanceCountBreakdown
} from 'services/cd-ng'
import { PieChart, PieChartProps } from '@dashboards/components/PieChart/PieChart'
import { useStrings } from 'framework/strings'
import { numberFormatter } from '@dashboards/components/Services/common'
import css from '@dashboards/components/ServiceDetails/ActiveServiceInstances/ActiveServiceInstances.module.scss'

export const ActiveServiceInstancesHeader: React.FC = () => {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier, serviceId } = useParams<ProjectPathProps & ServicePathProps>()

  const queryParams: GetActiveServiceInstanceCountBreakdownQueryParams = {
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    serviceId
  }
  const { data, error } = useGetActiveServiceInstanceCountBreakdown({ queryParams })

  if (error) {
    return <></>
  }

  const { nonProdInstances = 0, prodInstances = 0, totalInstances = 0 } = data?.data || {}

  const pieChartProps: PieChartProps = {
    items: [
      {
        label: getString('dashboards.serviceDashboard.nonProd'),
        value: nonProdInstances,
        formattedValue: numberFormatter(nonProdInstances),
        color: 'var(--primary-2)'
      },
      {
        label: getString('dashboards.serviceDashboard.prod'),
        value: prodInstances,
        formattedValue: numberFormatter(prodInstances),
        color: 'var(--primary-7)'
      }
    ],
    size: 36,
    labelContainerStyles: css.pieChartLabelContainerStyles,
    labelStyles: css.pieChartLabelStyles,
    options: {
      tooltip: {
        enabled: false
      }
    }
  }

  return (
    <Layout.Horizontal
      flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
      padding={{ bottom: 'small' }}
      className={css.activeServiceInstancesHeader}
    >
      <Text font={{ weight: 'bold' }} color={Color.GREY_800} className={css.instanceCount} margin={{ right: 'large' }}>
        {numberFormatter(totalInstances)}
      </Text>
      <PieChart {...pieChartProps} />
    </Layout.Horizontal>
  )
}
