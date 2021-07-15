import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { CellProps, Renderer } from 'react-table'
import cx from 'classnames'
import { Color, Container, Layout, Text } from '@wings-software/uicore'
import { PageSpinner, Table } from '@common/components'
import { PageError } from '@common/components/Page/PageError'
import type { ProjectPathProps, ServicePathProps } from '@common/interfaces/RouteInterfaces'
import {
  EnvBuildIdAndInstanceCountInfo,
  GetEnvBuildInstanceCountQueryParams,
  useGetEnvBuildInstanceCount
} from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import DeploymentsEmptyState from '@dashboards/icons/DeploymentsEmptyState.svg'
import css from '@dashboards/components/ServiceDetails/ActiveServiceInstances/ActiveServiceInstances.module.scss'

const TOTAL_VISIBLE_BUILDS = 5
const TOTAL_VISIBLE_INSTANCES = 10

type VisibleBuildCount = { [key: string]: number }

interface TableRowData {
  envId?: string
  envName?: string
  buildId?: string
  instanceCount?: number
  remainingCount?: number
}

// returns a map of env id and total builds count
const initVisibleBuildCount = (
  envBuildIdAndInstanceCountInfo?: EnvBuildIdAndInstanceCountInfo[]
): VisibleBuildCount => {
  if (!envBuildIdAndInstanceCountInfo) {
    return {}
  }
  const visibleBuildCount: VisibleBuildCount = {}
  envBuildIdAndInstanceCountInfo.forEach(item => {
    if (item.envId) {
      visibleBuildCount[item.envId] = TOTAL_VISIBLE_BUILDS
    }
  })
  return visibleBuildCount
}

const getTableData = (
  envBuildIdAndInstanceCountInfo?: EnvBuildIdAndInstanceCountInfo[],
  visibleBuildCount?: VisibleBuildCount
): TableRowData[] => {
  const tableData: TableRowData[] = []
  if (!envBuildIdAndInstanceCountInfo || !visibleBuildCount) {
    return tableData
  }
  envBuildIdAndInstanceCountInfo.forEach(item => {
    const envId = item.envId
    if (envId) {
      const visibleRowsForEnv = visibleBuildCount[envId]
      const totalAvailableBuildsForEnv = item.buildIdAndInstanceCountList?.length || 0
      item.buildIdAndInstanceCountList?.slice(0, visibleRowsForEnv).forEach((row, index) => {
        tableData.push({
          ...(!index ? { envId, envName: item.envName } : {}),
          buildId: row.buildId,
          instanceCount: row.count
        })
      })
      if (visibleRowsForEnv < totalAvailableBuildsForEnv) {
        tableData.push({ envId, remainingCount: totalAvailableBuildsForEnv - visibleRowsForEnv })
      }
    }
  })
  return tableData
}

const RenderEnvironment: Renderer<CellProps<TableRowData>> = ({
  row: {
    original: { envId, remainingCount }
  }
}) => {
  return envId && !remainingCount ? (
    <Container className={css.paddedContainer}>
      <Text className={css.environmentRow} font={{ size: 'small', weight: 'bold' }} color={Color.WHITE}>
        {envId}
      </Text>
    </Container>
  ) : (
    <></>
  )
}

const RenderBuildName: Renderer<CellProps<TableRowData>> = ({
  row: {
    original: { envId, buildId, remainingCount }
  },
  column
}) => {
  const { getString } = useStrings()
  const component = buildId ? (
    <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.GREY_800}>
      {buildId}
    </Text>
  ) : (
    <Text
      font={{ size: 'xsmall', weight: 'semi-bold' }}
      color={Color.PRIMARY_6}
      background={Color.PRIMARY_1}
      className={css.seeMore}
      onClick={() => (column as any)?.expandBuilds?.(envId)}
    >
      {getString('dashboards.serviceDashboard.seeMore', { count: remainingCount })}
    </Text>
  )
  return <Container className={css.paddedContainer}>{component}</Container>
}

const RenderInstanceCount: Renderer<CellProps<TableRowData>> = ({
  row: {
    original: { instanceCount }
  }
}) => {
  return instanceCount ? (
    <Container className={css.paddedContainer}>
      <Text font={{ size: 'xsmall', weight: 'bold' }} background={Color.GREY_100} className={css.instanceCount}>
        {instanceCount}
      </Text>
    </Container>
  ) : (
    <></>
  )
}

const RenderInstances: Renderer<CellProps<TableRowData>> = ({
  row: {
    original: { instanceCount }
  }
}) => {
  return instanceCount ? (
    <Container className={cx(css.paddedContainer, css.hexContainer)} flex={{ justifyContent: 'flex-start' }}>
      {Array(Math.min(instanceCount, TOTAL_VISIBLE_INSTANCES))
        .fill(null)
        .map(index => (
          <Container
            className={css.hex}
            width={18}
            height={18}
            background={Color.PRIMARY_3}
            key={index}
            margin={{ left: 'xsmall', right: 'xsmall', top: 'xsmall', bottom: 'xsmall' }}
          ></Container>
        ))}
      {instanceCount > TOTAL_VISIBLE_INSTANCES ? (
        <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.GREY_600} margin={{ left: 'xsmall' }}>{`+${
          instanceCount - TOTAL_VISIBLE_INSTANCES
        }`}</Text>
      ) : (
        <></>
      )}
    </Container>
  ) : (
    <></>
  )
}

export const ActiveServiceInstancesContent: React.FC = () => {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier, serviceId } = useParams<ProjectPathProps & ServicePathProps>()

  // this state holds how many builds are visible for each environment, it updates as we click on show more button
  const [visibleBuildCount, setVisibleBuildCount] = useState<VisibleBuildCount>({})

  const queryParams: GetEnvBuildInstanceCountQueryParams = {
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    serviceId
  }
  const { loading, data, error, refetch } = useGetEnvBuildInstanceCount({ queryParams })

  useEffect(() => {
    setVisibleBuildCount(initVisibleBuildCount(data?.data?.envBuildIdAndInstanceCountInfoList))
  }, [data, setVisibleBuildCount])

  const expandBuilds = useCallback((envId?: string): void => {
    if (!envId) {
      return
    }
    setVisibleBuildCount(prevVisibleBuildCount => ({
      ...prevVisibleBuildCount,
      [envId]: prevVisibleBuildCount[envId] + TOTAL_VISIBLE_BUILDS
    }))
  }, [])

  const columns = useMemo(() => {
    return [
      {
        Header: getString('environment'),
        id: 'service',
        width: '20%',
        Cell: RenderEnvironment
      },
      {
        Header: getString('dashboards.serviceDashboard.buildName'),
        id: 'type',
        width: '20%',
        Cell: RenderBuildName,
        expandBuilds
      },
      {
        Header: '',
        id: 'serviceInstances',
        width: '10%',
        Cell: RenderInstanceCount
      },
      {
        Header: getString('common.instanceLabel'),
        id: 'deployments',
        width: '50%',
        Cell: RenderInstances
      }
    ]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const tableData: TableRowData[] = useMemo(
    () => getTableData(data?.data?.envBuildIdAndInstanceCountInfoList, visibleBuildCount),
    [data, visibleBuildCount]
  )

  if (loading || error || !(data?.data?.envBuildIdAndInstanceCountInfoList || []).length) {
    const component = (() => {
      if (loading) {
        return (
          <Container data-test="ActiveServiceInstancesLoader">
            <PageSpinner />
          </Container>
        )
      }
      if (error) {
        return (
          <Container data-test="ActiveServiceInstancesError" height={'100%'}>
            <PageError onClick={() => refetch()} />
          </Container>
        )
      }
      return (
        <Layout.Vertical height="100%" flex={{ align: 'center-center' }} data-test="ActiveServiceInstancesEmpty">
          <img width="150" height="100" src={DeploymentsEmptyState} style={{ alignSelf: 'center' }} />
          <Text color={Color.GREY_400} margin={{ top: 'medium' }}>
            {getString('dashboards.serviceDashboard.noDeployments', {
              timeRange: getString('dashboards.serviceDashboard.month')
            })}
          </Text>
        </Layout.Vertical>
      )
    })()
    return component
  }

  return (
    <Layout.Horizontal padding={{ top: 'small' }}>
      <Table<TableRowData> columns={columns} data={tableData} className={css.instanceTable} />
    </Layout.Horizontal>
  )
}
