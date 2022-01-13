import React, { useState } from 'react'
import {
  Container,
  DropDown,
  ExpandingSearchInput,
  ExpandingSearchInputHandle,
  GridListToggle,
  HarnessDocTooltip,
  Layout,
  useModalHook,
  Views
} from '@wings-software/uicore'
import { useHistory, useParams } from 'react-router-dom'
import { Dialog } from '@blueprintjs/core'
import { TemplateSettingsModal } from '@templates-library/components/TemplateSettingsModal/TemplateSettingsModal'
import { Page } from '@common/exports'
import { useStrings } from 'framework/strings'
import { Sort, SortFields, TemplateListType } from '@templates-library/pages/TemplatesPage/TemplatesPageUtils'
import { TemplateDetailsDrawer } from '@templates-library/components/TemplateDetailDrawer/TemplateDetailDrawer'
import {
  Failure,
  Error,
  PageTemplateSummaryResponse,
  TemplateSummaryResponse,
  useGetTemplateList
} from 'services/template-ng'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { NewTemplatePopover } from '@templates-library/pages/TemplatesPage/views/NewTemplatePopover'
import { DeleteTemplateModal } from '@templates-library/components/DeleteTemplateModal/DeleteTemplateModal'
import routes from '@common/RouteDefinitions'
import { useMutateAsGet } from '@common/hooks'
import NoResultsView from '@templates-library/pages/TemplatesPage/views/NoResultsView/NoResultsView'
import TemplatesView from '@templates-library/pages/TemplatesPage/views/TemplatesView'
import ResultsViewHeader from '@templates-library/pages/TemplatesPage/views/TemplatesListView/ResultsViewHeader/ResultsViewHeader'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import GitFilters, { GitFilterScope } from '@common/components/GitFilters/GitFilters'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import { getAllowedTemplateTypes, TemplateType } from '@templates-library/utils/templatesUtils'
import { getLinkForAccountResources } from '@common/utils/BreadcrumbUtils'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import css from './TemplatesPage.module.scss'

export default function TemplatesPage(): React.ReactElement {
  const { getString } = useStrings()
  const history = useHistory()
  const [page, setPage] = useState(0)
  const [view, setView] = useState<Views>(Views.GRID)
  const [sort, setSort] = useState<string[]>([SortFields.LastUpdatedAt, Sort.DESC])
  const [type, setType] = useState<keyof typeof TemplateType | null>(null)
  const [searchParam, setSearchParam] = useState('')
  const [templateToDelete, setTemplateToDelete] = React.useState<TemplateSummaryResponse>({})
  const [templateList, setTemplateListList] = useState<PageTemplateSummaryResponse>()
  const [localError, setLocalError] = useState<Error | Failure | null>(null)
  const [templateIdentifierToSettings, setTemplateIdentifierToSettings] = React.useState<string>()
  const [selectedTemplate, setSelectedTemplate] = React.useState<TemplateSummaryResponse | undefined>()
  const [gitFilter, setGitFilter] = useState<GitFilterScope | null>(null)
  const searchRef = React.useRef<ExpandingSearchInputHandle>({} as ExpandingSearchInputHandle)
  const { projectIdentifier, orgIdentifier, accountId, module } = useParams<ProjectPathProps & ModulePathParams>()
  const { isGitSyncEnabled } = useAppStore()
  const scope = getScopeFromDTO({ projectIdentifier, orgIdentifier, accountIdentifier: accountId })
  const allowedTemplateTypes = getAllowedTemplateTypes(getString).filter(item => !item.disabled)

  useDocumentTitle([getString('common.templates')])

  const {
    data: templateData,
    refetch: reloadTemplates,
    loading,
    error
  } = useMutateAsGet(useGetTemplateList, {
    body: {
      filterType: 'Template',
      ...(type && { templateEntityTypes: [type] })
    },
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      templateListType: TemplateListType.LastUpdated,
      searchTerm: searchParam,
      page,
      sort,
      size: 20,
      ...(gitFilter?.repo &&
        gitFilter.branch && {
          repoIdentifier: gitFilter.repo,
          branch: gitFilter.branch
        })
    },
    queryParamStringifyOptions: { arrayFormat: 'comma' }
  })

  React.useEffect(() => {
    setTemplateListList(templateData?.data)
    setLocalError(null)
  }, [templateData])

  React.useEffect(() => {
    setLocalError(error as Error)
  }, [error])

  const reset = React.useCallback((): void => {
    searchRef.current.clear()
    setType(null)
    setGitFilter(null)
  }, [searchRef.current, setType, setGitFilter])

  const [showDeleteTemplatesModal, hideDeleteTemplatesModal] = useModalHook(() => {
    const content = (
      <DeleteTemplateModal
        template={templateToDelete}
        onClose={hideDeleteTemplatesModal}
        onSuccess={() => {
          hideDeleteTemplatesModal()
          reloadTemplates()
        }}
      />
    )
    return (
      <Dialog enforceFocus={false} isOpen={true} className={css.deleteTemplateDialog}>
        {isGitSyncEnabled ? <GitSyncStoreProvider>{content}</GitSyncStoreProvider> : content}
      </Dialog>
    )
  }, [templateToDelete, reloadTemplates, isGitSyncEnabled])

  const [showTemplateSettingsModal, hideTemplateSettingsModal] = useModalHook(
    () => (
      <Dialog enforceFocus={false} isOpen={true} className={css.updateTemplateSettingsDialog}>
        <TemplateSettingsModal
          templateIdentifier={templateIdentifierToSettings || ''}
          onClose={hideTemplateSettingsModal}
          onSuccess={() => {
            hideTemplateSettingsModal()
            reloadTemplates()
          }}
        />
      </Dialog>
    ),
    [templateIdentifierToSettings, reloadTemplates]
  )

  const goToTemplateStudio = (template: TemplateSummaryResponse): void => {
    history.push(
      routes.toTemplateStudio({
        projectIdentifier,
        orgIdentifier,
        accountId,
        module,
        templateType: template.templateEntityType,
        templateIdentifier: template.identifier || '',
        versionLabel: template.versionLabel,
        repoIdentifier: template.gitDetails?.repoIdentifier,
        branch: template.gitDetails?.branch
      })
    )
  }

  return (
    <>
      <Page.Header
        title={
          <div className="ng-tooltip-native">
            <h2 data-tooltip-id="templatesPageHeading"> {getString('common.templates')}</h2>
            <HarnessDocTooltip tooltipId="templatePageHeading" useStandAlone={true} />
          </div>
        }
        breadcrumbs={
          <NGBreadcrumbs
            links={getLinkForAccountResources({ accountId, orgIdentifier, projectIdentifier, getString })}
          />
        }
      />
      <Page.SubHeader>
        <Layout.Horizontal spacing={'medium'}>
          <NewTemplatePopover />
          <DropDown
            onChange={item => {
              setType(item.value as TemplateType)
            }}
            value={type}
            filterable={false}
            addClearBtn={true}
            items={allowedTemplateTypes}
            placeholder={getString('all')}
            popoverClassName={css.dropdownPopover}
          />
          {isGitSyncEnabled && (
            <GitSyncStoreProvider>
              <GitFilters
                onChange={filter => {
                  setGitFilter(filter)
                  setPage(0)
                }}
                className={css.gitFilter}
                defaultValue={gitFilter || undefined}
              />
            </GitSyncStoreProvider>
          )}
        </Layout.Horizontal>
        <Layout.Horizontal spacing="small" style={{ alignItems: 'center' }}>
          <ExpandingSearchInput
            alwaysExpanded
            width={200}
            placeholder={getString('search')}
            onChange={(text: string) => {
              setPage(0)
              setSearchParam(text)
            }}
            ref={searchRef}
            defaultValue={searchParam}
            className={css.expandSearch}
          />
          <GridListToggle initialSelectedView={view} onViewToggle={setView} />
        </Layout.Horizontal>
      </Page.SubHeader>
      <Page.Body
        loading={loading}
        error={localError?.message}
        className={css.pageBody}
        retryOnError={/* istanbul ignore next */ () => reloadTemplates()}
      >
        <Container height={'100%'} style={{ overflow: 'auto' }}>
          {!templateList?.content?.length && (
            <NoResultsView
              hasSearchParam={!!searchParam || !!type}
              onReset={reset}
              text={getString('templatesLibrary.templatesPage.noTemplates', { scope })}
            />
          )}
          {!!templateList?.content?.length && (
            <Layout.Vertical height={'100%'} margin={{ left: 'xlarge', right: 'xlarge' }}>
              <ResultsViewHeader templateData={templateList} setPage={setPage} setSort={setSort} />
              <Container style={{ flexGrow: 1 }} padding={{ bottom: 'large' }}>
                <TemplatesView
                  gotoPage={setPage}
                  data={templateList}
                  onSelect={setSelectedTemplate}
                  selectedIdentifier={selectedTemplate?.identifier}
                  onPreview={setSelectedTemplate}
                  onOpenEdit={goToTemplateStudio}
                  onOpenSettings={identifier => {
                    setTemplateIdentifierToSettings(identifier)
                    showTemplateSettingsModal()
                  }}
                  onDelete={template => {
                    setTemplateToDelete(template)
                    showDeleteTemplatesModal()
                  }}
                  view={view}
                />
              </Container>
            </Layout.Vertical>
          )}
        </Container>
      </Page.Body>
      {selectedTemplate && (
        <TemplateDetailsDrawer
          template={selectedTemplate}
          onClose={() => {
            setSelectedTemplate(undefined)
          }}
        />
      )}
    </>
  )
}
