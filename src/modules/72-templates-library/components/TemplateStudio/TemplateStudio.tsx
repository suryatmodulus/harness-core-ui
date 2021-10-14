import React from 'react'
import { matchPath, useParams } from 'react-router-dom'
import { parse } from 'yaml'
import SplitPane from 'react-split-pane'
import { debounce, isEmpty, noop, omit } from 'lodash-es'
import { Container, Layout } from '@wings-software/uicore'
import { Formik, FormikProps } from 'formik'
import { useHistory } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { NavigationCheck, Page, useConfirmationDialog, useToaster } from '@common/exports'
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import { RightDrawer } from '@templates-library/components/TemplateStudio/RightDrawer/RightDrawer'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { TemplateStudioSubHeader } from '@templates-library/components/TemplateStudio/TemplateStudioSubHeader/TemplateStudioSubHeader'
import { PageSpinner } from '@common/components'
import templateFactory from '@templates-library/components/Templates/TemplatesFactory'
import { TemplateStudioHeader } from '@templates-library/components/TemplateStudio/TemplateStudioHeader/TemplateStudioHeader'
import type { TemplateStudioPathProps } from '@common/interfaces/RouteInterfaces'
import type { TemplateType } from '@templates-library/utils/templatesUtils'
import { DrawerTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import type { StepElementConfig } from 'services/cd-ng'
import GenericErrorHandler from '@common/pages/GenericErrorHandler/GenericErrorHandler'
import { SelectedView } from '@common/components/VisualYamlToggle/VisualYamlToggle'
import TemplateYamlView from '@templates-library/components/TemplateStudio/TemplateYamlView/TemplateYamlView'
import { accountPathProps, pipelineModuleParams, templatePathProps } from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitions'
import { DefaultNewTemplateId } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateReducer'
import type { NGTemplateInfoConfig } from 'services/template-ng'
import type { GetErrorResponse } from '@templates-library/components/TemplateStudio/SaveTemplatePopover/SaveTemplatePopover'
import css from './TemplateStudio.module.scss'

export type TemplateFormikRef<T = unknown> = {
  resetForm: FormikProps<T>['resetForm']
  submitForm: FormikProps<T>['submitForm']
  getErrors: () => FormikProps<T>['errors']
}

export type TemplateFormRef<T = unknown> =
  | ((instance: TemplateFormikRef<T> | null) => void)
  | React.MutableRefObject<TemplateFormikRef<T> | null>
  | null

export function TemplateStudio(): React.ReactElement {
  const { state, view, updateTemplateView, updateTemplate, deleteTemplateCache, isReadonly, fetchTemplate, setView } =
    React.useContext(TemplateContext)
  const { templateIdentifier } = useParams<TemplateStudioPathProps>()
  const { template, templateView, isLoading, isUpdated, yamlHandler, isBETemplateUpdated, isInitialized } = state
  const { isYamlEditable } = templateView
  const { getString } = useStrings()
  const { templateType } = useParams<TemplateStudioPathProps>()
  const [splitPaneSize, setSplitPaneSize] = React.useState(200)
  const [isYamlError, setYamlError] = React.useState(false)
  const [discardBEUpdateDialog, setDiscardBEUpdate] = React.useState(false)
  const { showError } = useToaster()
  const history = useHistory()
  const formikRef = React.useRef<FormikProps<unknown> | null>(null)
  const templateFormikRef = React.useRef<TemplateFormikRef | null>(null)

  useDocumentTitle([parse(template?.name || getString('common.templates'))])

  const { openDialog: openConfirmBEUpdateError } = useConfirmationDialog({
    cancelButtonText: getString('cancel'),
    contentText: getString('pipelines-studio.pipelineUpdatedError'),
    titleText: getString('pipelines-studio.pipelineUpdated'),
    confirmButtonText: getString('update'),
    onCloseDialog: isConfirmed => {
      if (isConfirmed) {
        fetchTemplate({ forceFetch: true, forceUpdate: true })
      } else {
        setDiscardBEUpdate(true)
      }
    }
  })

  const resizerStyle = navigator.userAgent.match(/firefox/i)
    ? { display: 'flow-root list-item' }
    : { display: 'inline-table' }

  const setSplitPaneSizeDeb = React.useRef(debounce(setSplitPaneSize, 200))

  const handleStageResize = (size: number) => {
    setSplitPaneSizeDeb.current(size)
  }

  const onUpdate = async (newTemplate: NGTemplateInfoConfig) => {
    newTemplate.spec = omit(newTemplate.spec, 'name', 'identifier')
    await updateTemplate(newTemplate)
  }

  const openStepSelection = async (onSelection: (data: StepElementConfig) => void) => {
    if (templateIdentifier === DefaultNewTemplateId) {
      await updateTemplateView({
        ...templateView,
        isDrawerOpened: true,
        drawerData: {
          type: DrawerTypes.AddStep,
          data: {
            paletteData: {
              onSelection: (stepData: StepElementConfig) => {
                updateTemplateView({
                  ...templateView,
                  isDrawerOpened: false,
                  drawerData: { type: DrawerTypes.AddStep }
                })
                onSelection(stepData)
              }
            }
          }
        }
      })
    }
  }

  const showInvalidYamlError = React.useCallback(
    (error: string) => {
      setYamlError(true)
      showError(error)
    },
    [setYamlError, showError]
  )

  const isValidYaml = function () {
    if (yamlHandler) {
      try {
        const parsedYaml = parse(yamlHandler.getLatestYaml())
        if (!parsedYaml || yamlHandler.getYAMLValidationErrorMap()?.size > 0) {
          showInvalidYamlError(getString('invalidYamlText'))
          return false
        }
        updateTemplate(parsedYaml.template)
      } catch (e) {
        showInvalidYamlError(e.message || getString('invalidYamlText'))
        return false
      }
    }
    return true
  }

  const onViewChange = (newView: SelectedView): boolean => {
    if (newView === view) {
      return false
    }
    if (newView === SelectedView.VISUAL && yamlHandler && isYamlEditable) {
      if (!isValidYaml()) {
        return false
      }
    }
    setView(newView)
    updateTemplateView({
      isDrawerOpened: false,
      isYamlEditable: false,
      drawerData: { type: DrawerTypes.AddStep }
    })
    return true
  }

  const resetForm = React.useCallback(() => {
    setTimeout(() => {
      templateFormikRef.current?.resetForm()
    }, 0)
  }, [templateFormikRef])

  const getErrors = async (): Promise<GetErrorResponse> => {
    await templateFormikRef.current?.submitForm()
    const errors = templateFormikRef.current?.getErrors()
    return { status: 'SUCCESS', errors }
  }

  React.useEffect(() => {
    if (!isLoading) {
      resetForm()
    }
  }, [isLoading])

  React.useEffect(() => {
    if (isBETemplateUpdated && !discardBEUpdateDialog) {
      openConfirmBEUpdateError()
    }
  }, [isBETemplateUpdated, discardBEUpdateDialog, openConfirmBEUpdateError])

  return (
    <>
      <NavigationCheck
        when={template.identifier !== ''}
        shouldBlockNavigation={nextLocation => {
          const matchDefault = matchPath(nextLocation.pathname, {
            path: routes.toTemplateStudio({ ...accountPathProps, ...templatePathProps, ...pipelineModuleParams }),
            exact: true
          })
          return (
            !matchDefault?.isExact &&
            isUpdated &&
            !isReadonly &&
            !(templateIdentifier === DefaultNewTemplateId && isEmpty(template?.name))
          )
        }}
        textProps={{
          contentText: isYamlError ? getString('navigationYamlError') : getString('navigationCheckText'),
          titleText: isYamlError ? getString('navigationYamlErrorTitle') : getString('navigationCheckTitle')
        }}
        navigate={newPath => {
          const isTemplate = matchPath(newPath, {
            path: routes.toTemplateStudio({ ...accountPathProps, ...templatePathProps, ...pipelineModuleParams }),
            exact: true
          })
          !isTemplate?.isExact && deleteTemplateCache()
          history.push(newPath)
        }}
      />
      <Page.Header size={'small'} title={<TemplateStudioHeader templateType={templateType as TemplateType} />} />
      <Page.Body>
        {isLoading && <PageSpinner />}
        <Layout.Vertical height={'100%'}>
          {!isLoading && isEmpty(template) && <GenericErrorHandler />}
          {isInitialized && !isEmpty(template) && (
            <>
              <TemplateStudioSubHeader onViewChange={onViewChange} getErrors={getErrors} />
              <Container className={css.canvasContainer}>
                <Formik<NGTemplateInfoConfig>
                  onSubmit={noop}
                  validate={onUpdate}
                  initialValues={template}
                  enableReinitialize={true}
                >
                  {formikProps => {
                    formikRef.current = formikProps
                    if (view === SelectedView.VISUAL) {
                      return (
                        <SplitPane
                          size={splitPaneSize}
                          split="horizontal"
                          minSize={160}
                          maxSize={300}
                          style={{ overflow: 'auto' }}
                          pane2Style={{ overflow: 'initial', zIndex: 2 }}
                          resizerStyle={resizerStyle}
                          onChange={handleStageResize}
                        >
                          {templateFactory.getTemplate(templateType)?.renderTemplateDiagram({
                            formikRef: templateFormikRef,
                            formikProps: formikProps,
                            openStepSelection
                          })}
                          {templateFactory
                            .getTemplate(templateType)
                            ?.renderTemplateForm({ formikRef: templateFormikRef, formikProps: formikProps })}
                        </SplitPane>
                      )
                    } else {
                      return <TemplateYamlView />
                    }
                  }}
                </Formik>
              </Container>
            </>
          )}
          <RightDrawer />
        </Layout.Vertical>
      </Page.Body>
    </>
  )
}
