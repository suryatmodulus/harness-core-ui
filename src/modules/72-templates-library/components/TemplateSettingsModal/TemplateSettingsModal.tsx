import React, { Dispatch, useState, SetStateAction } from 'react'
import * as Yup from 'yup'
import {
  Formik,
  Layout,
  FormikForm,
  FormInput,
  Text,
  Color,
  Button,
  ButtonVariation,
  SelectOption,
  Container
} from '@wings-software/uicore'
import { isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { NameId } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { PageSpinner, useToaster } from '@common/components'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import { TemplatePreview } from '@templates-library/components/TemplatePreview/TemplatePreview'
import { TemplateListType } from '@templates-library/pages/TemplatesPage/TemplatesPageUtils'
import {
  useGetTemplateList,
  useUpdateTemplateSettings,
  TemplateSummaryResponse,
  UpdateTemplateSettingsQueryParams
} from 'services/template-ng'
import { useMutateAsGet } from '@common/hooks'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import RbacButton from '@rbac/components/Button/Button'
import css from './TemplateSettingsModal.module.scss'

export interface TemplateSettingsModalProps {
  templateIdentifier: string
  onClose: () => void
  onSuccess?: () => void
}

interface BasicDetailsInterface extends TemplateSettingsModalProps {
  setPreviewValues: Dispatch<SetStateAction<TemplateSummaryResponse | undefined>>
  templates?: TemplateSummaryResponse[]
  accountId: string
  orgIdentifier: string
  projectIdentifier: string
  onUpdateSetting: (
    updateScope: UpdateTemplateSettingsQueryParams['updateScope'],
    updateStableTemplateVersion: string
  ) => void
}

const BasicTemplateDetails = (props: BasicDetailsInterface) => {
  const { templates, setPreviewValues, onClose, onUpdateSetting } = props
  const { getString } = useStrings()
  const [versionOptions, setVersionOptions] = React.useState<SelectOption[]>([])
  const [selectedVersion, setSelectedVersion] = React.useState<string>()
  const [selectedScope, setSelectedScope] = React.useState<UpdateTemplateSettingsQueryParams['updateScope']>()

  const scopeOptions: SelectOption[] = [
    {
      label: 'Project',
      value: 'project'
    },
    {
      label: 'Organization',
      value: 'org'
    },
    {
      label: 'Account',
      value: 'account'
    }
  ]

  React.useEffect(() => {
    if (templates && !isEmpty(templates)) {
      const newAllVersions = templates.map((item: TemplateSummaryResponse) => {
        return {
          label: item.versionLabel || '',
          value: item.versionLabel || ''
        }
      })
      setVersionOptions(newAllVersions)
      const scope: UpdateTemplateSettingsQueryParams['updateScope'] = getScopeFromDTO(templates[0])
      setSelectedScope(scope)
      const selectedVersionLabel = templates?.find(item => item.stableTemplate)?.versionLabel
      if (selectedVersionLabel) {
        setSelectedVersion(selectedVersionLabel)
      }
    }
  }, [templates])

  return (
    <Container width={'55%'} className={css.basicDetails} background={Color.FORM_BG} padding={'huge'}>
      <Text
        color={Color.GREY_800}
        font={{ weight: 'bold', size: 'medium' }}
        margin={{ bottom: 'xlarge', left: 0, right: 0 }}
      >
        {getString('templatesLibrary.templateSettings')}
      </Text>
      <Formik<
        TemplateSummaryResponse & { scope?: UpdateTemplateSettingsQueryParams['updateScope']; defaultVersion?: string }
      >
        initialValues={{ ...templates?.[0], scope: selectedScope, defaultVersion: selectedVersion }}
        onSubmit={values => {
          onUpdateSetting(values.scope, values.defaultVersion || '')
        }}
        validate={values => {
          const previewTemplate = templates?.find(item => item.versionLabel === values.defaultVersion)
          previewTemplate && setPreviewValues(previewTemplate)
        }}
        formName={`create${templates?.[0]?.templateEntityType || ''}Template`}
        enableReinitialize={true}
        validationSchema={Yup.object().shape({
          name: Yup.string().required(getString('templatesLibrary.createNewModal.validation.name'))
        })}
      >
        <FormikForm>
          <Layout.Vertical spacing={'huge'}>
            <Container>
              <Layout.Vertical>
                <NameId
                  identifierProps={{
                    isIdentifierEditable: false
                  }}
                  inputGroupProps={{ disabled: true }}
                />
                <FormInput.Select
                  name={'scope'}
                  items={scopeOptions}
                  label={getString('templatesLibrary.templateSettingsModal.scopeLabel')}
                />
                <FormInput.Select
                  name={'defaultVersion'}
                  items={versionOptions}
                  label={getString('templatesLibrary.templateSettingsModal.defaultVersionLabel')}
                />
              </Layout.Vertical>
            </Container>
            <Container>
              <Layout.Horizontal spacing="small" flex={{ alignItems: 'flex-end', justifyContent: 'flex-start' }}>
                <RbacButton
                  text={getString('save')}
                  variation={ButtonVariation.PRIMARY}
                  type="submit"
                  permission={{
                    permission: PermissionIdentifier.EDIT_TEMPLATE,
                    resource: {
                      resourceType: ResourceType.TEMPLATE
                    },
                    resourceScope: {
                      accountIdentifier: props.accountId,
                      orgIdentifier: props.orgIdentifier,
                      projectIdentifier: props.projectIdentifier
                    }
                  }}
                />
                <Button text={getString('cancel')} variation={ButtonVariation.SECONDARY} onClick={onClose} />
              </Layout.Horizontal>
            </Container>
          </Layout.Vertical>
        </FormikForm>
      </Formik>
    </Container>
  )
}

export const TemplateSettingsModal = (props: TemplateSettingsModalProps) => {
  const { templateIdentifier, onSuccess, onClose } = props
  const [previewValues, setPreviewValues] = useState<TemplateSummaryResponse>()
  const params = useParams<ProjectPathProps>()
  const { accountId, orgIdentifier, projectIdentifier } = params
  const { showSuccess, showError } = useToaster()
  const { getString } = useStrings()

  const {
    data: templateData,
    loading,
    error: templatesError
  } = useMutateAsGet(useGetTemplateList, {
    body: {
      filterType: 'Template',
      templateIdentifiers: [templateIdentifier]
    },
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      module,
      templateListType: TemplateListType.All
    },
    queryParamStringifyOptions: { arrayFormat: 'comma' }
  })

  const { mutate: updateTemplateSettings, loading: deleteLoading } = useUpdateTemplateSettings({
    templateIdentifier: templateIdentifier
  })

  React.useEffect(() => {
    setPreviewValues(templateData?.data?.content?.find(item => item.stableTemplate) || templateData?.data?.content?.[0])
  }, [templateData?.data?.content])

  React.useEffect(() => {
    if (templatesError) {
      onClose()
      showError(templatesError.message, undefined, 'template.fetch.template.error')
    }
  }, [templatesError])

  const updateSettings = async (
    updateScope: UpdateTemplateSettingsQueryParams['updateScope'],
    updateStableTemplateVersion: string
  ) => {
    try {
      await updateTemplateSettings({} as unknown as void, {
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier,
          currentScope: getScopeFromDTO(params),
          updateScope,
          updateStableTemplateVersion
        }
      })
      showSuccess(getString('templatesLibrary.templateUpdated'))
      onSuccess?.()
    } catch (error) {
      showError(
        error?.message || getString('templatesLibrary.errorWhileUpdating'),
        undefined,
        'template.save.template.error'
      )
    }
  }

  return (
    <Layout.Horizontal style={{ flexGrow: 1 }}>
      {(loading || deleteLoading) && <PageSpinner />}
      <BasicTemplateDetails
        {...props}
        onUpdateSetting={updateSettings}
        templates={templateData?.data?.content}
        setPreviewValues={setPreviewValues}
        accountId={accountId}
        orgIdentifier={orgIdentifier}
        projectIdentifier={projectIdentifier}
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
