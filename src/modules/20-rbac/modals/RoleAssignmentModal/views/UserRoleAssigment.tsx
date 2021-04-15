import React, { useState } from 'react'
import {
  Button,
  Color,
  Formik,
  FormikForm as Form,
  Layout,
  ModalErrorHandlerBinding,
  Text,
  SelectOption,
  FormInput
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { useToaster } from '@common/components'
import { useCreateRoleAssignments, RoleAssignment as RBACRoleAssignment } from 'services/rbac'
import { useStrings } from 'framework/exports'
import { UserSearchDTO, useGetUsers, useSendInvite, CreateInvite, RoleBinding } from 'services/cd-ng'
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

export interface Assignment {
  role: RoleOption
  resourceGroup: SelectOption
}

interface UserRoleAssignmentValues {
  user: string
  assignments: Assignment[]
}

const UserRoleAssignment: React.FC<UserRoleAssignmentData> = props => {
  const { user, roleBindings, onSubmit, isInvite } = props
  const { accountId, orgIdentifier, projectIdentifier } = useParams()
  const { getString } = useStrings()
  const { showSuccess } = useToaster()
  const [modalErrorHandler] = useState<ModalErrorHandlerBinding>()

  const { mutate: createRoleAssignment, loading: saving } = useCreateRoleAssignments({
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier }
  })

  const { mutate: sendInvitation, loading: sending } = useSendInvite({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: orgIdentifier || '',
      projectIdentifier: projectIdentifier
    }
  })

  const { data: userList } = useGetUsers({
    queryParams: { accountIdentifier: accountId }
  })

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
          managed: roleAssignment.managedRole
        },
        resourceGroup: {
          label: roleAssignment.resourceGroupName || '',
          value: roleAssignment.resourceGroupIdentifier || ''
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
      await sendInvitation(dataToSubmit)
      showSuccess(getString('rbac.usersPage.invitationSuccess'))
      onSubmit?.()
    } catch (e) {
      /* istanbul ignore next */
      modalErrorHandler?.showDanger(e.data.message)
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
          {() => {
            return (
              <Form>
                <FormInput.Select
                  name="user"
                  label={getString('rbac.usersPage.forUser')}
                  items={users}
                  selectProps={{ allowCreatingNewItems: true }}
                  disabled={!isInvite}
                />
                <RoleAssignmentForm noRoleAssignmentsText={getString('rbac.usersPage.noDataText')} />
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
