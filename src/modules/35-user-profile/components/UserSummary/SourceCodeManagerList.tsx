import React from 'react'
import { Text, Layout, Color, Button, Icon } from '@wings-software/uicore'
import type { CellProps, Renderer } from 'react-table'
import { useSourceCodeModal } from '@user-profile/modals/SourceCodeManager/useSourceCodeManager'
import { useStrings } from 'framework/exports'
import { SourceCodeManagerDTO, useGetSourceCodeManagers } from 'services/cd-ng'
import { Table } from '@common/components'
import { getIconBySCM, SourceCodeTypes } from '@user-profile/utils/utils'

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

const RenderColumnDelete: Renderer<CellProps<SourceCodeManagerDTO>> = () => {
  const handleDelete = (e: React.MouseEvent<Element, MouseEvent>): void => {
    e.stopPropagation()
  }
  return <Button icon="trash" minimal onClick={handleDelete} />
}

const SourceCodeManagerList: React.FC = () => {
  const { getString } = useStrings()
  const { data, refetch } = useGetSourceCodeManagers({})

  const { openSourceCodeModal } = useSourceCodeModal({ onSuccess: refetch })

  return (
    <Layout.Vertical spacing="large">
      <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.BLACK}>
        {getString('userProfile.mysourceCodeManagers')}
      </Text>
      <Table<SourceCodeManagerDTO>
        data={data?.data || []}
        columns={[
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
            Cell: RenderColumnDelete
          }
        ]}
        hideHeaders={true}
      />
      <Layout.Horizontal padding={{ top: 'large' }}>
        <Button text={getString('userProfile.plusSCM')} minimal onClick={openSourceCodeModal} />
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export default SourceCodeManagerList
