import React, { useMemo } from 'react'
import get from 'lodash-es/get'
import type { Column } from 'react-table'
import { Color, Container, Layout, Text, Icon } from '@wings-software/uicore'
import ResourceHandlerTable from '@rbac/components/ResourceHandlerTable/ResourceHandlerTable'
import { useListDelegateProfilesNg } from 'services/cd-ng'
import { PageSpinner } from '@common/components'
import type { RbacResourceModalProps } from '@rbac/factories/RbacFactory'
import { useStrings } from 'framework/strings'
import type { DelegateProfile } from 'services/portal'

type ParsedColumnContent = DelegateProfile & { identifier: string }

const DelegateConfigurationResourceModalBody: React.FC<RbacResourceModalProps> = ({
  searchTerm,
  onSelectChange,
  selectedData,
  resourceScope
}) => {
  const { accountIdentifier, orgIdentifier, projectIdentifier } = resourceScope
  const { getString } = useStrings()
  const queryParams = useMemo(
    () => ({
      searchTerm,
      accountId: accountIdentifier,
      orgId: orgIdentifier,
      projectId: projectIdentifier,
      module
    }),
    [accountIdentifier, searchTerm, orgIdentifier, projectIdentifier]
  )
  const { data, loading } = useListDelegateProfilesNg({ queryParams })

  const profiles: DelegateProfile[] = get(data, 'resource.response', [])

  const delegateDataContent = profiles.map(dataContent => ({
    ...dataContent,
    identifier: dataContent.uuid
  }))

  const columns: Column<ParsedColumnContent>[] = useMemo(
    () => [
      {
        Header: getString('delegate.delegatesConfigurations').toUpperCase(),
        accessor: row => row.name,
        id: 'name',
        width: '95%',
        Cell: ({ row }: { row: { original: DelegateProfile } }) => <div>{row.original.name}</div>
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  if (loading) return <PageSpinner />
  return !loading && delegateDataContent?.length ? (
    <Container>
      <ResourceHandlerTable
        data={delegateDataContent as ParsedColumnContent[]}
        selectedData={selectedData}
        columns={columns}
        onSelectChange={onSelectChange}
      />
    </Container>
  ) : (
    <Layout.Vertical flex={{ align: 'center-center' }} spacing="small">
      <Icon name="resources-icon" size={20} />
      <Text font="medium" color={Color.BLACK}>
        {getString('noData')}
      </Text>
    </Layout.Vertical>
  )
}

export default DelegateConfigurationResourceModalBody
