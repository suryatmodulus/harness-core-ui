import React from 'react'
import { Dialog } from '@blueprintjs/core'
import { Button, ButtonVariation, useModalHook } from '@wings-software/uicore'
import { cloneDeep, isEmpty, noop } from 'lodash-es'
import { useHistory, useParams } from 'react-router-dom'
import { parse } from 'yaml'
import type { FormikErrors } from 'formik'
import { useStrings } from 'framework/strings'
import type { ModulePathParams, TemplateStudioPathProps } from '@common/interfaces/RouteInterfaces'
import { TemplateCommentModal } from '@templates-library/components/TemplateStudio/TemplateCommentModal/TemplateCommentModal'
import { Fields, ModalProps, TemplateConfigModal } from 'framework/Templates/TemplateConfigModal/TemplateConfigModal'
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import routes from '@common/RouteDefinitions'
import { useToaster } from '@common/components'
import { SelectedView } from '@common/components/VisualYamlToggle/VisualYamlToggle'
import { TemplatesActionPopover } from '@templates-library/components/TemplatesActionPopover/TemplatesActionPopover'
import {
  NGTemplateInfoConfig,
  createTemplatePromise,
  updateExistingTemplateLabelPromise,
  Failure
} from 'services/template-ng'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { DefaultNewTemplateId } from 'framework/Templates/templates'
import css from './SaveTemplatePopover.module.scss'

export interface GetErrorResponse extends Omit<Failure, 'errors'> {
  errors?: FormikErrors<unknown>
}

export interface SaveTemplatePopoverProps {
  disabled?: boolean
  getErrors?: () => Promise<GetErrorResponse>
}

export function SaveTemplatePopover(props: SaveTemplatePopoverProps): React.ReactElement {
  const {
    state: { template, yamlHandler },
    setLoading,
    fetchTemplate,
    deleteTemplateCache,
    view
  } = React.useContext(TemplateContext)
  const { getString } = useStrings()
  const { disabled = false, getErrors } = props
  const { templateIdentifier, templateType, projectIdentifier, orgIdentifier, accountId, module } = useParams<
    TemplateStudioPathProps & ModulePathParams
  >()
  const [modalProps, setModalProps] = React.useState<ModalProps>()
  const [menuOpen, setMenuOpen] = React.useState(false)
  const history = useHistory()
  const { showSuccess, showError, clear } = useToaster()
  const isYaml = view === SelectedView.YAML

  const [showConfigModal, hideConfigModal] = useModalHook(
    () => (
      <Dialog enforceFocus={false} isOpen={true} className={css.configDialog}>
        {modalProps && (
          <TemplateConfigModal initialValues={template} onClose={hideConfigModal} modalProps={modalProps} />
        )}
      </Dialog>
    ),
    [template, modalProps]
  )

  const [showCommentsModal, hideCommentsModal] = useModalHook(() => {
    return (
      <Dialog enforceFocus={false} isOpen={true} className={css.commentsDialog}>
        <TemplateCommentModal
          title={getString('templatesLibrary.updateTemplateModal.heading', {
            name: template.name,
            version: template.versionLabel
          })}
          onClose={hideCommentsModal}
          onSubmit={comments => {
            hideCommentsModal()
            setLoading(true)
            updateExistingLabel(comments)
          }}
        />
      </Dialog>
    )
  }, [template])

  const navigateToLocation = (newTemplateId: string, versionLabel: string) => {
    history.replace(
      routes.toTemplateStudio({
        projectIdentifier,
        orgIdentifier,
        accountId,
        module,
        templateType: templateType,
        templateIdentifier: newTemplateId,
        versionLabel: versionLabel
      })
    )
  }

  const updateExistingLabel = async (comments?: string) => {
    updateExistingTemplateLabelPromise({
      templateIdentifier: template.identifier,
      versionLabel: template.versionLabel,
      body: yamlStringify({ template: cloneDeep(template) }),
      queryParams: {
        accountIdentifier: accountId,
        projectIdentifier,
        orgIdentifier,
        comments
      },
      requestOptions: { headers: { 'Content-Type': 'application/yaml' } }
    })
      .then(async response => {
        if (response && response.status === 'SUCCESS') {
          showSuccess(getString('templatesLibrary.templateUpdated'))
          await fetchTemplate({ forceFetch: true, forceUpdate: true })
        } else {
          throw response
        }
      })
      .catch(error => {
        setLoading(false)
        showError(
          error?.message || getString('templatesLibrary.errorWhileUpdating'),
          undefined,
          'template.update.template.error'
        )
      })
  }

  const createNewTemplate = (latestTemplate: NGTemplateInfoConfig) => {
    if (isYaml && yamlHandler) {
      if (!parse(yamlHandler.getLatestYaml())) {
        clear()
        showError(getString('invalidYamlText'))
      }
      try {
        latestTemplate = parse(yamlHandler.getLatestYaml()).template as NGTemplateInfoConfig
      } /* istanbul ignore next */ catch (err) {
        showError(err.message || err, undefined, 'pipeline.save.pipeline.error')
      }
    }

    return createTemplatePromise({
      body: yamlStringify({ template: cloneDeep(latestTemplate) }),
      queryParams: {
        accountIdentifier: accountId,
        projectIdentifier,
        orgIdentifier
      },
      requestOptions: { headers: { 'Content-Type': 'application/yaml' } }
    })
  }

  const saveAndPublish = React.useCallback(async () => {
    setLoading(true)
    createNewTemplate(template)
      .then(async response => {
        if (response && response.status === 'SUCCESS') {
          showSuccess(getString('common.saveTemplate.publishTemplate'))
          if (templateIdentifier === DefaultNewTemplateId) {
            await deleteTemplateCache()
          }
          navigateToLocation(template.identifier, template.versionLabel)
        } else {
          throw response
        }
      })
      .catch(error => {
        setLoading(false)
        showError(
          error?.message || getString('common.saveTemplate.errorWhileSaving'),
          undefined,
          'template.save.template.error'
        )
      })
  }, [template])

  const onSaveSuccess = (modalValues: NGTemplateInfoConfig) => {
    hideConfigModal()
    showSuccess(getString('common.saveTemplate.publishTemplate'))
    navigateToLocation(modalValues.identifier, modalValues.versionLabel)
  }

  const onSaveFailure = (error: any) => {
    showError(
      error?.message || getString('common.saveTemplate.errorWhileSaving'),
      undefined,
      'template.save.template.error'
    )
  }

  const saveAsNewLabel = (): void => {
    setModalProps({
      title: getString('templatesLibrary.saveAsNewLabelModal.heading'),
      promise: createNewTemplate,
      onSuccess: onSaveSuccess,
      onFailure: onSaveFailure,
      disabledFields: [Fields.Identifier],
      emptyFields: [Fields.VersionLabel]
    })
    showConfigModal()
  }

  const saveAsNewTemplate = (): void => {
    setModalProps({
      title: getString('common.saveAsNewTemplateHeading'),
      promise: createNewTemplate,
      onSuccess: onSaveSuccess,
      onFailure: onSaveFailure,
      emptyFields: [Fields.Name, Fields.Identifier, Fields.VersionLabel]
    })
    showConfigModal()
  }

  const saveOptions =
    templateIdentifier === DefaultNewTemplateId
      ? [
          {
            label: getString('save'),
            onClick: () => {
              getErrors?.().then(response => {
                if (response.status === 'SUCCESS' && isEmpty(response.errors)) {
                  saveAndPublish()
                }
              })
            }
          }
        ]
      : [
          {
            label: getString('save'),
            onClick: () => {
              getErrors?.().then(response => {
                if (response.status === 'SUCCESS' && isEmpty(response.errors)) {
                  showCommentsModal()
                }
              })
            }
          },
          {
            label: getString('templatesLibrary.saveAsNewLabelModal.heading'),
            onClick: () => {
              getErrors?.().then(response => {
                if (response.status === 'SUCCESS' && isEmpty(response.errors)) {
                  saveAsNewLabel()
                }
              })
            }
          },
          {
            label: getString('common.saveAsNewTemplateHeading'),
            onClick: () => {
              getErrors?.().then(response => {
                if (response.status === 'SUCCESS' && isEmpty(response.errors)) {
                  saveAsNewTemplate()
                }
              })
            }
          }
        ]

  return (
    <TemplatesActionPopover
      open={menuOpen && saveOptions.length > 1}
      disabled={disabled}
      items={saveOptions}
      setMenuOpen={setMenuOpen}
      minimal={true}
    >
      <Button
        disabled={disabled}
        variation={ButtonVariation.PRIMARY}
        rightIcon={saveOptions.length > 1 ? 'chevron-down' : undefined}
        text={getString('save')}
        onClick={saveOptions.length === 1 ? () => saveOptions[0].onClick() : noop}
        icon="send-data"
      />
    </TemplatesActionPopover>
  )
}
