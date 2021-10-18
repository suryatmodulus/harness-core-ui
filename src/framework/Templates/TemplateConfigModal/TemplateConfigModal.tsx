import React, { Dispatch, useState, SetStateAction, useContext } from 'react'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'
import {
  Formik,
  Layout,
  FormikForm,
  FormInput,
  Text,
  Color,
  Button,
  ButtonVariation,
  Container
} from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { NameIdDescriptionTags } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import type { NGTemplateInfoConfig, ResponseTemplateWrapperResponse } from 'services/template-ng'
import { TemplatePreview } from '@templates-library/components/TemplatePreview/TemplatePreview'
import { PageSpinner } from '@common/components'
import type { UseSaveSuccessResponse } from '@common/modals/SaveToGitDialog/useSaveToGitDialog'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import { DefaultNewTemplateId, DefaultNewVersionLabel } from '../templates'
import css from './TemplateConfigModal.module.scss'

export enum Fields {
  Name = 'name',
  Identifier = 'identifier',
  Description = 'description',
  Tags = 'tags',
  VersionLabel = 'versionLabel'
}

export interface ModalProps {
  title: string
  disabledFields?: Fields[]
  emptyFields?: Fields[]
  promise: (values: NGTemplateInfoConfig) => Promise<ResponseTemplateWrapperResponse | UseSaveSuccessResponse>
  onSuccess?: (values: NGTemplateInfoConfig) => void
  onFailure?: (error: any) => void
}

export interface ConfigModalProps {
  initialValues: NGTemplateInfoConfig
  onClose: () => void
  modalProps: ModalProps
}

interface BasicDetailsInterface extends ConfigModalProps {
  setPreviewValues: Dispatch<SetStateAction<NGTemplateInfoConfig>>
}

const BasicTemplateDetails = (props: BasicDetailsInterface) => {
  const { initialValues, setPreviewValues, onClose, modalProps } = props
  const { title, disabledFields = [], promise, onSuccess, onFailure } = modalProps
  const { getString } = useStrings()
  const [isEdit, setIsEdit] = React.useState<boolean>()
  const currentTemplateType = initialValues.type
  const formName = `create${currentTemplateType}Template`
  const [loading, setLoading] = React.useState<boolean>()
  const { isReadonly } = useContext(TemplateContext)

  React.useEffect(() => {
    const edit = initialValues.identifier !== DefaultNewTemplateId
    setIsEdit(edit)
  }, [initialValues])

  const onSubmit = React.useCallback((values: NGTemplateInfoConfig) => {
    setLoading(true)
    promise(values)
      .then(response => {
        setLoading(false)
        if (response && response.status === 'SUCCESS') {
          onSuccess?.(values)
        } else {
          throw response
        }
      })
      .catch(error => {
        setLoading(false)
        onFailure?.(error)
      })
  }, [])

  return (
    <Container width={'55%'} className={css.basicDetails} background={Color.FORM_BG} padding={'huge'}>
      {loading && <PageSpinner />}
      <Text
        color={Color.GREY_800}
        font={{ weight: 'bold', size: 'medium' }}
        margin={{ bottom: 'xlarge', left: 0, right: 0 }}
      >
        {title || ''}
      </Text>
      <Formik<NGTemplateInfoConfig>
        initialValues={initialValues}
        onSubmit={onSubmit}
        validate={values => setPreviewValues(values)}
        formName={formName}
        enableReinitialize={true}
        validationSchema={Yup.object().shape({
          name: Yup.string().required(getString('templatesLibrary.createNewModal.validation.name')),
          versionLabel: Yup.string().required(getString('templatesLibrary.createNewModal.validation.versionLabel'))
        })}
      >
        {(formik: FormikProps<NGTemplateInfoConfig>) => {
          return (
            <FormikForm>
              <Layout.Vertical spacing={'huge'}>
                <Container>
                  <Layout.Vertical>
                    <NameIdDescriptionTags
                      tooltipProps={{ dataTooltipId: formName }}
                      inputGroupProps={{
                        disabled: !!disabledFields?.includes(Fields.Name)
                      }}
                      formikProps={formik}
                      identifierProps={{
                        isIdentifierEditable: !disabledFields?.includes(Fields.Identifier),
                        inputGroupProps: { disabled: isReadonly }
                      }}
                      className={css.nameIdDescriptionTags}
                    />
                    <FormInput.Text
                      name="versionLabel"
                      placeholder={getString('templatesLibrary.createNewModal.versionPlaceholder')}
                      label={getString('templatesLibrary.createNewModal.versionLabel')}
                      disabled={!!disabledFields?.includes(Fields.VersionLabel) || isReadonly}
                    />
                  </Layout.Vertical>
                </Container>
                <Container>
                  <Layout.Horizontal spacing="small" flex={{ alignItems: 'flex-end', justifyContent: 'flex-start' }}>
                    <RbacButton
                      text={isEdit ? getString('save') : getString('start')}
                      type="submit"
                      variation={ButtonVariation.PRIMARY}
                      permission={{
                        permission: PermissionIdentifier.EDIT_TEMPLATE,
                        resource: {
                          resourceType: ResourceType.TEMPLATE
                        }
                      }}
                    />
                    <Button text={getString('cancel')} variation={ButtonVariation.SECONDARY} onClick={onClose} />
                  </Layout.Horizontal>
                </Container>
              </Layout.Vertical>
            </FormikForm>
          )
        }}
      </Formik>
    </Container>
  )
}

export const TemplateConfigModal = (props: ConfigModalProps) => {
  const { initialValues, modalProps, ...rest } = props
  const { emptyFields = [] } = modalProps
  const [previewValues, setPreviewValues] = useState<NGTemplateInfoConfig>(props.initialValues)
  const [formInitialValues, setFormInitialValues] = React.useState<NGTemplateInfoConfig>(initialValues)

  React.useEffect(() => {
    const newInitialValues = {
      ...initialValues,
      ...(emptyFields.includes(Fields.Name) && { name: '' }),
      ...(emptyFields.includes(Fields.Identifier) && { identifier: DefaultNewTemplateId }),
      ...(emptyFields.includes(Fields.VersionLabel) && { versionLabel: DefaultNewVersionLabel }),
      ...(emptyFields.includes(Fields.Description) && { description: undefined }),
      ...(emptyFields.includes(Fields.Tags) && { tags: undefined })
    }
    if (newInitialValues.identifier === DefaultNewTemplateId) {
      newInitialValues.identifier = ''
    }
    if (newInitialValues.versionLabel === DefaultNewVersionLabel) {
      newInitialValues.versionLabel = ''
    }
    setFormInitialValues(newInitialValues)
  }, [initialValues, JSON.stringify(emptyFields)])

  React.useEffect(() => {
    setPreviewValues(formInitialValues)
  }, [formInitialValues])

  return (
    <Layout.Horizontal>
      <BasicTemplateDetails
        initialValues={formInitialValues}
        modalProps={modalProps}
        setPreviewValues={setPreviewValues}
        {...rest}
      />
      <TemplatePreview previewValues={previewValues} />
      <Button
        className={css.closeIcon}
        iconProps={{ size: 24, color: Color.GREY_500 }}
        icon="cross"
        variation={ButtonVariation.ICON}
        onClick={props.onClose}
      />
    </Layout.Horizontal>
  )
}
