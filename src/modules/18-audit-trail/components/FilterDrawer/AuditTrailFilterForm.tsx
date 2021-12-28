import { FormInput, MultiSelectOption } from '@wings-software/uicore'
import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import type { FormikProps } from 'formik'
import { useMutateAsGet } from '@common/hooks'
import { StringKeys, useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetUsers, useGetOrganizationAggregateDTOList, useGetProjectListWithMultiOrgFilter } from 'services/cd-ng'
import { UserItemRenderer, UserTagRenderer } from '@rbac/utils/utils'
import { actionToLabelMap, getResourceTypeForMultiselect, moduleToLabelMap } from '../../utils/RequestUtil'
import type { AuditTrailFormType } from './FilterDrawer'

interface AuditTrailFormProps {
  formikProps?: FormikProps<AuditTrailFormType>
}

const AuditTrailFilterForm: React.FC<AuditTrailFormProps> = props => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [userQuery, setUserQuery] = useState<string>()
  const [orgQuery, setOrgQuery] = useState<string>()
  const [projectsQuery, setProjectsQuery] = useState<string>()

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
    data?.data?.content?.map(org => ({
      label: org.organizationResponse.organization.name,
      value: org.organizationResponse.organization.identifier
    })) || []

  const getOrgs = (): string[] => {
    if (orgIdentifier) {
      return [orgIdentifier]
    }

    return props.formikProps?.values.organizations?.map(org => org.value as string) || []
  }

  const { data: projectData, refetch: refetchProjectList } = useGetProjectListWithMultiOrgFilter({
    queryParams: {
      accountIdentifier: accountId,
      searchTerm: projectsQuery,
      orgIdentifiers: getOrgs(),
      pageSize: 10
    },
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    },
    debounce: 300
  })

  const getOptionsForMultiSelect = (map: Record<any, StringKeys>): MultiSelectOption[] => {
    return Object.keys(map).map(key => ({
      label: getString(map[key]),
      value: key
    }))
  }

  const projects =
    projectData?.data?.content?.map(project => ({
      label: project.project.name,
      value: project.project.identifier,
      orgIdentifier: project.project.orgIdentifier
    })) || []

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
      {!orgIdentifier && (
        <FormInput.MultiSelect
          name="organizations"
          key="organizations"
          items={organizations}
          label="Org"
          multiSelectProps={{
            onQueryChange: setOrgQuery
          }}
          onChange={() => {
            props.formikProps?.setFieldValue('projects', [])
          }}
        />
      )}
      <FormInput.MultiSelect
        name="projects"
        key="projects"
        label={getString('projectLabel')}
        items={projects}
        multiSelectProps={{
          onQueryChange: query => {
            setProjectsQuery(query)
            refetchProjectList()
          }
        }}
      />
      <FormInput.MultiSelect
        items={getOptionsForMultiSelect(moduleToLabelMap)}
        name="modules"
        label={getString('module')}
        key="modules"
      />
      <FormInput.MultiSelect
        items={getResourceTypeForMultiselect()}
        name="resourceType"
        label={getString('common.resourceType')}
        key="resourceType"
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
