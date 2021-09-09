import React, { useState } from 'react'
import {
  Button,
  Color,
  Formik,
  FormikForm as Form,
  Layout,
  ModalErrorHandlerBinding,
  Text,
  FormInput,
  ModalErrorHandler,
  ButtonVariation
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { useToaster } from '@common/components'
import { useCreateRoleAssignments, RoleAssignment as RBACRoleAssignment } from 'services/rbac'
import { useStrings } from 'framework/strings'
import type { RoleAssignmentMetadataDTO, UserGroupDTO } from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import RoleAssignmentForm from './RoleAssignmentForm'
import type { Assignment } from './UserRoleAssigment'

interface UserGroupRoleAssignmentData {
  userGroup: UserGroupDTO
  roleBindings?: RoleAssignmentMetadataDTO[]
  onSubmit?: () => void
  onSuccess?: () => void
}

export interface UserGroupRoleAssignmentValues {
  name?: string
  assignments: Assignment[]
}

const UserGroupRoleAssignment: React.FC<UserGroupRoleAssignmentData> = props => {
  const { userGroup, roleBindings, onSubmit, onSuccess } = props
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { showSuccess } = useToaster()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding>()

  const { mutate: createRoleAssignment, loading: saving } = useCreateRoleAssignments({
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier }
  })

  const assignments: Assignment[] =
    roleBindings?.map(roleAssignment => {
      return {
        role: {
          label: roleAssignment.roleName,
          value: roleAssignment.roleIdentifier,
          managed: roleAssignment.managedRole,
          assignmentIdentifier: roleAssignment.identifier,
          managedRoleAssignment: roleAssignment.managedRoleAssignment
        },
        resourceGroup: {
          label: roleAssignment.resourceGroupName || '',
          value: roleAssignment.resourceGroupIdentifier || '',
          managedRoleAssignment: roleAssignment.managedRoleAssignment,
          assignmentIdentifier: roleAssignment.identifier
        }
      }
    }) || []

  const handleRoleAssignment = async (values: UserGroupRoleAssignmentValues): Promise<void> => {
    const dataToSubmit: RBACRoleAssignment[] = values.assignments.map(value => {
      return {
        resourceGroupIdentifier: value.resourceGroup.value.toString(),
        roleIdentifier: value.role.value.toString(),
        principal: { identifier: userGroup.identifier, type: 'USER_GROUP' }
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

  return (
    <Layout.Vertical padding="xxxlarge">
      <Layout.Vertical spacing="large">
        <Text color={Color.BLACK} font="medium">
          {getString('rbac.addRole')}
        </Text>
        <Formik<UserGroupRoleAssignmentValues>
          initialValues={{
            name: userGroup.name,
            assignments: assignments
          }}
          formName="userGroupRleAssignmentForm"
          validationSchema={Yup.object().shape({
            assignments: Yup.array().of(
              Yup.object().shape({
                role: Yup.object().nullable().required(),
                resourceGroup: Yup.object().nullable().required()
              })
            )
          })}
          onSubmit={values => {
            modalErrorHandler?.hide()
            handleRoleAssignment(values)
          }}
        >
          {formik => {
            return (
              <Form>
                <ModalErrorHandler bind={setModalErrorHandler} />
                <FormInput.Text name="name" disabled={true} label={getString('common.userGroup')} />
                <RoleAssignmentForm
                  noRoleAssignmentsText={getString('rbac.userGroupPage.noRoleAssignmentsText')}
                  formik={formik}
                  onSuccess={onSuccess}
                />
                <Layout.Horizontal>
                  <Button
                    variation={ButtonVariation.PRIMARY}
                    text={getString('save')}
                    type="submit"
                    disabled={saving}
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

export default UserGroupRoleAssignment
