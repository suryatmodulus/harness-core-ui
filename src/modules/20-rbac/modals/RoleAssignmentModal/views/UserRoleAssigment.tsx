import React, { useEffect, useState } from 'react'
import {
  Button,
  Color,
  Formik,
  FormikForm as Form,
  Layout,
  ModalErrorHandlerBinding,
  Text,
  SelectOption,
  FormInput,
  ModalErrorHandler,
  ButtonVariation,
  MultiSelectOption
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { defaultTo } from 'lodash-es'
import { useToaster } from '@common/components'
import { useCreateRoleAssignments, RoleAssignment as RBACRoleAssignment } from 'services/rbac'
import { useStrings } from 'framework/strings'
import {
  UserMetadataDTO,
  useSendInvite,
  CreateInvite,
  RoleAssignmentMetadataDTO,
  ResponseListInviteOperationResponse,
  useGetUsers
} from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import {
  UserItemRenderer,
  handleInvitationResponse,
  getScopeBasedDefaultAssignment,
  UserTagRenderer
} from '@rbac/utils/utils'
import { getIdentifierFromValue, getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import { useMutateAsGet } from '@common/hooks/useMutateAsGet'
import { Scope } from '@common/interfaces/SecretsInterface'
import UserGroupsInput from '@common/components/UserGroupsInput/UserGroupsInput'
import RoleAssignmentForm, { InviteType } from './RoleAssignmentForm'

interface UserRoleAssignmentData {
  roleBindings?: RoleAssignmentMetadataDTO[]
  user?: UserMetadataDTO
  onSubmit?: () => void
  onSuccess?: () => void
  isInvite?: boolean
}

interface FormData {
  title: string
  handleSubmit: (values: UserRoleAssignmentValues) => Promise<void>
  label: string
  userGroupField?: React.ReactElement
}

export interface RoleOption extends SelectOption {
  managed: boolean
  managedRoleAssignment: boolean
  assignmentIdentifier?: string
}

export interface ResourceGroupOption extends SelectOption {
  managedRoleAssignment: boolean
  assignmentIdentifier?: string
}

export interface Assignment {
  role: RoleOption
  resourceGroup: ResourceGroupOption
}

export interface UserRoleAssignmentValues {
  users: MultiSelectOption[]
  assignments: Assignment[]
  userGroups?: string[]
}

const UserRoleAssignment: React.FC<UserRoleAssignmentData> = props => {
  const { user, roleBindings, onSubmit, isInvite, onSuccess } = props
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const scope = getScopeFromDTO({ accountIdentifier: accountId, orgIdentifier, projectIdentifier })
  const { getString } = useStrings()
  const [query, setQuery] = useState<string>()
  const { showSuccess } = useToaster()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding>()
  const { mutate: createRoleAssignment, loading: saving } = useCreateRoleAssignments({
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier }
  })

  const { mutate: sendInvitation, loading: sending } = useSendInvite({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier
    }
  })

  const { data: userList, refetch: refetchUsers } = useMutateAsGet(useGetUsers, {
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier },
    body: {
      searchTerm: query,
      parentFilter: 'STRICTLY_PARENT_SCOPES'
    },
    debounce: 300,
    lazy: true
  })

  useEffect(() => {
    if (scope !== Scope.ACCOUNT && isInvite) {
      refetchUsers()
    }
  }, [isInvite, scope])

  const users: SelectOption[] = defaultTo(
    userList?.data?.content?.map(response => {
      return {
        label: defaultTo(response.name, response.email),
        value: response.email
      }
    }),
    []
  )

  const assignments: Assignment[] = defaultTo(
    roleBindings?.map(roleAssignment => {
      return {
        role: {
          label: roleAssignment.roleName,
          value: roleAssignment.roleIdentifier,
          managed: roleAssignment.managedRole,
          managedRoleAssignment: roleAssignment.managedRoleAssignment,
          assignmentIdentifier: roleAssignment.identifier
        },
        resourceGroup: {
          label: defaultTo(roleAssignment.resourceGroupName, ''),
          value: defaultTo(roleAssignment.resourceGroupIdentifier, ''),
          managedRoleAssignment: roleAssignment.managedRoleAssignment,
          assignmentIdentifier: roleAssignment.identifier
        }
      }
    }),
    getScopeBasedDefaultAssignment(scope, getString)
  )

  const handleRoleAssignment = async (values: UserRoleAssignmentValues): Promise<void> => {
    const dataToSubmit: RBACRoleAssignment[] = values.assignments.map(value => {
      return {
        resourceGroupIdentifier: value.resourceGroup.value.toString(),
        roleIdentifier: value.role.value.toString(),
        principal: { identifier: defaultTo(user?.uuid, values.users?.[0].value.toString()), type: 'USER' }
      }
    })

    try {
      await createRoleAssignment({ roleAssignments: dataToSubmit })
      showSuccess(getString('rbac.usersPage.roleAssignSuccess'))
      onSubmit?.()
    } catch (err) {
      /* istanbul ignore next */
      modalErrorHandler?.showDanger(defaultTo(err?.data?.message, err?.message))
    }
  }

  const handleInvitation = async (values: UserRoleAssignmentValues): Promise<void> => {
    if (values.assignments.length === 0) {
      modalErrorHandler?.showDanger(getString('rbac.roleAssignment.assignmentValidation'))
      return
    }
    const dataToSubmit: CreateInvite = {
      users: values.users?.map(val => val.value.toString()),
      userGroups: values.userGroups?.map(val => getIdentifierFromValue(val)),
      roleBindings: values.assignments.map(value => {
        return {
          resourceGroupIdentifier: value.resourceGroup.value.toString(),
          roleIdentifier: value.role.value.toString(),
          roleName: value.role.label,
          resourceGroupName: value.resourceGroup.label,
          managedRole: value.role.managed
        }
      }),
      inviteType: InviteType.ADMIN_INITIATED
    }

    try {
      const response = await sendInvitation(dataToSubmit)
      handleInvitationResponse({
        responseType: response.data?.[0] as Pick<ResponseListInviteOperationResponse, 'data'>,
        getString,
        showSuccess,
        modalErrorHandler,
        onSubmit
      })
    } catch (err) {
      /* istanbul ignore next */
      modalErrorHandler?.showDanger(defaultTo(err?.data?.message, err?.message))
    }
  }

  const inviteValues: FormData = {
    title: getString('rbac.usersPage.userForm.title'),
    handleSubmit: handleInvitation,
    label: getString('rbac.usersPage.userForm.userLabel'),
    userGroupField: (
      <UserGroupsInput
        name="userGroups"
        label={getString('rbac.usersPage.userForm.userGroupLabel')}
        onlyCurrentScope={true}
      />
    )
  }
  const addRoleValues: FormData = {
    title: getString('rbac.addRole'),
    handleSubmit: handleRoleAssignment,
    label: getString('rbac.forUser')
  }
  const formValues = isInvite ? inviteValues : addRoleValues

  return (
    <Layout.Vertical padding="xxxlarge">
      <Layout.Vertical spacing="large">
        <Text color={Color.BLACK} font="medium">
          {formValues.title}
        </Text>
        <Formik<UserRoleAssignmentValues>
          initialValues={{
            users: user ? [{ label: defaultTo(user.name, user.email), value: user.email }] : [],
            assignments: assignments
          }}
          formName="userRoleAssignementForm"
          validationSchema={Yup.object().shape({
            users: Yup.array().min(1, getString('rbac.userRequired')).max(15, getString('rbac.userUpperLimit')),
            assignments: Yup.array().of(
              Yup.object().shape({
                role: Yup.object().nullable().required(),
                resourceGroup: Yup.object().nullable().required()
              })
            )
          })}
          onSubmit={values => {
            modalErrorHandler?.hide()
            formValues.handleSubmit(values)
          }}
        >
          {formik => {
            return (
              <Form>
                <ModalErrorHandler bind={setModalErrorHandler} />
                <FormInput.MultiSelect
                  name="users"
                  label={formValues.label}
                  items={users}
                  tagInputProps={{
                    values: users,
                    placeholder: getString('rbac.roleAssignment.userPlaceHolder')
                  }}
                  multiSelectProps={{
                    allowCreatingNewItems: true,
                    onQueryChange: val => {
                      setQuery(val)
                      refetchUsers()
                    },
                    tagRenderer: UserTagRenderer,
                    itemRender: UserItemRenderer
                  }}
                  disabled={!isInvite}
                />
                {formValues.userGroupField}
                <RoleAssignmentForm
                  noRoleAssignmentsText={getString('rbac.usersPage.noDataText')}
                  formik={formik}
                  onSuccess={onSuccess}
                />
                <Layout.Horizontal>
                  <Button
                    variation={ButtonVariation.PRIMARY}
                    text={getString('save')}
                    type="submit"
                    disabled={saving || sending}
                  />
                </Layout.Horizontal>
              </Form>
            )
          }}
        </Formik>
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export default UserRoleAssignment
