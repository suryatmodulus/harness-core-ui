import React, { useState } from 'react'
import {
  ExpandingSearchInput,
  GridListToggle,
  HarnessDocTooltip,
  Layout,
  useModalHook,
  Views,
  Container,
  ExpandingSearchInputHandle
} from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { Dialog } from '@blueprintjs/core'
import { useHistory } from 'react-router-dom'
import { TemplateSettingsModal } from '@templates-library/components/TemplateSettingsModal/TemplateSettingsModal'
import { Page } from '@common/exports'
import { useStrings } from 'framework/strings'
import { Sort, SortFields, TemplateListType } from '@templates-library/pages/TemplatesPage/TemplatesPageUtils'
import { TemplateDetailsDrawer } from '@templates-library/components/TemplateDetailDrawer/TemplateDetailDrawer'
import { TemplateSummaryResponse, useGetTemplateList } from 'services/template-ng'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { NewTemplatePopover } from '@templates-library/pages/TemplatesPage/views/NewTemplatePopover'
import { DeleteTemplateModal } from '@templates-library/components/DeleteTemplateModal/DeleteTemplateModal'
import routes from '@common/RouteDefinitions'
import { PageSpinner } from '@common/components'
import { useMutateAsGet } from '@common/hooks'
import NoResultsView from '@templates-library/pages/TemplatesPage/views/NoResultsView'
import TemplatesView from '@templates-library/pages/TemplatesPage/views/TemplatesView'
import ResultsViewHeader from '@templates-library/pages/TemplatesPage/views/ResultsViewHeader'
import css from './TemplatesPage.module.scss'

export default function TemplatesPage(): React.ReactElement {
  const { getString } = useStrings()
  const history = useHistory()
  const [page, setPage] = useState(0)
  const [view, setView] = useState<Views>(Views.GRID)
  const [sort, setSort] = useState<string[]>([SortFields.LastUpdatedAt, Sort.DESC])
  const [searchParam, setSearchParam] = useState('')
  const [templateIdentifierToDelete, setTemplateIdentifierToDelete] = React.useState<string>()
  const [templateIdentifierToSettings, setTemplateIdentifierToSettings] = React.useState<string>()
  const [selectedTemplate, setSelectedTemplate] = React.useState<TemplateSummaryResponse | undefined>()
  const searchRef = React.useRef<ExpandingSearchInputHandle>({} as ExpandingSearchInputHandle)
  const { projectIdentifier, orgIdentifier, accountId, module } = useParams<ProjectPathProps & ModulePathParams>()

  const reset = React.useCallback((): void => {
    searchRef.current.clear()
  }, [searchRef])

  const [showDeleteTemplatesModal, hideDeleteTemplatesModal] = useModalHook(
    () => (
      <Dialog enforceFocus={false} isOpen={true} className={css.deleteTemplateDialog}>
        <DeleteTemplateModal
          templateIdentifier={templateIdentifierToDelete || ''}
          onClose={hideDeleteTemplatesModal}
          onSuccess={() => {
            hideDeleteTemplatesModal()
            reloadTemplates()
          }}
        />
      </Dialog>
    ),
    [templateIdentifierToDelete]
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
      size: 20
    },
    queryParamStringifyOptions: { arrayFormat: 'comma' }
  })

  React.useEffect(() => {
    reloadTemplates()
  }, [page, accountId, projectIdentifier, orgIdentifier, module, searchParam, sort])

  const goToTemplateStudio = (template: TemplateSummaryResponse) => {
    history.push(
      routes.toTemplateStudio({
        projectIdentifier,
        orgIdentifier,
        accountId,
        module,
        templateType: template.templateEntityType,
        templateIdentifier: template.identifier || '',
        versionLabel: template.versionLabel
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
        breadcrumbs={<NGBreadcrumbs links={[]} />}
      />

      <Page.Body error={error?.message} retryOnError={reloadTemplates}>
        {loading && <PageSpinner />}
        <Layout.Vertical height={'100%'}>
          <Page.SubHeader>
            <NewTemplatePopover />
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
            {!templateData?.data?.content?.length && <NoResultsView hasSearchParam={!!searchParam} onReset={reset} />}
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
                    onDelete={identifier => {
                      setTemplateIdentifierToDelete(identifier)
                      showDeleteTemplatesModal()
                    }}
                    view={view}
                  />
                </Container>
              </Layout.Vertical>
            )}
          </Container>
        </Layout.Vertical>
      </Page.Body>
      <TemplateDetailsDrawer
        templateIdentifier={selectedTemplate?.identifier}
        versionLabel={selectedTemplate?.versionLabel}
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
