import React, { useContext } from 'react'
import {
  ButtonVariation,
  Color,
  Container,
  DropDown,
  Layout,
  SelectOption,
  Tab,
  Tabs,
  Tag,
  Text
} from '@wings-software/uicore'
import { useHistory } from 'react-router-dom'
import { isEmpty } from 'lodash-es'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import { TemplateTags } from '@templates-library/components/TemplateTags/TemplateTags'
import { PageSpinner, useToaster } from '@common/components'
import { TemplateListType } from '@templates-library/pages/TemplatesPage/TemplatesPageUtils'
import { useMutateAsGet } from '@common/hooks'
import { useGetTemplateList, TemplateSummaryResponse } from 'services/template-ng'
import RbacButton from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { Module } from '@common/interfaces/RouteInterfaces'
import { TemplateInputs } from '../TemplateInputs/TemplateInputs'
import { TemplateYaml } from '../TemplateYaml/TemplateYaml'
import { TemplateContext } from '../TemplateStudio/TemplateContext/TemplateContext'
import css from './TemplateDetails.module.scss'

export interface TemplateDetailsProps {
  templateIdentifier: string
  versionLabel?: string
  setTemplate?: (template: TemplateSummaryResponse) => void
  onClose?: () => void
  accountId: string
  orgIdentifier?: string
  projectIdentifier?: string
  module?: Module
}

export const TemplateDetails: React.FC<TemplateDetailsProps> = props => {
  const {
    templateIdentifier,
    versionLabel,
    onClose,
    setTemplate,
    accountId,
    orgIdentifier,
    projectIdentifier,
    module
  } = props
  const { getString } = useStrings()
  const history = useHistory()
  const [versionOptions, setVersionOptions] = React.useState<SelectOption[]>([])
  const { showError } = useToaster()
  const { isReadonly } = useContext(TemplateContext)
  const [selectedTemplate, setSelectedTemplate] = React.useState<TemplateSummaryResponse>()

  const {
    data: templateData,
    refetch: reloadTemplates,
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
      templateListType: TemplateListType.All
    },
    queryParamStringifyOptions: { arrayFormat: 'comma' }
  })

  const onChange = React.useCallback(
    (option: SelectOption): void => {
      const version = option.value?.toString() || ''
      const newSelectedVersion = templateData?.data?.content?.find(item => item.versionLabel === version)
      setSelectedTemplate(newSelectedVersion)
    },
    [templateData?.data?.content]
  )

  React.useEffect(() => {
    if (selectedTemplate) {
      setTemplate?.(selectedTemplate)
    }
  }, [selectedTemplate])

  React.useEffect(() => {
    if (!isEmpty(templateData?.data?.content)) {
      setSelectedTemplate(
        templateData?.data?.content?.find(item => item.versionLabel === versionLabel) ||
          templateData?.data?.content?.[0]
      )
      const newVersionOptions = templateData?.data?.content?.map(item => {
        return {
          label: item.versionLabel,
          value: item.versionLabel
        } as SelectOption
      }) || [{ label: '', value: '' } as SelectOption]
      newVersionOptions.sort((a, b) => a.label.localeCompare(b.label))
      setVersionOptions(newVersionOptions)
    }
  }, [templateData?.data?.content])

  React.useEffect(() => {
    if (templatesError) {
      onClose?.()
      showError(templatesError.message, undefined, 'template.fetch.template.error')
    }
  }, [templatesError])

  React.useEffect(() => {
    reloadTemplates()
  }, [templateIdentifier, versionLabel])

  const goToTemplateStudio = () => {
    if (selectedTemplate) {
      history.push(
        routes.toTemplateStudio({
          projectIdentifier,
          orgIdentifier,
          accountId,
          module,
          templateType: selectedTemplate.templateEntityType,
          templateIdentifier: selectedTemplate.identifier,
          versionLabel: selectedTemplate.versionLabel
        })
      )
    }
  }

  return (
    <Container
      height={'100%'}
      padding={{ top: 'huge', right: 'xxlarge', bottom: 'huge', left: 'xxlarge' }}
      background={Color.FORM_BG}
      className={css.container}
    >
      {loading && <PageSpinner />}
      {selectedTemplate && (
        <Layout.Vertical spacing={'xxxlarge'}>
          <Container>
            <Layout.Horizontal flex={{ alignItems: 'center' }} spacing={'huge'}>
              <Text font={{ size: 'medium', weight: 'bold' }} color={Color.GREY_800}>
                {selectedTemplate.name}
              </Text>
              <RbacButton
                text={getString('templatesLibrary.openInTemplateStudio')}
                variation={ButtonVariation.SECONDARY}
                className={css.openInStudio}
                onClick={goToTemplateStudio}
                permission={{
                  permission: PermissionIdentifier.VIEW_TEMPLATE,
                  resource: {
                    resourceType: ResourceType.TEMPLATE
                  }
                }}
              />
            </Layout.Horizontal>
          </Container>
          <Container>
            <Layout.Vertical spacing={'large'}>
              <Container>
                <Layout.Vertical spacing={'small'}>
                  <Text font={{ size: 'small' }} color={Color.GREY_500}>
                    {getString('version')}
                  </Text>
                  {selectedTemplate.versionLabel && (
                    <DropDown
                      filterable={false}
                      items={versionOptions}
                      value={selectedTemplate.versionLabel}
                      onChange={onChange}
                      disabled={isReadonly}
                      width={300}
                    />
                  )}
                </Layout.Vertical>
              </Container>
              <Container>
                <Layout.Vertical spacing={'small'}>
                  <Text font={{ size: 'small' }} color={Color.GREY_500}>
                    {getString('description')}
                  </Text>
                  <Text className={css.description} color={Color.GREY_700}>
                    {selectedTemplate.description || '-'}
                  </Text>
                </Layout.Vertical>
              </Container>
              <Container>
                <Layout.Vertical spacing={'small'}>
                  <Text font={{ size: 'small' }} color={Color.GREY_500}>
                    {getString('tagsLabel')}
                  </Text>
                  {selectedTemplate.tags && !isEmpty(selectedTemplate.tags) ? (
                    <Container>
                      <TemplateTags tags={selectedTemplate.tags} />
                    </Container>
                  ) : (
                    <Text color={Color.GREY_700}>-</Text>
                  )}
                </Layout.Vertical>
              </Container>
            </Layout.Vertical>
          </Container>
          <div className={css.tabsContainer}>
            <Tabs id="template-details" selectedTabId={'template-yaml'}>
              <Tab
                id="template-input"
                disabled={true}
                title={getString('templatesLibrary.templateInputs')}
                panel={<TemplateInputs />}
              />
              <Tab
                id="template-yaml"
                title={getString('yaml')}
                panel={<TemplateYaml templateYaml={selectedTemplate.yaml} />}
              />
              <Tab
                id="template-referenced-by"
                disabled={true}
                title={
                  <>
                    {getString('templatesLibrary.referencedBy')} &nbsp; <Tag>5</Tag>
                  </>
                }
                panel={<div>Referenced By</div>}
              />
              <Tab
                id="template-version-log"
                disabled={true}
                title={getString('templatesLibrary.versionLog')}
                panel={<div>Version Log</div>}
              />
            </Tabs>
          </div>
        </Layout.Vertical>
      )}
    </Container>
  )
}
