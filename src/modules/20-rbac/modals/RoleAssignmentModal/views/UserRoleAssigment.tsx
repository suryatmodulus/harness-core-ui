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
  ModalErrorHandler
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { useToaster } from '@common/components'
import { useCreateRoleAssignments, RoleAssignment as RBACRoleAssignment } from 'services/rbac'
import { useStrings } from 'framework/strings'
import {
  UserMetadataDTO,
  useGetCurrentGenUsers,
  useSendInvite,
  CreateInvite,
  RoleAssignmentMetadataDTO,
  ResponseListInviteOperationResponse
} from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { EmailSchema } from '@common/utils/Validation'
import { UserItemRenderer, handleInvitationResponse } from '@rbac/utils/utils'
import RoleAssignmentForm, { InviteType } from './RoleAssignmentForm'

interface UserRoleAssignmentData {
  roleBindings?: RoleAssignmentMetadataDTO[]
  user?: UserMetadataDTO
  onSubmit?: () => void
  onSuccess?: () => void
  isInvite?: boolean
}

export interface RoleOption extends SelectOption {
  managed: boolean
  managedRoleAssignment: boolean
  assignmentIdentifier?: string
}

export interface ResourceGroupOption extends SelectOption {
  assignmentIdentifier?: string
}

export interface Assignment {
  role: RoleOption
  resourceGroup: ResourceGroupOption
}

export interface UserRoleAssignmentValues {
  user: string
  assignments: Assignment[]
}

const UserRoleAssignment: React.FC<UserRoleAssignmentData> = props => {
  const { user, roleBindings, onSubmit, isInvite, onSuccess } = props
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
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

  const { data: userList, refetch: refetchUsers } = useGetCurrentGenUsers({
    queryParams: { accountIdentifier: accountId, searchString: query },
    debounce: 300,
    lazy: true
  })

  useEffect(() => {
    if (isInvite || query) refetchUsers()
  }, [isInvite, query])

  const users: SelectOption[] =
    userList?.data?.content?.map(response => {
      return {
        label: response.name || response.email,
        value: response.email
      }
    }) || /* istanbul ignore next */ []

  const assignments: Assignment[] =
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
          label: roleAssignment.resourceGroupName || '',
          value: roleAssignment.resourceGroupIdentifier || '',
          assignmentIdentifier: roleAssignment.identifier
        }
      }
    }) || /* istanbul ignore next */ []

  const handleRoleAssignment = async (values: UserRoleAssignmentValues, userInfo: string): Promise<void> => {
    const dataToSubmit: RBACRoleAssignment[] = values.assignments.map(value => {
      return {
        resourceGroupIdentifier: value.resourceGroup.value.toString(),
        roleIdentifier: value.role.value.toString(),
        principal: { identifier: userInfo, type: 'USER' }
      }
    })

    try {
      await createRoleAssignment({ roleAssignments: dataToSubmit })
      showSuccess(getString('rbac.usersPage.roleAssignSuccess'))
      onSubmit?.()
    } catch (e) {
      /* istanbul ignore next */
      modalErrorHandler?.showDanger(e.data.message)
    }
  }

  const handleInvitation = async (values: UserRoleAssignmentValues): Promise<void> => {
    if (values.assignments.length) {
      const dataToSubmit: CreateInvite = {
        users: [values.user],
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
      } catch (e) {
        /* istanbul ignore next */
        modalErrorHandler?.showDanger(e.data?.message || e.message)
      }
    } else {
      /* istanbul ignore next */
      modalErrorHandler?.showDanger(getString('rbac.roleAssignment.assignmentValidation'))
    }
  }

  return (
    <Layout.Vertical padding="xxxlarge">
      <Layout.Vertical spacing="large">
        <Text color={Color.BLACK} font="medium">
          {isInvite ? getString('newUser') : getString('rbac.addRole')}
        </Text>
        <Formik<UserRoleAssignmentValues>
          initialValues={{
            user: user?.email || /* istanbul ignore next */ '',
            assignments: assignments
          }}
          formName="userRoleAssignementForm"
          validationSchema={Yup.object().shape({
            user: EmailSchema(),
            assignments: Yup.array().of(
              Yup.object().shape({
                role: Yup.object().nullable().required(),
                resourceGroup: Yup.object().nullable().required()
              })
            )
          })}
          onSubmit={values => {
            modalErrorHandler?.hide()
            isInvite ? handleInvitation(values) : handleRoleAssignment(values, user?.uuid || values.user)
          }}
        >
          {formik => {
            return (
              <Form>
                <ModalErrorHandler bind={setModalErrorHandler} />
                <FormInput.Select
                  name="user"
                  placeholder={getString('rbac.roleAssignment.userPlaceHolder')}
                  label={getString('rbac.usersPage.forUser')}
                  items={
                    user
                      ? [
                          {
                            label: user.name || user.email,
                            value: user.email
                          }
                        ]
                      : users
                  }
                  selectProps={{
                    allowCreatingNewItems: true,
                    onQueryChange: val => {
                      setQuery(val)
                    },
                    itemRenderer: UserItemRenderer
                  }}
                  disabled={!isInvite}
                />
                <RoleAssignmentForm
                  noRoleAssignmentsText={getString('rbac.usersPage.noDataText')}
                  formik={formik}
                  onSuccess={onSuccess}
                />
                <Layout.Horizontal>
                  <Button intent="primary" text={getString('save')} type="submit" disabled={saving || sending} />
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
