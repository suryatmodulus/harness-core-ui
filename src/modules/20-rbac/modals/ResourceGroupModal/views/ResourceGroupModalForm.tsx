import React, { useState } from 'react'
import {
  Button,
  Container,
  Formik,
  FormikForm as Form,
  FormInput,
  Layout,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  ButtonVariation
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { NameIdDescriptionTags, useToaster } from '@common/components'
import {
  ResourceGroupDTO,
  useCreateResourceGroup,
  ResourceGroupRequestRequestBody,
  useUpdateResourceGroup
} from 'services/resourcegroups'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { DEFAULT_COLOR } from '@common/constants/Utils'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import css from './ResourceGroupModal.module.scss'
interface ResourceGroupModalData {
  data?: ResourceGroupDTO
  editMode: boolean
  onSubmit?: (resourceGroup: ResourceGroupDTO) => void
  onCancel?: () => void
}

const ResourceGroupForm: React.FC<ResourceGroupModalData> = props => {
  const { onSubmit, data, editMode, onCancel } = props
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { showSuccess } = useToaster()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding>()
  const { mutate: createResourceGroup, loading: saving } = useCreateResourceGroup({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })
  const { mutate: updateResourceGroup, loading: updating } = useUpdateResourceGroup({
    identifier: data?.identifier || '',
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })
  const handleSubmit = async (values: ResourceGroupDTO): Promise<void> => {
    const dataToSubmit: ResourceGroupRequestRequestBody = {
      resourcegroup: values
    }
    try {
      if (!editMode) {
        const created = await createResourceGroup(dataToSubmit)
        if (created) {
          showSuccess(getString('rbac.resourceGroup.createSuccess'))
          onSubmit?.(dataToSubmit.resourcegroup)
        }
      } else {
        const updated = await updateResourceGroup(dataToSubmit)
        if (updated) {
          showSuccess(getString('rbac.resourceGroup.updateSuccess'))
          onSubmit?.(dataToSubmit.resourcegroup)
        }
      }
    } catch (e) {
      /* istanbul ignore next */
      modalErrorHandler?.showDanger(e.data?.message || e.message)
    }
  }
  return (
    <Formik<ResourceGroupDTO>
      initialValues={{
        identifier: '',
        name: '',
        description: '',
        tags: {},
        color: DEFAULT_COLOR,
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier,
        ...(editMode && data)
      }}
      formName="resourceGroupModalForm"
      validationSchema={Yup.object().shape({
        name: NameSchema(),
        identifier: IdentifierSchema(),
        color: Yup.string().trim().required()
      })}
      onSubmit={values => {
        modalErrorHandler?.hide()
        handleSubmit(values)
      }}
    >
      {formikProps => {
        return (
          <Form>
            <Container className={css.modal}>
              <ModalErrorHandler bind={setModalErrorHandler} />
              <NameIdDescriptionTags formikProps={formikProps} identifierProps={{ isIdentifierEditable: !editMode }} />
              <FormInput.ColorPicker label={getString('rbac.resourceGroup.color')} name="color" />
            </Container>
            <Layout.Horizontal spacing="small">
              <Button
                variation={ButtonVariation.PRIMARY}
                text={getString('save')}
                type="submit"
                disabled={saving || updating}
              />
              <Button text={getString('cancel')} variation={ButtonVariation.TERTIARY} onClick={onCancel} />
            </Layout.Horizontal>
          </Form>
        )
      }}
    </Formik>
  )
}

export default ResourceGroupForm
