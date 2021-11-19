import React, { useState } from 'react'
import {
  ExpandingSearchInput,
  GridListToggle,
  HarnessDocTooltip,
  Layout,
  useModalHook,
  Views,
  Container,
  ExpandingSearchInputHandle,
  PageError,
  useToaster
} from '@wings-software/uicore'
import { useParams, useHistory } from 'react-router-dom'
import { Dialog } from '@blueprintjs/core'
import { defaultTo, pick } from 'lodash-es'
import { TemplateSettingsModal } from '@templates-library/components/TemplateSettingsModal/TemplateSettingsModal'
import { Page } from '@common/exports'
import { useStrings } from 'framework/strings'
import { Sort, SortFields, TemplateListType } from '@templates-library/pages/TemplatesPage/TemplatesPageUtils'
import { TemplateDetailsDrawer } from '@templates-library/components/TemplateDetailDrawer/TemplateDetailDrawer'
import {
  TemplateSummaryResponse,
  useDeleteTemplateVersionsOfIdentifier,
  useGetTemplateList
} from 'services/template-ng'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { NewTemplatePopover } from '@templates-library/pages/TemplatesPage/views/NewTemplatePopover'
import { DeleteTemplateModal } from '@templates-library/components/DeleteTemplateModal/DeleteTemplateModal'
import routes from '@common/RouteDefinitions'
import { PageSpinner } from '@common/components'
import { useMutateAsGet } from '@common/hooks'
import NoResultsView from '@templates-library/pages/TemplatesPage/views/NoResultsView/NoResultsView'
import TemplatesView from '@templates-library/pages/TemplatesPage/views/TemplatesView'
import ResultsViewHeader from '@templates-library/pages/TemplatesPage/views/ResultsViewHeader'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import GitFilters, { GitFilterScope } from '@common/components/GitFilters/GitFilters'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import css from './TemplatesPage.module.scss'

export default function TemplatesPage(): React.ReactElement {
  const { getString } = useStrings()
  const history = useHistory()
  const [page, setPage] = useState(0)
  const [view, setView] = useState<Views>(Views.GRID)
  const [sort, setSort] = useState<string[]>([SortFields.LastUpdatedAt, Sort.DESC])
  const [searchParam, setSearchParam] = useState('')
  const [templateToDelete, setTemplateToDelete] = React.useState<TemplateSummaryResponse>({})
  const [templateIdentifierToSettings, setTemplateIdentifierToSettings] = React.useState<string>()
  const [selectedTemplate, setSelectedTemplate] = React.useState<TemplateSummaryResponse | undefined>()
  const [gitFilter, setGitFilter] = useState<GitFilterScope | null>(null)
  const searchRef = React.useRef<ExpandingSearchInputHandle>({} as ExpandingSearchInputHandle)
  const { projectIdentifier, orgIdentifier, accountId, module } = useParams<ProjectPathProps & ModulePathParams>()
  const { isGitSyncEnabled } = useAppStore()
  const scope = getScopeFromDTO({ projectIdentifier, orgIdentifier, accountIdentifier: accountId })
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { showSuccess, showError } = useToaster()

  const reset = React.useCallback((): void => {
    searchRef.current.clear()
    setGitFilter(null)
  }, [searchRef])

  const [showDeleteTemplatesModal, hideDeleteTemplatesModal] = useModalHook(
    () => (
      <Dialog enforceFocus={false} isOpen={true} className={css.deleteTemplateDialog}>
        <GitSyncStoreProvider>
          <DeleteTemplateModal
            template={templateToDelete}
            onClose={hideDeleteTemplatesModal}
            onSuccess={() => {
              hideDeleteTemplatesModal()
              reloadTemplates()
            }}
            onDeleteTemplateGitSync={onDeleteTemplate}
          />
        </GitSyncStoreProvider>
      </Dialog>
    ),
    [templateToDelete]
  )

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
    [templateIdentifierToSettings]
  )

  const {
    data: templateData,
    refetch: reloadTemplates,
    loading,
    error
  } = useMutateAsGet(useGetTemplateList, {
    body: {
      filterType: 'Template'
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
    reloadTemplates()
  }, [page, accountId, projectIdentifier, orgIdentifier, module, searchParam, sort])

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

  const { mutate: deleteTemplates } = useDeleteTemplateVersionsOfIdentifier({})

  const onDeleteTemplate = async (commitMsg: string, versions?: string[]): Promise<void> => {
    try {
      hideDeleteTemplatesModal()
      setIsLoading(true)
      const gitParams = templateToDelete.gitDetails?.objectId
        ? {
            ...pick(templateToDelete.gitDetails, ['branch', 'repoIdentifier', 'filePath', 'rootFolder']),
            commitMsg,
            lastObjectId: templateToDelete.gitDetails?.objectId
          }
        : {}
      const deleted = await deleteTemplates(defaultTo(templateToDelete.identifier, ''), {
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier,
          ...gitParams
        },
        body: JSON.stringify({ templateVersionLabels: versions }),
        headers: { 'content-type': 'application/json' }
      })
      setIsLoading(false)

      /* istanbul ignore else */
      if (deleted?.status === 'SUCCESS') {
        showSuccess(getString('common.template.deleteTemplate.templatesDeleted', { name: templateToDelete.name }))
      } else {
        throw getString('somethingWentWrong')
      }
      reloadTemplates()
    } catch (err) {
      setIsLoading(false)
      /* istanbul ignore next */
      showError(err?.data?.message || err?.message, undefined, 'common.template.deleteTemplate.errorWhileDeleting')
    }
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
        breadcrumbs={<NGBreadcrumbs links={[]} />}
      />

      <Page.Body>
        {(loading || isLoading) && <PageSpinner />}
        {!loading && error && (
          <PageError message={defaultTo((error.data as Error)?.message, error.message)} onClick={reloadTemplates} />
        )}
        {!loading && !error && (
          <Layout.Vertical height={'100%'}>
            <Page.SubHeader>
              <Layout.Horizontal>
                <NewTemplatePopover />
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
                <GridListToggle initialSelectedView={Views.GRID} onViewToggle={setView} />
              </Layout.Horizontal>
            </Page.SubHeader>
            <Container height={'100%'} style={{ overflow: 'auto' }}>
              {!templateData?.data?.content?.length && (
                <NoResultsView
                  hasSearchParam={!!searchParam}
                  onReset={reset}
                  text={getString('templatesLibrary.templatesPage.noTemplates', { scope })}
                />
              )}
              {!!templateData?.data?.content?.length && (
                <Layout.Vertical height={'100%'} margin={{ left: 'xlarge', right: 'xlarge' }}>
                  <ResultsViewHeader templateData={templateData} setPage={setPage} setSort={setSort} />
                  <Container style={{ flexGrow: 1 }} padding={{ bottom: 'large' }}>
                    <TemplatesView
                      gotoPage={setPage}
                      data={templateData?.data}
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
                      onDeleteTemplate={onDeleteTemplate}
                    />
                  </Container>
                </Layout.Vertical>
              )}
            </Container>
          </Layout.Vertical>
        )}
      </Page.Body>
      <TemplateDetailsDrawer
        templateIdentifier={selectedTemplate?.identifier}
        versionLabel={selectedTemplate?.versionLabel}
        gitDetails={selectedTemplate?.gitDetails}
        onClose={() => {
          setSelectedTemplate(undefined)
        }}
        accountId={accountId}
        orgIdentifier={orgIdentifier}
        projectIdentifier={projectIdentifier}
        module={module}
      />
    </>
  )
}
