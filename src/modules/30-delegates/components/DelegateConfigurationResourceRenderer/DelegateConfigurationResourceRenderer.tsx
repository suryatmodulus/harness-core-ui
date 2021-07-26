import React, { useMemo } from 'react'
import get from 'lodash-es/get'
import { Button } from '@wings-software/uicore'
import type { RbacResourceRendererProps } from '@rbac/factories/RbacFactory'
import { useListDelegateProfilesNg, DelegateProfileDetailsNg } from 'services/cd-ng'
import Table from '@common/components/Table/Table'
import { PageSpinner } from '@common/components'

type CellType = { row: { original: DelegateProfileDetailsNg } }

const DelegateConfigurationResourceRenderer: React.FC<RbacResourceRendererProps> = ({
  identifiers,
  resourceScope,
  resourceType,
  onResourceSelectionChange
}) => {
  const { accountIdentifier, orgIdentifier, projectIdentifier } = resourceScope
  const queryParams = useMemo(
    () => ({
      accountId: accountIdentifier,
      orgId: orgIdentifier,
      projectId: projectIdentifier,
      module
    }),
    [accountIdentifier, orgIdentifier, projectIdentifier]
  )
  const { data, loading } = useListDelegateProfilesNg({ queryParams })

  const configurations: DelegateProfileDetailsNg[] = get(data, 'resource.response', [])

  const filteredConfigurations = configurations.filter(
    config => config.identifier && identifiers.includes(config.identifier)
  )

  return filteredConfigurations && !loading ? (
    <Table
      columns={[
        {
          Header: '',
          id: 'name',
          accessor: 'name',
          width: '95%',
          Cell: (element: CellType) => <div>{element.row.original.name}</div>,
          disableSortBy: true
        },
        {
          id: 'removeBtn',
          width: '5%',
          disableSortBy: true,
          // eslint-disable-next-line react/display-name
          Cell: (element: CellType) => {
            const { identifier } = element.row.original
            return (
              <Button
                icon="trash"
                minimal
                onClick={() => {
                  identifier && onResourceSelectionChange(resourceType, false, [identifier])
                }}
              />
            )
          }
        }
      ]}
      data={filteredConfigurations}
      hideHeaders={true}
    />
  ) : (
    <PageSpinner />
  )
}

export default DelegateConfigurationResourceRenderer
