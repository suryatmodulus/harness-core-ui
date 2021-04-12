import React, { useMemo } from 'react'
import { Text, Layout, Color, Button, Icon } from '@wings-software/uicore'
import type { CellProps, Column, Renderer } from 'react-table'
import { useSourceCodeModal } from '@user-profile/modals/SourceCodeManager/useSourceCodeManager'
import { useStrings } from 'framework/exports'
import { SourceCodeManagerDTO, useDeleteSourceCodeManagers, useGetSourceCodeManagers } from 'services/cd-ng'
import { Table, useToaster } from '@common/components'
import { getIconBySCM, SourceCodeTypes } from '@user-profile/utils/utils'
import { useConfirmationDialog } from '@common/exports'

const RenderColumnName: Renderer<CellProps<SourceCodeManagerDTO>> = ({ row }) => {
  const data = row.original
  return (
    <Layout.Horizontal
      padding={{ left: 'small' }}
      spacing="medium"
      flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
    >
      <Icon name={getIconBySCM(data.type as SourceCodeTypes)} size={25} />
      <Text color={Color.BLACK} lineClamp={1}>
        {data.name}
      </Text>
    </Layout.Horizontal>
  )
}

const RenderColumnDelete: Renderer<CellProps<SourceCodeManagerDTO>> = ({ row, column }) => {
  const data = row.original
  const { showSuccess, showError } = useToaster()
  const { getString } = useStrings()
  const { mutate: deleteSCM } = useDeleteSourceCodeManagers({})

  const { openDialog } = useConfirmationDialog({
    contentText: `${getString('userProfile.confirmDelete', { name: data.name })}`,
    titleText: getString('userProfile.confirmDeleteTitle'),
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    onCloseDialog: async (isConfirmed: boolean) => {
      /* istanbul ignore else */ if (isConfirmed) {
        try {
          const deleted = await deleteSCM(data.name, {
            headers: { 'content-type': 'application/json' }
          })
          /* istanbul ignore else */ if (deleted) {
            showSuccess(
              getString('userProfile.scmDeleteSuccess', {
                name: data.name
              })
            )
            ;(column as any).reload?.()
          } /* istanbul ignore next */ else {
            showError(
              getString('userProfile.scmDeleteFailure', {
                name: data.name
              })
            )
          }
        } /* istanbul ignore next */ catch (err) {
          showError(err?.data?.message || err?.message)
        }
      }
    }
  })

  const handleDelete = (e: React.MouseEvent<Element, MouseEvent>): void => {
    e.stopPropagation()
    openDialog()
  }

  return <Button icon="trash" data-testid={`${data.name}-delete`} minimal onClick={handleDelete} />
}

const SourceCodeManagerList: React.FC = () => {
  const { getString } = useStrings()
  const { data, refetch } = useGetSourceCodeManagers({})

  const { openSourceCodeModal } = useSourceCodeModal({ onSuccess: refetch })

  const columns: Column<SourceCodeManagerDTO>[] = useMemo(
    () => [
      {
        Header: '',
        id: 'name',
        accessor: 'name',
        width: '95%',
        Cell: RenderColumnName
      },
      {
        Header: '',
        id: 'delete',
        accessor: 'type',
        width: '5%',
        Cell: RenderColumnDelete,
        reload: refetch
      }
    ],
    [refetch]
  )
  return (
    <Layout.Vertical spacing="large">
      <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.BLACK}>
        {getString('userProfile.mysourceCodeManagers')}
      </Text>
      {data?.data?.length ? (
        <Table<SourceCodeManagerDTO> data={data.data} columns={columns} hideHeaders={true} />
      ) : null}
      <Layout.Horizontal padding={{ top: 'large' }}>
        <Button text={getString('userProfile.plusSCM')} minimal onClick={openSourceCodeModal} />
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export default SourceCodeManagerList
