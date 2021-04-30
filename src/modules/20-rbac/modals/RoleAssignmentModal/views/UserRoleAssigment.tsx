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
import { UserSearchDTO, useGetCurrentGenUsers, useSendInvite, CreateInvite, RoleBinding } from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import RoleAssignmentForm, { InviteType } from './RoleAssignmentForm'

interface UserRoleAssignmentData {
  roleBindings?: RoleBinding[]
  user?: UserSearchDTO
  onSubmit?: () => void
  isInvite?: boolean
}

export interface RoleOption extends SelectOption {
  managed: boolean
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
  const { user, roleBindings, onSubmit, isInvite } = props
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
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
    queryParams: { accountIdentifier: accountId },
    lazy: true
  })

  useEffect(() => {
    if (isInvite) refetchUsers()
  }, [isInvite])

  const users: SelectOption[] =
    userList?.data?.content?.map(response => {
      return {
        label: response.name,
        value: response.email
      }
    }) || []

  const assignments: Assignment[] =
    roleBindings?.map(roleAssignment => {
      return {
        role: {
          label: roleAssignment.roleName,
          value: roleAssignment.roleIdentifier,
          managed: roleAssignment.managedRole,
          assignmentIdentifier: roleAssignment.identifier
        },
        resourceGroup: {
          label: roleAssignment.resourceGroupName || '',
          value: roleAssignment.resourceGroupIdentifier || '',
          assignmentIdentifier: roleAssignment.identifier
        }
      }
    }) || []

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
        if (response.data?.[0] === 'USER_INVITED_SUCCESSFULLY') {
          showSuccess(getString('rbac.usersPage.invitationSuccess'))
          onSubmit?.()
        } else modalErrorHandler?.showDanger(response.data?.[0] || getString('rbac.usersPage.invitationError'))
      } catch (e) {
        /* istanbul ignore next */
        modalErrorHandler?.showDanger(e.data.message)
      }
    } else {
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
            user: user?.email || '',
            assignments: assignments
          }}
          validationSchema={Yup.object().shape({
            user: Yup.string().required(getString('rbac.roleAssignment.userValidation')),
            assignments: Yup.array().of(
              Yup.object().shape({
                role: Yup.object().nullable().required(),
                resourceGroup: Yup.object().nullable().required()
              })
            )
          })}
          onSubmit={values => {
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
                            label: user.name,
                            value: user.email
                          }
                        ]
                      : users
                  }
                  selectProps={{ allowCreatingNewItems: true }}
                  disabled={!isInvite}
                />
                <RoleAssignmentForm noRoleAssignmentsText={getString('rbac.usersPage.noDataText')} formik={formik} />
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
