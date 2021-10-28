import React, { useContext } from 'react'
import {
  Container,
  Layout,
  Checkbox,
  ExpandingSearchInput,
  Button,
  ButtonVariation,
  Text,
  Color,
  FormError,
  FormikForm
} from '@wings-software/uicore'
import { defaultTo, get, isEmpty } from 'lodash-es'
import { Formik } from 'formik'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { PageSpinner, useToaster } from '@common/components'
import { TemplateListType } from '@templates-library/pages/TemplatesPage/TemplatesPageUtils'
import { useMutateAsGet } from '@common/hooks'
import {
  TemplateSummaryResponse,
  useDeleteTemplateVersionsOfIdentifier,
  useGetTemplateList
} from 'services/template-ng'
import { TemplatePreview } from '@templates-library/components/TemplatePreview/TemplatePreview'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import useDeleteConfirmationDialog from '@pipeline/pages/utils/DeleteConfirmDialog'
import { TemplateContext } from '../TemplateStudio/TemplateContext/TemplateContext'
import css from './DeleteTemplateModal.module.scss'

export interface DeleteTemplateProps {
  template: TemplateSummaryResponse
  onClose: () => void
  onSuccess: () => void
}
export interface CheckboxOptions {
  label: string
  value: string
  checked: boolean
  visible: boolean
}

export const DeleteTemplateModal = (props: DeleteTemplateProps) => {
  const { getString } = useStrings()
  const { template, onClose, onSuccess } = props
  const [checkboxOptions, setCheckboxOptions] = React.useState<CheckboxOptions[]>([])
  const [query, setQuery] = React.useState<string>('')
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { showSuccess, showError } = useToaster()
  const { isGitSyncEnabled } = useAppStore()
  const { mutate: deleteTemplates, loading: deleteLoading } = useDeleteTemplateVersionsOfIdentifier({})
  const { setLoading } = useContext(TemplateContext)

  const {
    data: templateData,
    loading,
    error: templatesError
  } = useMutateAsGet(useGetTemplateList, {
    body: { filterType: 'Template', templateIdentifiers: [template.identifier] },
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      module,
      templateListType: TemplateListType.All,
      repoIdentifier: defaultTo(template.gitDetails?.repoIdentifier, ''),
      branch: defaultTo(template.gitDetails?.branch, '')
    },
    queryParamStringifyOptions: { arrayFormat: 'comma' }
  })

  const { confirmDelete } = useDeleteConfirmationDialog(
    template,
    'template',
    onSuccess,
    template.identifier,
    setLoading
  )

  React.useEffect(() => {
    if (templatesError) {
      onClose()
      showError(templatesError.message, undefined, 'template.fetch.template.error')
    }
  }, [templatesError])

  const performDelete = async (versions: string[]) => {
    if (isGitSyncEnabled) {
      confirmDelete({ versions })
    } else {
      try {
        await deleteTemplates(defaultTo(template?.identifier, ''), {
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier
          },
          body: JSON.stringify({ templateVersionLabels: versions }),
          headers: { 'content-type': 'application/json' }
        })
        showSuccess(getString('common.template.deleteTemplate.templatesDeleted', { name: template.name }))
        onSuccess?.()
      } catch (error) {
        showError(
          error?.data?.message || error?.message || getString('common.template.deleteTemplate.errorWhileDeleting'),
          undefined,
          'template.delete.template.error'
        )
      }
    }
  }

  React.useEffect(() => {
    if (templateData?.data?.content) {
      setCheckboxOptions(
        templateData?.data?.content?.map(currTemplateData => {
          return {
            label: currTemplateData.stableTemplate
              ? getString('templatesLibrary.stableVersion', { entity: currTemplateData.versionLabel })
              : currTemplateData.versionLabel || '',
            value: currTemplateData.versionLabel || '',
            checked: false,
            visible: true
          }
        })
      )
    }
  }, [templateData?.data?.content])

  React.useEffect(() => {
    if (!isEmpty(checkboxOptions)) {
      setCheckboxOptions(
        checkboxOptions.map(option => {
          return {
            label: option.label,
            value: option.value,
            checked: option.checked,
            visible: option.label.startsWith(query)
          }
        })
      )
    }
  }, [query])

  return (
    <Layout.Vertical>
      {(loading || deleteLoading) && <PageSpinner />}
      {templateData?.data?.content && !isEmpty(templateData?.data?.content) && (
        <Formik<{ checkboxOptions: CheckboxOptions[] }>
          onSubmit={values => {
            const selectedVersions = values.checkboxOptions.filter(item => item.checked).map(item => item.value)
            performDelete(selectedVersions)
          }}
          enableReinitialize={true}
          initialValues={{ checkboxOptions: checkboxOptions }}
        >
          {({ values, errors, setFieldValue }) => {
            const options = values.checkboxOptions
            return (
              <FormikForm>
                <Container>
                  <Layout.Horizontal>
                    <TemplatePreview className={css.preview} previewValues={templateData?.data?.content?.[0]} />
                    <Container className={css.selectVersions} padding={{ left: 'xxlarge', right: 'xxlarge' }}>
                      <Layout.Vertical spacing={'medium'} height={'100%'}>
                        <ExpandingSearchInput
                          alwaysExpanded={true}
                          width={'100%'}
                          defaultValue={query}
                          onChange={setQuery}
                        />
                        <Container>
                          <Layout.Vertical
                            height={'100%'}
                            flex={{ justifyContent: 'space-between', alignItems: 'stretch' }}
                          >
                            <Container height={300} style={{ overflow: 'auto' }}>
                              {options.map((option, index) => {
                                if (!option.visible) {
                                  return null
                                }
                                return (
                                  <Checkbox
                                    key={option.label}
                                    label={option.label}
                                    className={option.checked ? css.selected : ''}
                                    checked={option.checked}
                                    onChange={e => {
                                      const newOptions = [...options]
                                      newOptions[index].checked = e.currentTarget.checked
                                      setFieldValue('checkboxOptions', newOptions)
                                    }}
                                  />
                                )
                              })}
                            </Container>
                            <FormError errorMessage={get(errors, 'versions')} />
                            <Container>
                              <Checkbox
                                label={'Select All'}
                                checked={!options.some(item => !item.checked)}
                                onChange={e => {
                                  setFieldValue(
                                    'checkboxOptions',
                                    options.map(option => {
                                      return {
                                        label: option.label,
                                        value: option.value,
                                        checked: e.currentTarget.checked,
                                        visible: option.label.startsWith(query)
                                      }
                                    })
                                  )
                                }}
                              />
                            </Container>
                          </Layout.Vertical>
                        </Container>
                      </Layout.Vertical>
                    </Container>
                  </Layout.Horizontal>
                </Container>
                <Container
                  padding={{ top: 'medium', right: 'xxlarge', left: 'xxlarge' }}
                  border={{ top: true, color: Color.GREY_100 }}
                >
                  <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'space-between' }}>
                    <Container>
                      <Layout.Horizontal
                        spacing="small"
                        flex={{ alignItems: 'flex-end', justifyContent: 'flex-start' }}
                      >
                        <Button
                          text={isGitSyncEnabled ? getString('continue') : 'Delete Selected'}
                          type="submit"
                          variation={ButtonVariation.PRIMARY}
                          disabled={!options.some(item => item.checked)}
                        />
                        <Button text={getString('cancel')} variation={ButtonVariation.SECONDARY} onClick={onClose} />
                      </Layout.Horizontal>
                    </Container>
                    <Container>
                      <Layout.Horizontal spacing={'small'}>
                        <Text color={Color.GREY_600}>{getString('common.totalSelected')}</Text>
                        <Text background={Color.PRIMARY_7} color={Color.WHITE} className={css.badge}>
                          {options.filter(item => item.checked).length}
                        </Text>
                      </Layout.Horizontal>
                    </Container>
                  </Layout.Horizontal>
                </Container>
              </FormikForm>
            )
          }}
        </Formik>
      )}
    </Layout.Vertical>
  )
}
