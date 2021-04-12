import React, { useState } from 'react'
import { Color, Container, Layout, Text, Icon } from '@wings-software/uicore'
import type { CellProps, Renderer } from 'react-table'
import ResourceHandlerTable, {
  ResourceHandlerTableData
} from '@rbac/components/ResourceHandlerTable/ResourceHandlerTable'
import { PageSpinner } from '@common/components'
import type { RbacResourceModalProps } from '@rbac/factories/RbacFactory'
import { useStrings } from 'framework/exports'
import { EnvironmentResponseDTO, useGetEnvironmentList } from 'services/cd-ng'

const RenderColumnPipeline: Renderer<CellProps<EnvironmentResponseDTO>> = ({ row }) => {
  const rowdata = row.original

  return (
    <Layout.Vertical spacing="small" data-testid={rowdata.identifier}>
      <Text color={Color.GREY_800} iconProps={{ size: 16 }}>
        {rowdata.name}
      </Text>
      <Text color={Color.GREY_400}>{rowdata.description}</Text>
    </Layout.Vertical>
  )
}

const EnvironmentResourceModal: React.FC<RbacResourceModalProps> = ({
  // searchTerm,
  onSelectChange,
  selectedData,
  resourceScope
}) => {
  const { accountIdentifier, orgIdentifier = '', projectIdentifier = '' } = resourceScope
  const { getString } = useStrings()
  const [page, setPage] = useState(0)

  const { data: environmentsResponse, loading: isFetchingEnvironments } = useGetEnvironmentList({
    queryParams: { accountIdentifier, orgIdentifier, projectIdentifier, page, size: 10 }
  })

  const serviceData = environmentsResponse?.data?.content

  if (isFetchingEnvironments) return <PageSpinner />

  return serviceData?.length ? (
    <Container>
      <ResourceHandlerTable
        data={serviceData as ResourceHandlerTableData[]}
        selectedData={selectedData}
        columns={[
          {
            Header: getString('common.pipeline'),
            id: 'name',
            accessor: 'name' as any,
            Cell: RenderColumnPipeline,
            disableSortBy: true
          }
        ]}
        pagination={{
          itemCount: environmentsResponse?.data?.totalItems || 0,
          pageSize: environmentsResponse?.data?.pageSize || 10,
          pageCount: environmentsResponse?.data?.totalPages ?? 1,
          pageIndex: environmentsResponse?.data?.pageIndex ?? 0,
          gotoPage: pageNumber => setPage(pageNumber)
        }}
        onSelectChange={onSelectChange}
      />
    </Container>
  ) : (
    <Layout.Vertical flex={{ align: 'center-center' }} height="100vh" spacing="small">
      <Icon name="resources-icon" size={20} />
      <Text font="medium" color={Color.BLACK}>
        {getString('noData')}
      </Text>
    </Layout.Vertical>
  )
}

export default EnvironmentResourceModal
