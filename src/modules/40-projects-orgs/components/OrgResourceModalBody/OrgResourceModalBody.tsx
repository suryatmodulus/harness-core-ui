import React, { useState } from 'react'
import { Color, Container, Layout, Text, Icon } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import type { CellProps, Renderer } from 'react-table'
import ResourceHandlerTable from '@rbac/components/ResourceHandlerTable/ResourceHandlerTable'
import { Organization, useGetOrganizationList } from 'services/cd-ng'
import { PageSpinner } from '@common/components'
import type { RbacResourceModalProps } from '@rbac/factories/RbacFactory'
import { useStrings } from 'framework/exports'

const RenderColumnOrganization: Renderer<CellProps<Organization>> = ({ row }) => {
  const data = row.original
  return (
    <Layout.Vertical padding={{ left: 'small' }}>
      <Text color={Color.BLACK} lineClamp={1}>
        {data.name}
      </Text>
      <Text color={Color.GREY_400} lineClamp={1}>
        {data.description}
      </Text>
    </Layout.Vertical>
  )
}

const OrgResourceModalBody: React.FC<RbacResourceModalProps> = ({ searchTerm, onSelectChange, selectedData }) => {
  const { accountId } = useParams()
  const [page, setPage] = useState(0)
  const { getString } = useStrings()
  const { data, loading } = useGetOrganizationList({
    queryParams: {
      accountIdentifier: accountId,
      searchTerm,
      pageIndex: page,
      pageSize: 5
    },
    debounce: 300
  })
  const organizationData = data?.data?.content?.map(organizationResponse => organizationResponse.organization)

  if (loading) return <PageSpinner />
  return organizationData?.length ? (
    <Container>
      <ResourceHandlerTable
        data={organizationData}
        selectedData={selectedData}
        columns={[
          {
            Header: getString('orgLabel'),
            id: 'name',
            accessor: 'name',
            width: '25%',
            Cell: RenderColumnOrganization,
            disableSortBy: true
          }
        ]}
        pagination={{
          itemCount: data?.data?.totalItems || 0,
          pageSize: data?.data?.pageSize || 10,
          pageCount: data?.data?.totalPages || -1,
          pageIndex: data?.data?.pageIndex || 0,
          gotoPage: pageNumber => setPage(pageNumber)
        }}
        onSelectChange={onSelectChange}
      />
    </Container>
  ) : (
    <Layout.Vertical flex={{ align: 'center-center' }} height="100vh" spacing="small">
      <Icon name="nav-project" size={20} />
      <Text font="medium" color={Color.BLACK}>
        {getString('noData')}
      </Text>
    </Layout.Vertical>
  )
}

export default OrgResourceModalBody
