import React, { useState, useMemo, useRef } from 'react'
import { Container, Layout, Text, FieldArray, SelectOption, Button } from '@wings-software/uicore'
import { Select as BPSelect } from '@blueprintjs/select'
import { Menu } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import type { FormikProps } from 'formik'
import { produce } from 'immer'
import cx from 'classnames'
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

const Select = BPSelect.ofType<SelectOption>()

interface CustromSelectProps {
  handleQueryChange: (query: string) => void
  filteredItems: RoleOption[] | SelectOption[]
  handleChange: (value: any) => void
  value: any
  setDefaultRoleRows?: (value: React.SetStateAction<Set<number>>) => void
  defaultRoleRows?: Set<number>
  index?: number
  managed?: boolean
}

const CustomSelect = (props: CustromSelectProps) => {
  const {
    handleQueryChange,
    filteredItems,
    handleChange,
    setDefaultRoleRows,
    defaultRoleRows,
    index,
    value,
    managed
  } = props
  const { getString } = useStrings()
  let placeholder = setDefaultRoleRows
    ? getString('rbac.usersPage.selectRole')
    : getString('rbac.usersPage.selectResourceGroup')
  if (!filteredItems.length) {
    placeholder = getString('noSearchResultsFoundPeriod')
  }
  return (
    <Select
      onQueryChange={handleQueryChange}
      resetOnClose
      items={filteredItems}
      itemListRenderer={({ items, itemsParentRef, renderItem }) => {
        const renderedItems = items.map(renderItem).filter(item => item !== null)
        return (
          <Menu className={css.menuHeight} ulRef={itemsParentRef}>
            {renderedItems}
          </Menu>
        )
      }}
      itemRenderer={(item, { handleClick }) => (
        <div key={item.label}>
          <Menu.Item
            disabled={(item as RoleOption).disabled}
            text={<Text lineClamp={1}>{item.label}</Text>}
            onClick={(e: React.MouseEvent<HTMLElement, MouseEvent>) => handleClick(e)}
          />
        </div>
      )}
      onItemSelect={onItem => {
        handleChange(onItem)
        if (setDefaultRoleRows) {
          const selectedItem = onItem as RoleOption
          if (selectedItem.managed)
            setDefaultRoleRows(
              produce(defaultRoleRows!, (draft: any) => {
                draft.add(index)
              })
            )
          else
            setDefaultRoleRows(
              produce(defaultRoleRows!, (draft: any) => {
                draft.delete(index)
              })
            )
        }
      }}
      popoverProps={{ minimal: true }}
    >
      <Button
        inline
        minimal
        intent="primary"
        rightIcon="chevron-down"
        className={cx(css.toEnd, css.roleButton)}
        disabled={managed || !!(value as RoleOption).assignmentIdentifier || !filteredItems.length}
      >
        <Text lineClamp={1}>{value.label ? value.label : placeholder}</Text>
      </Button>
    </Select>
  )
}

const RoleAssignmentForm: React.FC<RoleAssignmentFormProps> = ({ noRoleAssignmentsText, formik }) => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const defaultResourceGroup = useRef<SelectOption>()
  const [defaultRoleRows, setDefaultRoleRows] = useState<Set<number>>(new Set())
  const [filteredRoles, setFilteredRoles] = useState<RoleOption[]>([])
  const [filteredGroups, setFilteredGroups] = useState<RoleOption[]>([])

  const { mutate: deleteRoleAssignment } = useDeleteRoleAssignment({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })
  const { data: roleList, loading: rolesLoading } = useGetRoleList({
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier }
  })

  const { data: resourceGroupList, loading: groupsLoading } = useGetResourceGroupList({
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

  React.useEffect(() => {
    if (!rolesLoading && roles) {
      setFilteredRoles(roles)
    }
  }, [rolesLoading, roles])

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

  React.useEffect(() => {
    if (!groupsLoading && resourceGroups) {
      setFilteredGroups(resourceGroups as RoleOption[])
    }
  }, [groupsLoading, resourceGroups])

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

  const handleQueryChange = (
    query: string,
    items: RoleOption[],
    setter: (value: React.SetStateAction<RoleOption[]>) => void
  ) => {
    const copyArray = [...items]
    const filtered = copyArray.filter(el => el.label.toLowerCase().includes(query))
    if (!filtered.length) {
      setter([
        {
          label: getString('noSearchResultsFoundPeriod'),
          value: '',
          disabled: true
        } as RoleOption
      ])
    } else {
      setter(filtered)
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
                <CustomSelect
                  handleQueryChange={query => handleQueryChange(query, roles, setFilteredRoles)}
                  filteredItems={filteredRoles}
                  handleChange={handleChange}
                  setDefaultRoleRows={setDefaultRoleRows}
                  defaultRoleRows={defaultRoleRows}
                  index={_index}
                  value={value}
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
              return (
                <Layout.Vertical flex={{ alignItems: 'end' }} spacing="xsmall">
                  <CustomSelect
                    handleQueryChange={query =>
                      handleQueryChange(query, resourceGroups as RoleOption[], setFilteredGroups)
                    }
                    filteredItems={filteredGroups}
                    handleChange={handleChange}
                    value={value}
                    managed={defaultRoleRows.has(_index)}
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
