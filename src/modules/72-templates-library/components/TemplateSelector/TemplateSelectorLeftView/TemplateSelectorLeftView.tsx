import React, { useEffect, useState } from 'react'
import {
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
import type { GitQueryParams, ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { TemplateSummaryResponse, useGetTemplateList } from 'services/template-ng'
import { useStrings } from 'framework/strings'
import { PageSpinner } from '@common/components'
import { useMutateAsGet, useQueryParams } from '@common/hooks'
import { TemplateListType } from '@templates-library/pages/TemplatesPage/TemplatesPageUtils'
import TemplatesView from '@templates-library/pages/TemplatesPage/views/TemplatesView'
import { Scope } from '@common/interfaces/SecretsInterface'
import routes from '@common/RouteDefinitions'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import NoResultsView from '@templates-library/pages/TemplatesPage/views/NoResultsView/NoResultsView'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import css from './TemplateSelectorLeftView.module.scss'

export interface TemplateSelectorLeftViewProps {
  setTemplate: (template?: TemplateSummaryResponse) => void
}

export const TemplateSelectorLeftView: React.FC<TemplateSelectorLeftViewProps> = ({ setTemplate }): JSX.Element => {
  const {
    state: {
      templateView: {
        templateDrawerData: { data }
      }
    }
  } = usePipelineContext()
  const { templateType, childTypes, selectedTemplateRef } = data?.selectorData || {}
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateSummaryResponse | undefined>()
  const { getString } = useStrings()
  const [page, setPage] = useState(0)
  const [view, setView] = useState<Views>(Views.GRID)
  const [searchParam, setSearchParam] = useState('')
  const { projectIdentifier, orgIdentifier, accountId, module } = useParams<ProjectPathProps & ModulePathParams>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
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
  const { orgId, projectId } = React.useMemo(() => {
    switch (selectedScope.value) {
      case Scope.PROJECT:
        return { orgId: orgIdentifier, projectId: projectIdentifier }
      case Scope.ORG:
        return { orgId: orgIdentifier }
      default:
        return {}
    }
  }, [selectedScope, orgIdentifier])
  const queryParams = React.useMemo(() => {
    return {
      accountIdentifier: accountId,
      orgIdentifier: orgId,
      projectIdentifier: projectId,
      templateListType: TemplateListType.Stable,
      searchTerm: searchParam,
      page,
      size: 20,
      ...(isGitSyncEnabled &&
        selectedScope.value === Scope.PROJECT && {
          repoIdentifier: repoIdentifier,
          branch: branch,
          getDefaultFromOtherRepo: true
        })
    }
  }, [accountId, orgId, projectId, searchParam, page, repoIdentifier, branch, selectedScope, isGitSyncEnabled])

  const reset = React.useCallback((): void => {
    searchRef.current.clear()
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

  useEffect(() => {
    setTemplate(selectedTemplate)
  }, [selectedTemplate])

  useEffect(() => {
    setSelectedTemplate(templateData?.data?.content?.find(template => template.identifier === selectedTemplateRef))
  }, [selectedTemplateRef, templateData?.data?.content])

  useEffect(() => {
    setSelectedTemplate(undefined)
    reloadTemplates()
  }, [page, accountId, projectIdentifier, orgIdentifier, module, searchParam, selectedScope])

  return (
    <Container width={762} background={Color.FORM_BG} className={css.container}>
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
            <PageError message={defaultTo((error.data as Error)?.message, error.message)} onClick={reloadTemplates} />
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
  )
}
