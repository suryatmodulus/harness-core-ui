import React, { useState } from 'react'
import { Color, Container, Layout, Text, Icon } from '@wings-software/uicore'
import type { CellProps, Renderer } from 'react-table'
import ResourceHandlerTable, {
  ResourceHandlerTableData
} from '@rbac/components/ResourceHandlerTable/ResourceHandlerTable'
import { PageSpinner } from '@common/components'
import type { RbacResourceModalProps } from '@rbac/factories/RbacFactory'
import { useStrings } from 'framework/exports'
import { ServiceResponseDTO, useGetServiceList } from 'services/cd-ng'

const RenderColumnPipeline: Renderer<CellProps<ServiceResponseDTO>> = ({ row }) => {
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

const ServiceResourceModal: React.FC<RbacResourceModalProps> = ({
  searchTerm,
  onSelectChange,
  selectedData,
  resourceScope
}) => {
  const { accountIdentifier, orgIdentifier = '', projectIdentifier = '' } = resourceScope
  const { getString } = useStrings()
  const [page, setPage] = useState(0)

  const { data: servicesResponse, loading: isFetchingServices } = useGetServiceList({
    queryParams: { accountIdentifier, orgIdentifier, projectIdentifier, searchTerm, page, size: 10 }
  })

  const serviceData = servicesResponse?.data?.content?.map(serviceContent => serviceContent.service)

  if (isFetchingServices) return <PageSpinner />

  return serviceData?.length ? (
    <Container>
      <ResourceHandlerTable
        data={serviceData as ResourceHandlerTableData[]}
        selectedData={selectedData}
        columns={[
          {
            Header: getString('service'),
            id: 'name',
            accessor: 'name' as any,
            Cell: RenderColumnPipeline,
            disableSortBy: true
          }
        ]}
        pagination={{
          itemCount: servicesResponse?.data?.totalItems || 0,
          pageSize: servicesResponse?.data?.pageSize || 10,
          pageCount: servicesResponse?.data?.totalPages ?? 1,
          pageIndex: servicesResponse?.data?.pageIndex ?? 0,
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

export default ServiceResourceModal
