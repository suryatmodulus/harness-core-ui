import React, { useState, useCallback } from 'react'
import { Link, useParams, useHistory } from 'react-router-dom'
import type { CellProps, Renderer } from 'react-table'
import { Color, Container, Text, SelectOption } from '@wings-software/uicore'
import { useToaster } from '@common/exports'
import { NoDataCard } from '@common/components/Page/NoDataCard'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { MonitoredServiceDTO, MonitoredServiceResponse, useUpdateMonitoredService } from 'services/cv'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import { Table } from '@common/components'
import ContextMenuActions from '@cv/components/ContextMenuActions/ContextMenuActions'
import { getIconBySourceType } from '@cv/pages/admin/setup/SetupUtils'
import HealthSourceDrawerContent, { updatedHealthSource } from '../HealthSourceDrawer/HealthSourceDrawerContent'
import css from './HealthSourceTable.module.scss'

interface HealthSourceTableInterface {
  value: Array<updatedHealthSource>
  breadCrumbRoute?: {
    routeTitle: string
    redirect: () => void
  }
  monitoringSourcRef: { monitoredServiceIdentifier: string; monitoredServiceName: string }
  serviceRef: SelectOption | undefined
  environmentRef: SelectOption | undefined
  onSuccess: (value: MonitoredServiceResponse) => void
  onDelete: (value: MonitoredServiceResponse) => void
  isEdit?: boolean
}

export default function HealthSourceTable({
  breadCrumbRoute,
  serviceRef,
  environmentRef,
  monitoringSourcRef,
  value: tableData,
  onSuccess,
  onDelete,
  isEdit
}: HealthSourceTableInterface): JSX.Element {
  const [modalOpen, setModalOpen] = useState(false)
  const history = useHistory()
  const { showError } = useToaster()
  const params = useParams<ProjectPathProps & { identifier: string }>()
  const { getString } = useStrings()
  const { routeTitle, redirect } = breadCrumbRoute || {}
  const [rowData, setrowData] = useState<updatedHealthSource | null>(null)

  const { mutate: updateMonitoredService } = useUpdateMonitoredService({
    identifier: params.identifier,
    queryParams: { accountId: params.accountId }
  })

  const createHeader = useCallback(() => {
    return (
      <>
        <Text
          icon={'arrow-left'}
          iconProps={{ color: Color.PRIMARY_7, margin: { right: 'small' } }}
          color={Color.PRIMARY_7}
          onClick={() => {
            redirect
              ? redirect()
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
  }, [rowData, isEdit])

  const deleteHealthSource = async (selectedRow: updatedHealthSource) => {
    try {
      const payload: MonitoredServiceDTO = {
        orgIdentifier: params.orgIdentifier,
        projectIdentifier: params.projectIdentifier,
        serviceRef: selectedRow.service as string,
        environmentRef: selectedRow.environment as string,
        identifier: monitoringSourcRef?.monitoredServiceIdentifier,
        name: monitoringSourcRef?.monitoredServiceName,
        description: 'monitoredService',
        type: 'Application',
        sources: {
          healthSources: tableData?.filter(healthSource => healthSource.identifier !== selectedRow.identifier)
        }
      }
      const deletePayload = await updateMonitoredService(payload)
      await onDelete(deletePayload?.resource as MonitoredServiceResponse)
    } catch (error) {
      showError(error?.message)
    }
  }

  const onSuccessHealthSourceTableWrapper = (data: MonitoredServiceResponse) => {
    setModalOpen(false)
    onSuccess(data)
  }

  const onCloseHealthSourceTableWrapper = () => {
    setModalOpen(false)
    setrowData(null)
  }

  const renderTypeWithIcon: Renderer<CellProps<updatedHealthSource>> = ({ row }): JSX.Element => {
    const rowdata = row?.original
    return <Text icon={getIconBySourceType(rowdata?.type as string)}>{rowdata?.type}</Text>
  }

  const renderEditDelete: Renderer<CellProps<updatedHealthSource>> = ({ row }): JSX.Element => {
    const rowdata = row?.original
    return (
      <Container flex>
        <Text>{rowdata?.service}</Text>
        <ContextMenuActions
          titleText={getString('cv.healthSource.deleteHealthSource')}
          contentText={getString('cv.healthSource.deleteHealthSourceWarning') + `: ${rowdata.identifier}`}
          onDelete={async () => deleteHealthSource(rowdata)}
          onEdit={() => {
            const rowFilteredData =
              tableData?.find((healthSource: updatedHealthSource) => healthSource.identifier === rowdata.identifier) ||
              null
            setrowData(rowFilteredData)
            setModalOpen(true)
          }}
        />
      </Container>
    )
  }

  return (
    <>
      <Text className={css.tableTitle}>{getString('connectors.cdng.healthSources.label')}</Text>
      {tableData.length ? (
        <Table
          className={css.tableWrapper}
          sortable={true}
          onRowClick={data => {
            const rowFilteredData =
              tableData?.find((healthSource: updatedHealthSource) => healthSource.identifier === data.identifier) ||
              null
            setrowData(rowFilteredData)
            setModalOpen(true)
          }}
          columns={[
            {
              Header: getString('name'),
              accessor: 'name',
              width: '15%'
            },
            {
              Header: getString('typeLabel'),
              width: '15%'
            },
            {
              Header: getString('source'),
              accessor: 'type',
              width: '15%',
              Cell: renderTypeWithIcon
            },
            {
              Header: getString('cv.healthSource.table.environmentMapping'),
              accessor: 'environment',
              width: '20%'
            },
            {
              Header: getString('cv.healthSource.table.serviceMapping'),
              accessor: 'service',
              Cell: renderEditDelete,
              width: '35%'
            }
          ]}
          data={tableData}
        />
      ) : (
        <Container className={css.noData}>
          <NoDataCard icon={'join-table'} message={getString('cv.healthSource.noData')} />
        </Container>
      )}
      <div className={css.drawerlink}>
        <Link to={'#'} onClick={() => setModalOpen(true)}>
          + {getString('cv.healthSource.addHealthSource')}
        </Link>
      </div>
      <HealthSourceDrawerContent
        isEdit={!!isEdit && !!rowData}
        onClose={onCloseHealthSourceTableWrapper}
        createHeader={createHeader}
        modalOpen={modalOpen}
        onSuccess={onSuccessHealthSourceTableWrapper}
        rowData={rowData}
        tableData={tableData}
        monitoringSourcRef={monitoringSourcRef}
        serviceRef={serviceRef}
        environmentRef={environmentRef}
      />
    </>
  )
}
