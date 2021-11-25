import React, { useContext } from 'react'
import {
  ButtonVariation,
  Color,
  Container,
  DropDown,
  Layout,
  PageError,
  SelectOption,
  Tab,
  Tabs,
  Text
} from '@wings-software/uicore'
import { useHistory } from 'react-router-dom'
import { defaultTo, isEmpty } from 'lodash-es'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import { TemplateTags } from '@templates-library/components/TemplateTags/TemplateTags'
import { PageSpinner } from '@common/components'
import { TemplateListType } from '@templates-library/pages/TemplatesPage/TemplatesPageUtils'
import { useMutateAsGet } from '@common/hooks'
import { useGetTemplateList, TemplateSummaryResponse, EntityGitDetails } from 'services/template-ng'
import RbacButton from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { Module } from '@common/interfaces/RouteInterfaces'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import GitPopover from '@pipeline/components/GitPopover/GitPopover'
import { DefaultNewVersionLabel } from 'framework/Templates/templates'
import { TemplateContext } from '../TemplateStudio/TemplateContext/TemplateContext'
import { TemplateInputs } from '../TemplateInputs/TemplateInputs'
import { TemplateYaml } from '../TemplateYaml/TemplateYaml'
import { TemplateActivityLog } from '../TemplateActivityLog/TemplateActivityLog'
import css from './TemplateDetails.module.scss'

export interface TemplateDetailsProps {
  templateIdentifier: string
  versionLabel: string
  allowStableSelection?: boolean
  setTemplate?: (template: TemplateSummaryResponse) => void
  setVersion?: (versionLabel: string) => void
  accountId: string
  orgIdentifier?: string
  projectIdentifier?: string
  module?: Module
  gitDetails?: EntityGitDetails
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
  const {
    templateIdentifier,
    versionLabel = '',
    allowStableSelection = false,
    setTemplate,
    setVersion,
    accountId,
    orgIdentifier,
    projectIdentifier,
    module,
    gitDetails
  } = props
  const { getString } = useStrings()
  const history = useHistory()
  const [versionOptions, setVersionOptions] = React.useState<SelectOption[]>([])
  const { isReadonly } = useContext(TemplateContext)
  const { isGitSyncEnabled } = useAppStore()
  const [selectedTemplate, setSelectedTemplate] = React.useState<TemplateSummaryResponse>()
  const [selectedVersion, setSelectedVersion] = React.useState<string>(versionLabel)
  const [selectedParentTab, setSelectedParentTab] = React.useState<ParentTemplateTabs>(ParentTemplateTabs.BASIC)
  const [selectedTab, setSelectedTab] = React.useState<TemplateTabs>(TemplateTabs.YAML)

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
      templateListType: TemplateListType.All,
      module,
      repoIdentifier: gitDetails?.repoIdentifier,
      branch: gitDetails?.branch
    },
    queryParamStringifyOptions: { arrayFormat: 'comma' }
  })

  const onChange = React.useCallback(
    (option: SelectOption): void => {
      setSelectedVersion(defaultTo(option.value?.toString(), ''))
    },
    [templateData?.data?.content]
  )

  React.useEffect(() => {
    if (selectedTemplate) {
      setTemplate?.(selectedTemplate)
    }
  }, [selectedTemplate])

  React.useEffect(() => {
    if (selectedVersion) {
      if (selectedVersion === DefaultNewVersionLabel) {
        setSelectedTemplate(templateData?.data?.content?.find(item => item.stableTemplate))
      } else {
        setSelectedTemplate(templateData?.data?.content?.find(item => item.versionLabel === selectedVersion))
      }
      setVersion?.(selectedVersion)
    }
  }, [templateData?.data?.content, selectedVersion])

  React.useEffect(() => {
    const newVersionOptions = templateData?.data?.content?.map(item => {
      return {
        label: item.stableTemplate
          ? getString('templatesLibrary.stableVersion', { entity: item.versionLabel })
          : item.versionLabel,
        value: item.versionLabel
      } as SelectOption
    }) || [{ label: '', value: '' } as SelectOption]
    newVersionOptions.sort((a, b) => a.label.localeCompare(b.label))
    if (allowStableSelection) {
      newVersionOptions.unshift({ label: 'Always use the stable version', value: DefaultNewVersionLabel })
    }
    setVersionOptions(newVersionOptions)
  }, [templateData?.data?.content])

  React.useEffect(() => {
    setSelectedVersion(versionLabel)
    reloadTemplates()
  }, [templateIdentifier])

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
    <Container height={'100%'} className={css.container} data-template-id={templateIdentifier}>
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
                            padding={{ top: 'large', right: 'xxlarge', bottom: 'large', left: 'xxlarge' }}
                          >
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
                                  value={selectedVersion}
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
                              panel={
                                <TemplateInputs
                                  selectedTemplate={selectedTemplate}
                                  accountIdentifier={accountId}
                                  orgIdentifier={orgIdentifier}
                                  projectIdentifier={projectIdentifier}
                                />
                              }
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
                    panel={
                      <TemplateActivityLog
                        selectedTemplate={selectedTemplate}
                        accountIdentifier={accountId}
                        orgIdentifier={orgIdentifier}
                        projectIdentifier={projectIdentifier}
                      />
                    }
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
