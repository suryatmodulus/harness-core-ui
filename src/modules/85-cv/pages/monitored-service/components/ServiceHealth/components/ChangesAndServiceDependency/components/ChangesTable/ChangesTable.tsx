import React, { useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router'
import { Link } from 'react-router-dom'
import type { Column } from 'react-table'
import { Text, Icon, Color, Container } from '@wings-software/uicore'
import Card from '@cv/components/Card/Card'
import { useStrings } from 'framework/strings'
import { useChangeEventList } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { Table } from '@common/components'
import { NoDataCard } from '@common/components/Page/NoDataCard'
import { PageError } from '@common/components/Page/PageError'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import routes from '@common/RouteDefinitions'
import noDataImage from '@cv/assets/noData.svg'
import type { ChangesTableInterface } from './ChangesTable.types'
import { renderTime, renderName, renderImpact, renderType, renderChangeType } from './ChangesTable.utils'
import { defaultPageSize } from './ChangesTable.constants'
import css from './ChangeTable.module.scss'

export default function ChangesTable({
  startTime,
  endTime,
  hasChangeSource,
  serviceIdentifier,
  environmentIdentifier
}: ChangesTableInterface): JSX.Element {
  const [page, setPage] = useState(0)
  const { getString } = useStrings()
  const { orgIdentifier, projectIdentifier, accountId, identifier } = useParams<
    ProjectPathProps & { identifier: string }
  >()
  const { data, refetch, loading, error } = useChangeEventList({
    lazy: true,
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier
  })

  const { content = [], pageSize = 0, pageIndex = 0, totalPages = 0, totalItems = 0 } = data?.resource ?? ({} as any)

  useEffect(() => {
    refetch({
      queryParams: {
        serviceIdentifiers: [serviceIdentifier],
        envIdentifiers: [environmentIdentifier],
        startTime,
        endTime,
        pageIndex: page,
        pageSize: 10
      }
    })
  }, [startTime, endTime, serviceIdentifier, environmentIdentifier, page])

  const columns: Column<any>[] = useMemo(
    () => [
      {
        Header: getString('timeLabel'),
        Cell: renderTime,
        accessor: 'eventTime',
        width: '15%'
      },
      {
        Header: getString('name'),
        Cell: renderName,
        accessor: 'name',
        width: '30%'
      },
      {
        Header: getString('cv.monitoredServices.changesTable.impact'),
        Cell: renderImpact,
        accessor: 'serviceIdentifier',
        width: '25%'
      },
      {
        Header: getString('source'),
        Cell: renderType,
        accessor: 'type',
        width: '15%'
      },
      {
        Header: getString('typeLabel'),
        width: '15%',
        accessor: 'category',
        Cell: renderChangeType
      }
    ],
    [content]
  )

  const renderContent = () => {
    if (loading) {
      return (
        <Card className={css.cardContainer}>
          <Container className={css.noData}>
            <Icon name="steps-spinner" color={Color.GREY_400} size={30} />
          </Container>
        </Card>
      )
    } else if (error) {
      return (
        <Card className={css.cardContainer}>
          <Container className={css.noData}>
            <PageError
              message={getErrorMessage(error)}
              onClick={() =>
                refetch({
                  queryParams: {
                    serviceIdentifiers: [serviceIdentifier],
                    envIdentifiers: [environmentIdentifier],
                    startTime,
                    endTime,
                    pageIndex: page,
                    pageSize: defaultPageSize
                  }
                })
              }
            />
          </Container>
        </Card>
      )
    } else if (!hasChangeSource) {
      const configurationsTabRoute = routes.toCVMonitoredServiceConfigurations({
        accountId,
        projectIdentifier,
        orgIdentifier,
        identifier,
        module: 'cv'
      })
      return (
        <Card className={css.cardContainer}>
          <Container className={css.noData}>
            <NoDataCard
              button={<Link to={configurationsTabRoute}>{getString('cv.changeSource.configureChangeSource')}</Link>}
              message={getString('cv.changeSource.noData')}
              icon="warning-sign"
            />
          </Container>
        </Card>
      )
    } else if (!content?.length) {
      return (
        <Card className={css.cardContainer}>
          <Container className={css.noData}>
            <NoDataCard message={getString('cv.monitoredServices.noAvailableData')} image={noDataImage} />
          </Container>
        </Card>
      )
    } else {
      return (
        <Card className={css.cardContainer}>
          <Table
            sortable={true}
            columns={columns}
            data={content}
            pagination={{
              pageSize,
              pageIndex,
              pageCount: totalPages,
              itemCount: totalItems,
              gotoPage: setPage
            }}
          />
        </Card>
      )
    }
  }

  return (
    <>
      <Text font={{ weight: 'bold', size: 'normal' }} padding={{ bottom: 'medium' }}>
        {getString('changes')}({content?.length})
      </Text>
      {renderContent()}
    </>
  )
}
