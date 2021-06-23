import React, { useState, useMemo, useRef } from 'react'
import { Container, Layout, Text, FieldArray, Select, SelectOption } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import type { FormikProps } from 'formik'
import { produce } from 'immer'
import { useDeleteRoleAssignment, useGetRoleList } from 'services/rbac'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetResourceGroupList } from 'services/resourcegroups'
import { errorCheck } from '@common/utils/formikHelpers'
import { useToaster } from '@common/components'
import type { Assignment, RoleOption, UserRoleAssignmentValues } from './UserRoleAssigment'
import type { UserGroupRoleAssignmentValues } from './UserGroupRoleAssignment'
import css from './RoleAssignmentForm.module.scss'

export enum InviteType {
  ADMIN_INITIATED = 'ADMIN_INITIATED_INVITE',
  USER_INITIATED = 'USER_INITIATED_INVITE'
}

interface RoleAssignmentFormProps {
  noRoleAssignmentsText: string
  formik: FormikProps<UserRoleAssignmentValues | UserGroupRoleAssignmentValues>
}

const RoleAssignmentForm: React.FC<RoleAssignmentFormProps> = ({ noRoleAssignmentsText, formik }) => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const defaultResourceGroup = useRef<SelectOption>()
  const [defaultRoleRows, setDefaultRoleRows] = useState<Set<number>>(new Set())

  const { mutate: deleteRoleAssignment } = useDeleteRoleAssignment({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })
  const { data: roleList } = useGetRoleList({
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier }
  })

  const { data: resourceGroupList } = useGetResourceGroupList({
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier }
  })

  const roles: RoleOption[] = useMemo(
    () =>
      roleList?.data?.content?.map(response => {
        return {
          label: response.role.name,
          value: response.role.identifier,
          managed: response.harnessManaged || false,
          managedRoleAssignment: false
        }
      }) || [],
    [roleList]
  )

  const resourceGroups: SelectOption[] = useMemo(
    () =>
      resourceGroupList?.data?.content?.map(response => {
        if (response.harnessManaged)
          defaultResourceGroup.current = {
            label: response.resourceGroup.name || '',
            value: response.resourceGroup.identifier || ''
          }
        return {
          label: response.resourceGroup.name || '',
          value: response.resourceGroup.identifier || ''
        }
      }) || [],
    [resourceGroupList]
  )

  const handleRoleAssignmentDelete = async (identifier: string): Promise<void> => {
    try {
      const deleted = await deleteRoleAssignment(identifier, {
        headers: { 'content-type': 'application/json' }
      })
      if (deleted) showSuccess(getString('rbac.roleAssignment.deleteSuccess'))
      else showError(getString('rbac.roleAssignment.deleteFailure'))
    } catch (err) {
      /* istanbul ignore next */
      showError(err.data?.message || err.message)
    }
  }

  return (
    <Container className={css.roleAssignments}>
      <FieldArray
        label={getString('rbac.usersPage.assignRoles')}
        name="assignments"
        placeholder={noRoleAssignmentsText}
        insertRowAtBeginning={false}
        isDeleteOfRowAllowed={row => !(row as Assignment).role.managedRoleAssignment}
        onDeleteOfRow={(row, rowIndex) => {
          const assignment = (row as Assignment).role.assignmentIdentifier
          if (assignment) handleRoleAssignmentDelete(assignment)
          if (defaultRoleRows.has(rowIndex)) {
            setDefaultRoleRows(
              produce(defaultRoleRows, draft => {
                draft.delete(rowIndex)
              })
            )
          }
        }}
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
                  popoverClassName={css.selectPopover}
                  inputProps={{
                    placeholder: getString('rbac.usersPage.selectRole')
                  }}
                  disabled={(value as RoleOption).assignmentIdentifier ? true : false}
                  onChange={props => {
                    handleChange(props)
                    const selectedItem = props as RoleOption
                    if (selectedItem.managed)
                      setDefaultRoleRows(
                        produce(defaultRoleRows, draft => {
                          draft.add(_index)
                        })
                      )
                    else
                      setDefaultRoleRows(
                        produce(defaultRoleRows, draft => {
                          draft.delete(_index)
                        })
                      )
                  }}
                />
                {errorCheck('assignments', formik) && error ? (
                  <Text intent="danger" font="xsmall">
                    {getString('rbac.usersPage.validation.role')}
                  </Text>
                ) : null}
              </Layout.Vertical>
            )
          },
          {
            name: 'resourceGroup',
            label: getString('resourceGroups'),
            defaultValue: defaultResourceGroup.current,
            // eslint-disable-next-line react/display-name
            renderer: (value, _index, handleChange, error) => {
              const managed = defaultRoleRows.has(_index)
              return (
                <Layout.Vertical flex={{ alignItems: 'end' }} spacing="xsmall">
                  <Select
                    items={resourceGroups}
                    value={value}
                    popoverClassName={css.selectPopover}
                    disabled={managed || (value as RoleOption).assignmentIdentifier ? true : false}
                    inputProps={{
                      placeholder: getString('rbac.usersPage.selectResourceGroup')
                    }}
                    onChange={handleChange}
                  />
                  {errorCheck('assignments', formik) && error ? (
                    <Text intent="danger" font="xsmall">
                      {getString('rbac.usersPage.validation.resourceGroup')}
                    </Text>
                  ) : null}
                </Layout.Vertical>
              )
            }
          }
        ]}
      />
    </Container>
  )
}

export default RoleAssignmentForm
