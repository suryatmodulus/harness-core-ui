import { FormInput, MultiSelectOption } from '@wings-software/uicore'
import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useMutateAsGet } from '@common/hooks'
import { StringKeys, useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetUsers, useGetOrganizationAggregateDTOList } from 'services/cd-ng'
import { UserItemRenderer, UserTagRenderer } from '@rbac/utils/utils'
import { actionToLabelMap, moduleToLabelMap } from '../../utils/RequestUtil'

const AuditTrailFilterForm: React.FC = () => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [userQuery, setUserQuery] = useState<string>()
  const [orgQuery, setOrgQuery] = useState<string>()

  const { data: userData } = useMutateAsGet(useGetUsers, {
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier },
    body: {
      searchTerm: userQuery
    },
    debounce: 300
  })

  const { data } = useGetOrganizationAggregateDTOList({
    queryParams: { accountIdentifier: accountId, searchTerm: orgQuery },
    debounce: 300
  })

  const { getString } = useStrings()
  const users =
    userData?.data?.content?.map(user => {
      return {
        label: user.name || user.email,
        value: user.email
      }
    }) || []

  const organizations =
    data?.data?.content?.map(org => {
      return {
        label: org.organizationResponse.organization.name,
        value: org.organizationResponse.organization.identifier
      }
    }) || []

  const getOptionsForMultiSelect = (map: Record<any, StringKeys>): MultiSelectOption[] => {
    return Object.keys(map).map(key => ({
      label: getString(map[key]),
      value: key
    }))
  }

  return (
    <>
      <FormInput.MultiSelect
        name="users"
        key="users"
        items={users}
        label={getString('common.user')}
        multiSelectProps={{
          allowCreatingNewItems: true,
          onQueryChange: setUserQuery,
          tagRenderer: UserTagRenderer,
          itemRender: UserItemRenderer
        }}
      />
      <FormInput.MultiSelect
        name="organizations"
        key="organizations"
        items={organizations}
        label="Org"
        multiSelectProps={{
          onQueryChange: setOrgQuery
        }}
      />
      <FormInput.MultiSelect
        items={getOptionsForMultiSelect(moduleToLabelMap)}
        name="modules"
        label={getString('module')}
        key="modules"
      />
      <FormInput.MultiSelect
        items={getOptionsForMultiSelect(actionToLabelMap)}
        name="actions"
        label={getString('action')}
        key="actions"
      />
    </>
  )
}

export default AuditTrailFilterForm
