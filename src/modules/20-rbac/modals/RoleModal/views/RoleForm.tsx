import React, { useState } from 'react'
import {
  Button,
  Color,
  Container,
  Formik,
  FormikForm as Form,
  Layout,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  Text
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { NameIdDescriptionTags, useToaster } from '@common/components'
import { Role, useCreateRole, useUpdateRole } from 'services/rbac'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { NameSchema, IdentifierSchema } from '@common/utils/Validation'
import css from '@rbac/modals/RoleModal/useRoleModal.module.scss'

interface RoleModalData {
  data?: Role
  isEdit?: boolean
  onSubmit?: (role: Role) => void
}

const RoleForm: React.FC<RoleModalData> = props => {
  const { data: roleData, onSubmit, isEdit } = props
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { showSuccess } = useToaster()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding>()
  const { mutate: createRole, loading: saving } = useCreateRole({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const { mutate: editRole, loading: updating } = useUpdateRole({
    identifier: roleData?.identifier || '',
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const handleSubmit = async (values: Role): Promise<void> => {
    try {
      if (isEdit) {
        const updated = await editRole(values)
        /* istanbul ignore else */ if (updated) {
          showSuccess(getString('rbac.roleForm.updateSuccess'))
          onSubmit?.(values)
        }
      } else {
        const created = await createRole(values)
        /* istanbul ignore else */ if (created) {
          showSuccess(getString('rbac.roleForm.createSuccess'))
          onSubmit?.(values)
        }
      }
    } catch (e) {
      /* istanbul ignore next */
      modalErrorHandler?.showDanger(e.data?.message || e.message)
    }
  }
  return (
    <Layout.Vertical padding="xxxlarge">
      <Layout.Vertical spacing="large">
        <Text color={Color.BLACK} font="medium">
          {isEdit ? getString('editRole') : getString('newRole')}
        </Text>
        <Formik
          initialValues={{
            identifier: '',
            name: '',
            description: '',
            tags: {},
            ...roleData
          }}
          formName="roleForm"
          validationSchema={Yup.object().shape({
            name: NameSchema(),
            identifier: IdentifierSchema()
          })}
          onSubmit={values => {
            modalErrorHandler?.hide()
            handleSubmit(values)
          }}
        >
          {formikProps => {
            return (
              <Form>
                <Container className={css.roleForm}>
                  <ModalErrorHandler bind={setModalErrorHandler} />
                  <NameIdDescriptionTags
                    formikProps={formikProps}
                    identifierProps={{ isIdentifierEditable: !isEdit }}
                  />
                </Container>
                <Layout.Horizontal>
                  <Button intent="primary" text={getString('save')} type="submit" disabled={saving || updating} />
                </Layout.Horizontal>
              </Form>
            )
          }}
        </Formik>
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export default RoleForm
