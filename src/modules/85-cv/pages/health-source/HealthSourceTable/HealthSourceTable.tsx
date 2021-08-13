import React, { useState, useEffect, useCallback } from 'react'
import cx from 'classnames'
import { Link, useParams, useHistory } from 'react-router-dom'
import type { CellProps, Renderer } from 'react-table'
import { Color, Container, Icon, Layout, Text } from '@wings-software/uicore'
import { useToaster } from '@common/exports'
import { NoDataCard } from '@common/components/Page/NoDataCard'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { MonitoredServiceResponse } from 'services/cv'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import { Table } from '@common/components'
import ContextMenuActions from '@cv/components/ContextMenuActions/ContextMenuActions'
import HealthSources from '@cv/components/PipelineSteps/ContinousVerification/components/HealthSources/HealthSources'
import HealthSourceDrawerContent from '../HealthSourceDrawer/HealthSourceDrawerContent'
import type { RowData, UpdatedHealthSource } from '../HealthSourceDrawer/HealthSourceDrawerContent.types'
import type { HealthSourceTableInterface } from './HealthSourceTable.types'
import { getIconBySourceType, getTypeByFeature, createHealthsourceList } from './HealthSourceTable.utils'
import css from './HealthSourceTable.module.scss'

export default function HealthSourceTable({
  breadCrumbRoute,
  serviceRef,
  environmentRef,
  monitoredServiceRef,
  value: tableData,
  onSuccess,
  isEdit,
  shouldRenderAtVerifyStep,
  isRunTimeInput,
  onCloseDrawer,
  validMonitoredSource,
  validateMonitoredSource
}: HealthSourceTableInterface): JSX.Element {
  const [modalOpen, setModalOpen] = useState(false)
  const history = useHistory()
  const { showError } = useToaster()
  const params = useParams<ProjectPathProps & { identifier: string }>()
  const { getString } = useStrings()
  const { routeTitle } = breadCrumbRoute || {}
  const [rowData, setrowData] = useState<RowData | null>(null)

  useEffect(() => {
    setModalOpen(!!validMonitoredSource)
  }, [validMonitoredSource])

  const createHeader = useCallback(() => {
    return (
      <>
        <Text
          className={css.breadCrumbLink}
          style={{ cursor: 'pointer' }}
          icon={'arrow-left'}
          iconProps={{ color: Color.PRIMARY_7, margin: { right: 'small' } }}
          color={Color.PRIMARY_7}
          onClick={() => {
            shouldRenderAtVerifyStep
              ? setModalOpen(false)
              : history.push(
                  routes.toCVMonitoringServices({
                    orgIdentifier: params.orgIdentifier,
                    projectIdentifier: params.projectIdentifier,
                    accountId: params.accountId
                  })
                )
          }}
        >
          {routeTitle || getString('cv.healthSource.backtoMonitoredService')}
        </Text>
        <div className="ng-tooltip-native">
          <p>
            {isEdit && rowData
              ? getString('cv.healthSource.editHealthSource')
              : getString('cv.healthSource.addHealthSource')}
          </p>
        </div>
      </>
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowData, isEdit])

  const deleteHealthSource = async (selectedRow: RowData): Promise<void> => {
    const payload = {
      monitoredService: {
        sources: {
          healthSources: tableData?.filter(healthSource => healthSource.identifier !== selectedRow.identifier)
        }
      }
    }
    onSuccess(payload as MonitoredServiceResponse)
  }

  const onSuccessHealthSourceTableWrapper = (data: MonitoredServiceResponse | UpdatedHealthSource): void => {
    if (shouldRenderAtVerifyStep) {
      onSuccess(data as MonitoredServiceResponse)
    } else {
      // single health source data add to table monitoredService?.sources
      const healthSources = createHealthsourceList(tableData, data as UpdatedHealthSource)
      const payload = {
        monitoredService: {
          sources: { healthSources }
        }
      }
      onSuccess(payload as MonitoredServiceResponse)
    }
    setModalOpen(false)
  }

  const onCloseHealthSourceTableWrapper = (): void => {
    setModalOpen(false)
    setrowData(null)
    onCloseDrawer?.(false)
  }

  const renderTypeWithIcon: Renderer<CellProps<RowData>> = ({ row }): JSX.Element => {
    const rowdata = row?.original
    return (
      <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
        <Icon className={css.sourceTypeIcon} name={getIconBySourceType(rowdata?.type as string)} size={22} />
        <ContextMenuActions
          titleText={getString('cv.healthSource.deleteHealthSource')}
          contentText={getString('cv.healthSource.deleteHealthSourceWarning') + `: ${rowdata.identifier}`}
          onDelete={async () => await deleteHealthSource(rowdata)}
          onEdit={() => {
            const rowFilteredData =
              tableData?.find((healthSource: RowData) => healthSource.identifier === rowdata.identifier) || null
            editRow(rowFilteredData)
          }}
        />
      </Layout.Horizontal>
    )
  }

  const renderTypeByFeature: Renderer<CellProps<RowData>> = ({ row }): JSX.Element => {
    const rowdata = row?.original
    return <Text>{getTypeByFeature(rowdata?.type as string, getString)}</Text>
  }

  const editRow = useCallback(rowToEdit => {
    if (rowToEdit) {
      setrowData(rowToEdit)
      setModalOpen(true)
    } else {
      showError(getString('cv.healthSource.noDataPresentHealthSource'))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      {shouldRenderAtVerifyStep ? (
        <HealthSources
          healthSources={tableData}
          editHealthSource={editRow}
          addHealthSource={() => {
            setModalOpen(true)
            setrowData(null)
          }}
          isRunTimeInput={isRunTimeInput}
        />
      ) : (
        <>
          <Text className={css.tableTitle}>{getString('connectors.cdng.healthSources.label')}</Text>
          {tableData.length ? (
            <Table
              className={css.tableWrapper}
              sortable={true}
              onRowClick={data => {
                const rowFilteredData =
                  tableData?.find((healthSource: RowData) => healthSource.identifier === data.identifier) || null
                editRow(rowFilteredData)
              }}
              columns={[
                {
                  Header: getString('name'),
                  accessor: 'name',
                  width: '30%'
                },
                {
                  Header: getString('typeLabel'),
                  width: '35%',
                  Cell: renderTypeByFeature
                },
                {
                  Header: getString('source'),
                  accessor: 'type',
                  width: '35%',
                  Cell: renderTypeWithIcon
                }
              ]}
              data={tableData}
            />
          ) : (
            <Container className={css.noData}>
              <NoDataCard icon={'join-table'} message={getString('cv.healthSource.noData')} />
            </Container>
          )}
          <div className={cx(css.drawerlink)}>
            <Link to={'#'} onClick={validateMonitoredSource}>
              + {getString('cv.healthSource.addHealthSource')}
            </Link>
          </div>
        </>
      )}
      <HealthSourceDrawerContent
        isEdit={!!isEdit && !!rowData}
        onClose={onCloseHealthSourceTableWrapper}
        createHeader={createHeader}
        modalOpen={modalOpen}
        onSuccess={onSuccessHealthSourceTableWrapper}
        rowData={rowData}
        tableData={tableData}
        serviceRef={serviceRef}
        environmentRef={environmentRef}
        monitoredServiceRef={monitoredServiceRef}
        shouldRenderAtVerifyStep={shouldRenderAtVerifyStep}
      />
    </>
  )
}
