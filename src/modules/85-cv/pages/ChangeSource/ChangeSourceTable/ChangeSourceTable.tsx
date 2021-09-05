import React, { useCallback } from 'react'
import { cloneDeep } from 'lodash-es'
import type { Renderer, CellProps } from 'react-table'
import { Container, Icon, Layout, Text } from '@wings-software/uicore'
import { Table } from '@common/components'
import { useStrings } from 'framework/strings'
import type { ChangeSourceDTO } from 'services/cv'
import { NoDataCard } from '@common/components/Page/NoDataCard'
import ContextMenuActions from '@cv/components/ContextMenuActions/ContextMenuActions'
import type { ChangeSourceTableInterface } from './ChangeSourceTable.types'
import { getIconBySource } from '../ChangeSource.utils'
import css from './ChangeSourceTable.module.scss'

export default function ChangeSourceTable({ value, onSuccess, onEdit }: ChangeSourceTableInterface): JSX.Element {
  const tableData = cloneDeep(value)
  const { getString } = useStrings()

  const deleteChangeSource = useCallback(
    async (selectedRow: ChangeSourceDTO): Promise<void> => {
      const updatedChangeSources = tableData?.filter(changeSource => changeSource.identifier !== selectedRow.identifier)
      await onSuccess(updatedChangeSources as ChangeSourceDTO[])
    },
    [tableData]
  )

  // Not Planned For Release
  //
  // const onToggle = async (selectedRow: ChangeSourceDTO): Promise<void> => {
  //   const updatedChangeSources = tableData?.map(changeSource => {
  //     if (changeSource.identifier === selectedRow.identifier) {
  //       changeSource.enabled = !selectedRow.enabled
  //     }
  //     return changeSource
  //   })
  //   await onSuccess(updatedChangeSources as ChangeSourceDTO[])
  // }

  const renderEnable: Renderer<CellProps<ChangeSourceDTO>> = ({ row }): JSX.Element => {
    const rowdata = row?.original
    return (
      <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
        {/* <Switch checked={rowdata?.enabled} onChange={async () => await onToggle(rowdata)} /> */}
        <Icon
          className={css.sourceTypeIcon}
          name={getIconBySource(rowdata?.type as ChangeSourceDTO['type'])}
          size={22}
        />
        <ContextMenuActions
          titleText={getString('cv.healthSource.deleteHealthSource')}
          contentText={getString('cv.healthSource.deleteHealthSourceWarning') + `: ${rowdata.identifier}`}
          onDelete={async () => await deleteChangeSource(rowdata)}
          onEdit={() => {
            onEdit({ isEdit: true, tableData, rowdata, onSuccess })
          }}
        />
      </Layout.Horizontal>
    )
  }

  return (
    <>
      <Text className={css.tableTitle}>{getString('cv.navLinks.adminSideNavLinks.activitySources')}</Text>
      {tableData?.length ? (
        <Table
          className={css.changeSourceTableWrapper}
          sortable={true}
          onRowClick={rowdata => {
            onEdit({ isEdit: true, tableData, rowdata, onSuccess })
          }}
          columns={[
            {
              Header: getString('name'),
              accessor: 'name',
              width: '30%'
            },
            {
              Header: getString('typeLabel'),
              accessor: 'category',
              width: '35%'
            },
            {
              Header: getString('source'),
              width: '35%',
              Cell: renderEnable
            }
          ]}
          data={tableData}
        />
      ) : (
        <Container className={css.noData}>
          <NoDataCard icon={'join-table'} message={getString('cv.changeSource.noData')} />
        </Container>
      )}
    </>
  )
}
