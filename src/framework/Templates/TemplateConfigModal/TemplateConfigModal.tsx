import React, { Dispatch, useState, SetStateAction, useContext } from 'react'
import * as Yup from 'yup'
import { omit } from 'lodash-es'
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
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import type { EntityGitDetails, NGTemplateInfoConfig } from 'services/template-ng'
import { TemplatePreview } from '@templates-library/components/TemplatePreview/TemplatePreview'
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import { PageSpinner } from '@common/components'
import type { UseSaveSuccessResponse } from '@common/modals/SaveToGitDialog/useSaveToGitDialog'
import GitContextForm, { IGitContextFormProps } from '@common/components/GitContextForm/GitContextForm'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import { IdentifierSchema, IdentifierSchemaWithOutName, NameSchema } from '@common/utils/Validation'
import { DefaultNewTemplateId, DefaultNewVersionLabel } from '../templates'
import css from './TemplateConfigModal.module.scss'

export enum Fields {
  Name = 'name',
  Identifier = 'identifier',
  Description = 'description',
  Tags = 'tags',
  VersionLabel = 'versionLabel',
  Repo = 'repo',
  Branch = 'branch'
}

export interface PromiseExtraArgs {
  isEdit?: boolean
  updatedGitDetails?: EntityGitDetails
}

export interface ModalProps {
  title: string
  disabledFields?: Fields[]
  emptyFields?: Fields[]
  promise: (values: NGTemplateInfoConfig, extraInfo: PromiseExtraArgs) => Promise<void | UseSaveSuccessResponse>
  onSuccess?: (values: NGTemplateInfoConfig) => void
  onFailure?: (error: any) => void
}

export interface NGTemplateInfoConfigWithGitDetails extends NGTemplateInfoConfig {
  repo: string
  branch: string
}
export interface ConfigModalProps {
  initialValues: NGTemplateInfoConfigWithGitDetails
  onClose: () => void
  modalProps: ModalProps
  showGitFields?: boolean
  gitDetails?: IGitContextFormProps
}

interface BasicDetailsInterface extends ConfigModalProps {
  setPreviewValues: Dispatch<SetStateAction<NGTemplateInfoConfigWithGitDetails>>
}

const BasicTemplateDetails = (props: BasicDetailsInterface): JSX.Element => {
  const { initialValues, setPreviewValues, onClose, modalProps, showGitFields, gitDetails } = props
  const { title, disabledFields = [], promise, onSuccess, onFailure } = modalProps
  const { getString } = useStrings()
  const [isEdit, setIsEdit] = React.useState<boolean>()
  const { isGitSyncEnabled } = useAppStore()
  const currentTemplateType = initialValues.type
  const formName = `create${currentTemplateType}Template`
  const [loading, setLoading] = React.useState<boolean>()
  const { isReadonly } = useContext(TemplateContext)

  React.useEffect(() => {
    const edit = initialValues.identifier !== DefaultNewTemplateId
    setIsEdit(edit)
  }, [initialValues])

  const onSubmit = React.useCallback((values: NGTemplateInfoConfigWithGitDetails) => {
    setLoading(true)
    const formGitDetails =
      values.repo && values.repo.trim().length > 0 ? { repoIdentifier: values.repo, branch: values.branch } : undefined
    promise(omit(values, 'repo', 'branch'), { isEdit: false, updatedGitDetails: formGitDetails })
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

  const getSaveButtonText = React.useCallback((): string => {
    if (isEdit) {
      if (isGitSyncEnabled) {
        return getString('continue')
      }
      return getString('save')
    }
    return getString('start')
  }, [isEdit, isGitSyncEnabled, getString])

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
      <Formik<NGTemplateInfoConfigWithGitDetails>
        initialValues={initialValues}
        onSubmit={onSubmit}
        validate={values => setPreviewValues(values)}
        formName={formName}
        enableReinitialize={true}
        validationSchema={Yup.object().shape({
          name: NameSchema({ requiredErrorMsg: getString('templatesLibrary.createNewModal.validation.name') }),
          identifier: IdentifierSchema(),
          versionLabel: IdentifierSchemaWithOutName(getString, {
            requiredErrorMsg: getString('templatesLibrary.createNewModal.validation.versionLabel'),
            regexErrorMsg: getString('common.validation.fieldMustBeAlphanumeric', {
              name: getString('templatesLibrary.createNewModal.versionLabel')
            })
          }),
          ...(isGitSyncEnabled && showGitFields
            ? {
                repo: Yup.string().trim().required(getString('common.git.validation.repoRequired')),
                branch: Yup.string().trim().required(getString('common.git.validation.branchRequired'))
              }
            : {})
        })}
      >
        {(formik: FormikProps<NGTemplateInfoConfigWithGitDetails>) => {
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
                    {isGitSyncEnabled && showGitFields && (
                      <GitSyncStoreProvider>
                        <GitContextForm formikProps={formik} gitDetails={gitDetails} />
                      </GitSyncStoreProvider>
                    )}
                  </Layout.Vertical>
                </Container>
                <Container>
                  <Layout.Horizontal spacing="small" flex={{ alignItems: 'flex-end', justifyContent: 'flex-start' }}>
                    <RbacButton
                      text={getSaveButtonText()}
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

export const TemplateConfigModal = (props: ConfigModalProps): JSX.Element => {
  const { initialValues, modalProps, ...rest } = props
  const { emptyFields = [] } = modalProps
  const [previewValues, setPreviewValues] = useState(props.initialValues)
  const [formInitialValues, setFormInitialValues] = React.useState(initialValues)
  const { isGitSyncEnabled } = useAppStore()

  React.useEffect(() => {
    const newInitialValues = {
      ...initialValues,
      ...(emptyFields.includes(Fields.Name) && { name: '' }),
      ...(emptyFields.includes(Fields.Identifier) && { identifier: DefaultNewTemplateId }),
      ...(emptyFields.includes(Fields.VersionLabel) && { versionLabel: DefaultNewVersionLabel }),
      ...(emptyFields.includes(Fields.Description) && { description: undefined }),
      ...(emptyFields.includes(Fields.Tags) && { tags: undefined }),
      ...(emptyFields.includes(Fields.Repo) && { repo: undefined }),
      ...(emptyFields.includes(Fields.Branch) && { branch: undefined })
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

  const content = (
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
  return isGitSyncEnabled ? <GitSyncStoreProvider>{content}</GitSyncStoreProvider> : content
}
