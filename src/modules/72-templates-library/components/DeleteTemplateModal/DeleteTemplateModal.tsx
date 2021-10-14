import React from 'react'
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
import { get, isEmpty } from 'lodash-es'
import { Formik } from 'formik'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { PageSpinner, useToaster } from '@common/components'
import { TemplateListType } from '@templates-library/pages/TemplatesPage/TemplatesPageUtils'
import { useMutateAsGet } from '@common/hooks'
import { useDeleteTemplateVersionsOfIdentifier, useGetTemplateList } from 'services/template-ng'
import { TemplatePreview } from '@templates-library/components/TemplatePreview/TemplatePreview'
import css from './DeleteTemplateModal.module.scss'

export interface DeleteTemplateProps {
  templateIdentifier: string
  onClose: () => void
  onSuccess: () => void
}
export interface CheckboxOptions {
  label: string
  checked: boolean
  disabled: boolean
  visible: boolean
}

export const DeleteTemplateModal = (props: DeleteTemplateProps) => {
  const { getString } = useStrings()
  const { templateIdentifier, onClose, onSuccess } = props
  const [checkboxOptions, setCheckboxOptions] = React.useState<CheckboxOptions[]>([])
  const [query, setQuery] = React.useState<string>('')
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { showSuccess, showError } = useToaster()

  const { mutate: deleteTemplates, loading: deleteLoading } = useDeleteTemplateVersionsOfIdentifier({})

  const {
    data: templateData,
    loading,
    error: templatesError
  } = useMutateAsGet(useGetTemplateList, {
    body: { filterType: 'Template', templateIdentifiers: [templateIdentifier] },
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      module,
      templateListType: TemplateListType.All
    },
    queryParamStringifyOptions: { arrayFormat: 'comma' }
  })

  React.useEffect(() => {
    if (templatesError) {
      onClose()
      showError(templatesError.message, undefined, 'template.fetch.template.error')
    }
  }, [templatesError])

  const performDelete = async (versions: string[]) => {
    try {
      await deleteTemplates(JSON.stringify({ templateVersionLabels: versions }), {
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier
        }
      })
      showSuccess(getString('templatesLibrary.templatesDeleted'))
      onSuccess?.()
    } catch (error) {
      showError(
        error?.message || getString('templatesLibrary.errorWhileDeleting'),
        undefined,
        'template.delete.template.error'
      )
    }
  }

  React.useEffect(() => {
    if (templateData?.data?.content) {
      setCheckboxOptions(
        templateData?.data?.content?.map(template => {
          return {
            label: template.versionLabel || '',
            checked: false,
            disabled: !!template.stableTemplate,
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
            checked: option.checked,
            disabled: option.disabled,
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
            const selectedVersions = values.checkboxOptions.filter(item => item.checked).map(item => item.label)
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
                                    label={option.label + (option.disabled ? ' (Default)' : '')}
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
                                        checked: e.currentTarget.checked,
                                        disabled: option.disabled,
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
                          text={'Delete Selected'}
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
