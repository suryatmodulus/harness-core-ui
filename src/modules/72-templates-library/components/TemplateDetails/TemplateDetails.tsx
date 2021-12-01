import React, { useContext } from 'react'
import {
  ButtonVariation,
  Color,
  Container,
  DropDown,
  Icon,
  Layout,
  PageError,
  SelectOption,
  Tab,
  Tabs,
  Text
} from '@wings-software/uicore'
import { useHistory, useParams } from 'react-router-dom'
import { defaultTo, isEmpty } from 'lodash-es'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import { TemplateTags } from '@templates-library/components/TemplateTags/TemplateTags'
import { PageSpinner } from '@common/components'
import {
  getIconForTemplate,
  getTypeForTemplate,
  TemplateListType
} from '@templates-library/pages/TemplatesPage/TemplatesPageUtils'
import { useMutateAsGet } from '@common/hooks'
import { useGetTemplateList, TemplateSummaryResponse } from 'services/template-ng'
import RbacButton from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import GitPopover from '@pipeline/components/GitPopover/GitPopover'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { DefaultNewVersionLabel } from 'framework/Templates/templates'
import { TemplateContext } from '../TemplateStudio/TemplateContext/TemplateContext'
import { TemplateInputs } from '../TemplateInputs/TemplateInputs'
import { TemplateYaml } from '../TemplateYaml/TemplateYaml'
import { TemplateActivityLog } from '../TemplateActivityLog/TemplateActivityLog'
import css from './TemplateDetails.module.scss'

export interface TemplateDetailsProps {
  template: TemplateSummaryResponse
  allowStableSelection?: boolean
  setTemplate?: (template: TemplateSummaryResponse) => void
}

export enum TemplateTabs {
  INPUTS = 'INPUTS',
  YAML = 'YAML',
  REFERENCEDBY = 'REFERENCEDBY'
}

export enum ParentTemplateTabs {
  BASIC = 'BASIC',
  ACTVITYLOG = 'ACTVITYLOG'
}

export const TemplateDetails: React.FC<TemplateDetailsProps> = props => {
  const { template, allowStableSelection = false, setTemplate } = props
  const { getString } = useStrings()
  const history = useHistory()
  const [versionOptions, setVersionOptions] = React.useState<SelectOption[]>([])
  const { isReadonly } = useContext(TemplateContext)
  const { isGitSyncEnabled } = useAppStore()
  const [templates, setTemplates] = React.useState<TemplateSummaryResponse[]>([])
  const [selectedTemplate, setSelectedTemplate] = React.useState<TemplateSummaryResponse>()
  const [selectedParentTab, setSelectedParentTab] = React.useState<ParentTemplateTabs>(ParentTemplateTabs.BASIC)
  const [selectedTab, setSelectedTab] = React.useState<TemplateTabs>(TemplateTabs.YAML)
  const { module } = useParams<ProjectPathProps & ModulePathParams>()

  const {
    data: templateData,
    refetch: reloadTemplates,
    loading,
    error: templatesError
  } = useMutateAsGet(useGetTemplateList, {
    body: {
      filterType: 'Template',
      templateIdentifiers: [template.identifier]
    },
    queryParams: {
      accountIdentifier: template.accountId,
      orgIdentifier: template.orgIdentifier,
      projectIdentifier: template.projectIdentifier,
      templateListType: TemplateListType.All,
      module,
      repoIdentifier: template.gitDetails?.repoIdentifier,
      branch: template.gitDetails?.branch
    },
    queryParamStringifyOptions: { arrayFormat: 'comma' }
  })

  const onChange = React.useCallback(
    (option: SelectOption): void => {
      const version = defaultTo(option.value?.toString(), '')
      setSelectedTemplate(templates.find(item => item.versionLabel === version) || {})
    },
    [templateData?.data?.content]
  )

  React.useEffect(() => {
    if (selectedTemplate) {
      setTemplate?.(selectedTemplate)
    }
  }, [selectedTemplate])

  React.useEffect(() => {
    const newVersionOptions: SelectOption[] = templates.map(item => {
      return {
        label:
          item.versionLabel === DefaultNewVersionLabel
            ? getString('templatesLibrary.alwaysUseStableVersion')
            : item.stableTemplate
            ? getString('templatesLibrary.stableVersion', { entity: item.versionLabel })
            : item.versionLabel,
        value: item.versionLabel
      } as SelectOption
    })
    setVersionOptions(newVersionOptions)
  }, [templates])

  React.useEffect(() => {
    const allVersions = [...(templateData?.data?.content || [])]
    if (allowStableSelection) {
      const stableVersion = { ...allVersions.find(item => item.stableTemplate) }
      if (stableVersion) {
        stableVersion.versionLabel = DefaultNewVersionLabel
        allVersions.unshift(stableVersion)
      }
    }
    setTemplates(allVersions)
    setSelectedTemplate(allVersions.find(item => item.versionLabel === template.versionLabel))
  }, [templateData?.data?.content])

  React.useEffect(() => {
    reloadTemplates()
  }, [template.identifier])

  const goToTemplateStudio = () => {
    if (selectedTemplate) {
      history.push(
        routes.toTemplateStudio({
          projectIdentifier: selectedTemplate.projectIdentifier,
          orgIdentifier: selectedTemplate.orgIdentifier,
          accountId: defaultTo(selectedTemplate.accountId, ''),
          module,
          templateType: selectedTemplate.templateEntityType,
          templateIdentifier: selectedTemplate.identifier,
          versionLabel: selectedTemplate.versionLabel,
          repoIdentifier: selectedTemplate.gitDetails?.repoIdentifier,
          branch: selectedTemplate.gitDetails?.branch
        })
      )
    }
  }

  const handleTabChange = React.useCallback((tab: TemplateTabs) => {
    setSelectedTab(tab)
  }, [])

  const handleParentTabChange = React.useCallback(
    (tab: ParentTemplateTabs) => {
      setSelectedParentTab(tab)
    },
    [setSelectedParentTab]
  )

  return (
    <Container height={'100%'} className={css.container} data-template-id={template.identifier}>
      <Layout.Vertical flex={{ align: 'center-center' }} height={'100%'}>
        {loading && <PageSpinner />}
        {!loading && templatesError && (
          <PageError
            message={defaultTo((templatesError.data as Error)?.message, templatesError.message)}
            onClick={reloadTemplates}
          />
        )}
        {!templatesError && selectedTemplate && (
          <Container height={'100%'} width={'100%'}>
            <Layout.Vertical height={'100%'}>
              <Layout.Horizontal
                flex={{ alignItems: 'center' }}
                spacing={'huge'}
                padding={{ top: 'large', left: 'xxlarge', bottom: 'large', right: 'xxlarge' }}
                border={{ bottom: true }}
              >
                <Layout.Horizontal className={css.shrink} spacing={'small'}>
                  <Text lineClamp={2} font={{ size: 'medium', weight: 'bold' }} color={Color.GREY_800}>
                    {selectedTemplate.name}
                  </Text>
                  {isGitSyncEnabled && (
                    <GitPopover
                      data={defaultTo(selectedTemplate.gitDetails, {})}
                      iconProps={{ margin: { left: 'small', top: 'xsmall' } }}
                    />
                  )}
                </Layout.Horizontal>
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
              <Container background={Color.FORM_BG} className={css.tabsContainer}>
                <Tabs id="template-details-parent" selectedTabId={selectedParentTab} onChange={handleParentTabChange}>
                  <Tab
                    id={ParentTemplateTabs.BASIC}
                    title={getString('details')}
                    panel={
                      <Layout.Vertical height={'100%'}>
                        <Container>
                          <Layout.Vertical
                            className={css.topContainer}
                            spacing={'large'}
                            padding={{ top: 'xlarge', right: 'xxlarge', bottom: 'xlarge', left: 'xxlarge' }}
                          >
                            <Container>
                              <Layout.Vertical spacing={'small'}>
                                <Text font={{ weight: 'semi-bold' }} color={Color.BLACK}>
                                  {getString('typeLabel')}
                                </Text>
                                <Container>
                                  <Layout.Horizontal
                                    spacing={'small'}
                                    flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
                                  >
                                    <Icon name={getIconForTemplate(selectedTemplate, getString)} size={20} />
                                    <Text color={Color.GREY_900}>
                                      {getTypeForTemplate(selectedTemplate, getString)}
                                    </Text>
                                  </Layout.Horizontal>
                                </Container>
                              </Layout.Vertical>
                            </Container>
                            <Container>
                              <Layout.Vertical spacing={'small'}>
                                <Text font={{ weight: 'semi-bold' }} color={Color.BLACK}>
                                  {getString('description')}
                                </Text>
                                <Text color={Color.GREY_900}>{selectedTemplate.description || '-'}</Text>
                              </Layout.Vertical>
                            </Container>
                            <Container>
                              <Layout.Vertical spacing={'small'}>
                                <Text font={{ weight: 'semi-bold' }} color={Color.BLACK}>
                                  {getString('tagsLabel')}
                                </Text>
                                {selectedTemplate.tags && !isEmpty(selectedTemplate.tags) ? (
                                  <Container>
                                    <TemplateTags tags={selectedTemplate.tags} />
                                  </Container>
                                ) : (
                                  <Text color={Color.GREY_900}>-</Text>
                                )}
                              </Layout.Vertical>
                            </Container>
                            <Container>
                              <Layout.Vertical spacing={'small'}>
                                <Text font={{ weight: 'semi-bold' }} color={Color.BLACK}>
                                  {getString('templatesLibrary.createNewModal.versionLabel')}
                                </Text>
                                <DropDown
                                  filterable={false}
                                  items={versionOptions}
                                  value={selectedTemplate.versionLabel}
                                  onChange={onChange}
                                  disabled={isReadonly}
                                  width={300}
                                  popoverClassName={css.dropdown}
                                />
                              </Layout.Vertical>
                            </Container>
                          </Layout.Vertical>
                        </Container>
                        <Container border={{ top: true }} className={css.tabsContainer}>
                          <Tabs id="template-details" selectedTabId={selectedTab} onChange={handleTabChange}>
                            <Tab
                              id={TemplateTabs.INPUTS}
                              title={getString('templatesLibrary.templateInputs')}
                              panel={<TemplateInputs template={selectedTemplate} />}
                            />
                            <Tab
                              id={TemplateTabs.YAML}
                              title={getString('yaml')}
                              panel={<TemplateYaml templateYaml={selectedTemplate.yaml} />}
                            />
                            <Tab
                              id={TemplateTabs.REFERENCEDBY}
                              disabled={true}
                              title={getString('templatesLibrary.referencedBy')}
                            />
                          </Tabs>
                        </Container>
                      </Layout.Vertical>
                    }
                  />
                  <Tab
                    id={ParentTemplateTabs.ACTVITYLOG}
                    title={getString('activityLog')}
                    panel={<TemplateActivityLog template={selectedTemplate} />}
                  />
                </Tabs>
              </Container>
            </Layout.Vertical>
          </Container>
        )}
      </Layout.Vertical>
    </Container>
  )
}
