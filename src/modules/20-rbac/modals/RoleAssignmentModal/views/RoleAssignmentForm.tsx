import React from 'react'
import { Container, Layout, Text, FieldArray, Select, SelectOption } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { useGetRoleList } from 'services/rbac'
import { useStrings } from 'framework/exports'
import { useGetResourceGroupList } from 'services/cd-ng'
import type { RoleOption } from './UserRoleAssigment'
import css from './RoleAssignmentForm.module.scss'

export enum InviteType {
  ADMIN_INITIATED = 'ADMIN_INITIATED_INVITE',
  USER_INITIATED = 'USER_INITIATED_INVITE'
}

interface RoleAssignmentFormProps {
  noRoleAssignmentsText: string
}

const RoleAssignmentForm: React.FC<RoleAssignmentFormProps> = ({ noRoleAssignmentsText }) => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams()
  const { getString } = useStrings()

  const { data: roleList } = useGetRoleList({
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier }
  })

  const { data: resourceGroupList } = useGetResourceGroupList({
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier }
  })

  const roles: RoleOption[] =
    roleList?.data?.content?.map(response => {
      return {
        label: response.role.name,
        value: response.role.identifier,
        managed: response.harnessManaged || false
      }
    }) || []

  const resourceGroups: SelectOption[] =
    resourceGroupList?.data?.content?.map(response => {
      return {
        label: response.resourceGroup.name,
        value: response.resourceGroup.identifier
      }
    }) || []

  return (
    <Container className={css.roleAssignments}>
      <FieldArray
        label={getString('rbac.usersPage.assignRoles')}
        name="assignments"
        placeholder={noRoleAssignmentsText}
        insertRowAtBeginning={false}
        containerProps={{ className: css.containerProps }}
        fields={[
          {
            name: 'role',
            label: getString('roles'),
            // eslint-disable-next-line react/display-name
            renderer: (value, _index, handleChange, error) => (
              <Layout.Vertical flex={{ alignItems: 'end' }} spacing="xsmall">
                <Select
                  items={roles}
                  value={value}
                  inputProps={{
                    placeholder: getString('rbac.usersPage.validation.role')
                  }}
                  onChange={handleChange}
                />
                {error && (
                  <Text intent="danger" font="xsmall">
                    {getString('rbac.usersPage.selectRole')}
                  </Text>
                )}
              </Layout.Vertical>
            )
          },
          {
            name: 'resourceGroup',
            label: getString('resourceGroups'),
            // eslint-disable-next-line react/display-name
            renderer: (value, _index, handleChange, error) => (
              <Layout.Vertical flex={{ alignItems: 'end' }} spacing="xsmall">
                <Select
                  items={resourceGroups}
                  value={value}
                  inputProps={{
                    placeholder: getString('rbac.usersPage.selectResourceGroup')
                  }}
                  onChange={handleChange}
                />
                {error && (
                  <Text intent="danger" font="xsmall">
                    {getString('rbac.usersPage.validation.resourceGroup')}
                  </Text>
                )}
              </Layout.Vertical>
            )
          }
        ]}
      />
    </Container>
  )
}

export default RoleAssignmentForm
