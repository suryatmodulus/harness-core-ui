import React, { useState } from 'react'
import { Button, ButtonVariation, Color, Container, Layout, useToaster } from '@wings-software/uicore'
import { defaultTo, get, set } from 'lodash-es'
import { useParams } from 'react-router-dom'
import produce from 'immer'
import { parse } from 'yaml'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getTemplateInputSetYamlPromise, TemplateSummaryResponse } from 'services/template-ng'
import { useStrings } from 'framework/strings'
import { Scope } from '@common/interfaces/SecretsInterface'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import NoResultsView from '@templates-library/pages/TemplatesPage/views/NoResultsView/NoResultsView'
import type { TemplateConfig } from '@pipeline/utils/tempates'
import { DefaultNewVersionLabel } from 'framework/Templates/templates'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { TemplateSelectorLeftView } from '@templates-library/components/TemplateSelector/TemplateSelectorLeftView/TemplateSelectorLeftView'
import { TemplateDetails } from '../TemplateDetails/TemplateDetails'
import css from './TemplateSelector.module.scss'

export const TemplateSelector: React.FC = (): JSX.Element => {
  const {
    state: {
      templateView: {
        templateDrawerData: { data }
      },
      templateTypes
    },
    setTemplateTypes
  } = usePipelineContext()
  const { onUseTemplate, onCopyTemplate } = data?.selectorData || {}
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateSummaryResponse | undefined>()
  const { getString } = useStrings()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps & ModulePathParams>()
  const { isGitSyncEnabled } = useAppStore()
  const { showError } = useToaster()

  const getScopeBasedTemplateRef = React.useCallback((template?: TemplateSummaryResponse) => {
    const templateIdentifier = defaultTo(template?.identifier, '')
    const scope = getScopeFromDTO(defaultTo(template, {}))
    return scope === Scope.PROJECT ? templateIdentifier : `${scope}.${templateIdentifier}`
  }, [])

  const getTemplateDetails: React.ReactElement = React.useMemo(() => {
    if (selectedTemplate) {
      return (
        <TemplateDetails template={selectedTemplate} setTemplate={setSelectedTemplate} allowStableSelection={true} />
      )
    } else {
      return <></>
    }
  }, [selectedTemplate, setSelectedTemplate])

  const onUseTemplateClick = React.useCallback(async () => {
    const templateIdentifier = defaultTo(selectedTemplate?.identifier, '')
    try {
      const resp = await getTemplateInputSetYamlPromise({
        templateIdentifier,
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier,
          versionLabel:
            selectedTemplate?.versionLabel === DefaultNewVersionLabel
              ? ''
              : defaultTo(selectedTemplate?.versionLabel, '')
        }
      })
      if (resp?.status === 'SUCCESS') {
        set(templateTypes, templateIdentifier, parse(defaultTo(selectedTemplate?.yaml, '')).template.spec.type)
        setTemplateTypes(templateTypes)
        const templateConfig = produce({} as TemplateConfig, draft => {
          draft.templateRef = getScopeBasedTemplateRef(selectedTemplate)
          if (selectedTemplate?.versionLabel !== DefaultNewVersionLabel) {
            draft.versionLabel = defaultTo(selectedTemplate?.versionLabel, '')
          }
          draft.templateInputs = parse(defaultTo(resp.data, ''))
        })
        onUseTemplate?.(templateConfig)
      } else {
        throw resp
      }
    } catch (err) {
      showError(get(err, 'data.error', get(err, 'data.message', err?.message)))
    }
  }, [selectedTemplate, accountId, orgIdentifier, projectIdentifier, onUseTemplate])

  return (
    <Container height={'100%'} className={css.container}>
      <Layout.Horizontal height={'100%'}>
        <TemplateSelectorLeftView setTemplate={setSelectedTemplate} />
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
                    onClick={onUseTemplateClick}
                  />
                  <Button
                    variation={ButtonVariation.LINK}
                    text={getString('templatesLibrary.copyToPipeline')}
                    onClick={() => {
                      onCopyTemplate?.(selectedTemplate)
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
                <NoResultsView text={getString('templatesLibrary.selectTemplateToPreview')} minimal={true} />
              </Layout.Vertical>
            </Container>
          )}
        </Container>
      </Layout.Horizontal>
    </Container>
  )
}
