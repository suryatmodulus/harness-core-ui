import React, { useEffect, useState } from 'react'
import {
  Button,
  ButtonVariation,
  Color,
  Container,
  DropDown,
  ExpandingSearchInput,
  ExpandingSearchInputHandle,
  GridListToggle,
  Layout,
  SelectOption,
  Text,
  Views,
  PageError
} from '@wings-software/uicore'
import { defaultTo } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { TemplateSummaryResponse, useGetTemplateList } from 'services/template-ng'
import type { TemplateType } from '@templates-library/utils/templatesUtils'
import { useStrings } from 'framework/strings'
import templateIllustration from '@templates-library/pages/TemplatesPage/images/templates-illustration.svg'
import { PageSpinner } from '@common/components'
import { useMutateAsGet } from '@common/hooks'
import { TemplateListType } from '@templates-library/pages/TemplatesPage/TemplatesPageUtils'
import TemplatesView from '@templates-library/pages/TemplatesPage/views/TemplatesView'
import { Scope } from '@common/interfaces/SecretsInterface'
import routes from '@common/RouteDefinitions'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import GitFilters, { GitFilterScope } from '@common/components/GitFilters/GitFilters'
import NoResultsView from '@templates-library/pages/TemplatesPage/views/NoResultsView/NoResultsView'
import { TemplateDetails } from '../TemplateDetails/TemplateDetails'
import css from './TemplateSelector.module.scss'

export interface TemplateSelectorProps {
  templateType: TemplateType
  childTypes: string[]
  onUseTemplate?: (template: TemplateSummaryResponse) => void
  onCopyToPipeline?: (template: TemplateSummaryResponse) => void
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = (props): JSX.Element => {
  const { templateType, childTypes, onUseTemplate, onCopyToPipeline } = props
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateSummaryResponse | undefined>()
  const { getString } = useStrings()
  const [page, setPage] = useState(0)
  const [view, setView] = useState<Views>(Views.GRID)
  const [gitFilter, setGitFilter] = useState<GitFilterScope | null>(null)
  const [searchParam, setSearchParam] = useState('')
  const { projectIdentifier, orgIdentifier, accountId, module } = useParams<ProjectPathProps & ModulePathParams>()
  const { isGitSyncEnabled } = useAppStore()
  const scopeOptions: SelectOption[] = [
    {
      value: Scope.PROJECT,
      label: getString('projectLabel')
    },
    {
      value: Scope.ORG,
      label: getString('orgLabel')
    },
    {
      value: Scope.ACCOUNT,
      label: getString('account')
    }
  ]
  const [selectedScope, setSelectedScope] = useState<SelectOption>(scopeOptions[0])
  const searchRef = React.useRef<ExpandingSearchInputHandle>({} as ExpandingSearchInputHandle)
  const orgId = React.useMemo(() => {
    return selectedScope.value === Scope.PROJECT || selectedScope.value === Scope.ORG ? orgIdentifier : undefined
  }, [selectedScope, orgIdentifier])
  const projectId = React.useMemo(() => {
    return selectedScope.value === Scope.PROJECT ? projectIdentifier : undefined
  }, [selectedScope, projectIdentifier])
  const queryParams = React.useMemo(() => {
    return {
      accountIdentifier: accountId,
      orgIdentifier: orgId,
      projectIdentifier: projectId,
      templateListType: TemplateListType.Stable,
      searchTerm: searchParam,
      page,
      size: 20,
      ...(gitFilter?.repo &&
        gitFilter.branch && {
          repoIdentifier: gitFilter.repo,
          branch: gitFilter.branch
        })
    }
  }, [accountId, orgId, projectId, searchParam, page, gitFilter])

  const reset = React.useCallback((): void => {
    searchRef.current.clear()
    setGitFilter(null)
  }, [searchRef])

  const {
    data: templateData,
    refetch: reloadTemplates,
    loading,
    error
  } = useMutateAsGet(useGetTemplateList, {
    body: {
      filterType: 'Template',
      templateEntityTypes: [templateType],
      childTypes: childTypes
    },
    queryParams,
    queryParamStringifyOptions: { arrayFormat: 'comma' }
  })

  const getTemplateDetails: React.ReactElement = React.useMemo(() => {
    if (selectedTemplate) {
      return (
        <TemplateDetails
          setTemplate={setSelectedTemplate}
          templateIdentifier={selectedTemplate.identifier || ''}
          versionLabel={selectedTemplate.versionLabel}
          accountId={accountId}
          orgIdentifier={orgId}
          projectIdentifier={projectId}
          module={module}
          gitDetails={selectedTemplate.gitDetails}
        />
      )
    } else {
      return <></>
    }
  }, [selectedTemplate, accountId, orgId, projectId, module])

  useEffect(() => {
    setSelectedTemplate(undefined)
    reloadTemplates()
  }, [page, accountId, projectIdentifier, orgIdentifier, module, searchParam, selectedScope])

  return (
    <Container height={'100%'} className={css.container}>
      <Layout.Horizontal height={'100%'}>
        <Container width={762} background={Color.FORM_BG} className={css.selectorContainer}>
          <Layout.Vertical spacing={'xxlarge'} height={'100%'}>
            <Layout.Vertical spacing={'small'} padding={{ left: 'xxlarge', right: 'xxlarge' }}>
              <Breadcrumbs
                links={[
                  {
                    url: routes.toTemplates({ accountId, orgIdentifier, projectIdentifier, module }),
                    label: getString('common.templates')
                  },
                  {
                    url: '/',
                    label: getString('templatesLibrary.templatesLabel', { entity: templateType })
                  }
                ]}
              />
              <Container>
                <Layout.Horizontal spacing={'small'}>
                  <DropDown
                    items={scopeOptions}
                    value={selectedScope.value.toString()}
                    onChange={item => setSelectedScope(item)}
                    filterable={false}
                  />
                  {isGitSyncEnabled && selectedScope.value === Scope.PROJECT && (
                    <GitSyncStoreProvider>
                      <GitFilters
                        onChange={filter => {
                          setGitFilter(filter)
                          setPage(0)
                        }}
                        className={css.gitFilter}
                        defaultValue={defaultTo(gitFilter, undefined)}
                      />
                    </GitSyncStoreProvider>
                  )}
                  <ExpandingSearchInput
                    alwaysExpanded
                    className={css.searchBox}
                    onChange={(text: string) => {
                      setPage(0)
                      setSearchParam(text)
                    }}
                    ref={searchRef}
                    defaultValue={searchParam}
                  />
                </Layout.Horizontal>
              </Container>
            </Layout.Vertical>
            <Container
              height={'100%'}
              style={{ overflow: 'auto', position: 'relative' }}
              padding={{ left: 'xxlarge', right: 'xxlarge' }}
            >
              {loading && <PageSpinner />}
              {!loading && error && (
                <PageError
                  message={defaultTo((error.data as Error)?.message, error.message)}
                  onClick={reloadTemplates}
                />
              )}
              {!templateData?.data?.content?.length && (
                <NoResultsView
                  hasSearchParam={!!searchParam}
                  onReset={reset}
                  text={getString('templatesLibrary.templatesPage.noTemplates', {
                    scope: selectedScope.label.toLowerCase()
                  })}
                  minimal={true}
                />
              )}
              {!!templateData?.data?.content?.length && (
                <Layout.Vertical height={'100%'}>
                  <Container>
                    <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text font={{ size: 'xsmall', weight: 'bold' }} color={Color.GREY_800}>
                        {getString('common.templates').toUpperCase()} ({templateData?.data?.totalElements})
                      </Text>
                      <GridListToggle initialSelectedView={Views.GRID} onViewToggle={setView} />
                    </Layout.Horizontal>
                  </Container>
                  <Container style={{ flexGrow: 1 }}>
                    <TemplatesView
                      data={templateData?.data}
                      gotoPage={setPage}
                      onSelect={setSelectedTemplate}
                      selectedIdentifier={selectedTemplate?.identifier}
                      view={view}
                    />
                  </Container>
                </Layout.Vertical>
              )}
            </Container>
          </Layout.Vertical>
        </Container>
        <Container width={525}>
          {selectedTemplate ? (
            <Layout.Vertical height={'100%'}>
              <Container className={css.detailsContainer}>
                {isGitSyncEnabled ? (
                  <GitSyncStoreProvider>{getTemplateDetails}</GitSyncStoreProvider>
                ) : (
                  getTemplateDetails
                )}
              </Container>
              <Container>
                <Layout.Horizontal
                  padding={'xxlarge'}
                  background={Color.FORM_BG}
                  className={css.btnContainer}
                  spacing={'small'}
                >
                  <Button
                    variation={ButtonVariation.PRIMARY}
                    text={getString('templatesLibrary.useTemplate')}
                    onClick={() => {
                      onUseTemplate?.(selectedTemplate)
                    }}
                  />
                  <Button
                    variation={ButtonVariation.LINK}
                    text={getString('templatesLibrary.copyToPipeline')}
                    onClick={() => {
                      onCopyToPipeline?.(selectedTemplate)
                    }}
                  />
                </Layout.Horizontal>
              </Container>
            </Layout.Vertical>
          ) : (
            <Container padding={{ top: 'xxlarge', right: 'xlarge', bottom: 'xxlarge', left: 'xlarge' }} height={'100%'}>
              <Layout.Vertical
                className={css.empty}
                spacing={'large'}
                height={'100%'}
                flex={{ align: 'center-center' }}
              >
                <img src={templateIllustration} className={css.illustration} />
                <Text className={css.placeholder} color={Color.GREY_700}>
                  {getString('templatesLibrary.selectTemplateToPreview')}
                </Text>
              </Layout.Vertical>
            </Container>
          )}
        </Container>
      </Layout.Horizontal>
    </Container>
  )
}
