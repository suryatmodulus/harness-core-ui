import React from 'react'
import { Dialog } from '@blueprintjs/core'
import { Button, ButtonVariation, useModalHook } from '@wings-software/uicore'
import { defaultTo, isEmpty, merge, noop } from 'lodash-es'
import { useParams } from 'react-router-dom'
import type { FormikErrors } from 'formik'
import { useStrings } from 'framework/strings'
import type { ModulePathParams, TemplateStudioPathProps } from '@common/interfaces/RouteInterfaces'
import { TemplateCommentModal } from '@templates-library/components/TemplateStudio/TemplateCommentModal/TemplateCommentModal'
import { Fields, ModalProps, TemplateConfigModal } from 'framework/Templates/TemplateConfigModal/TemplateConfigModal'
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import { TemplatesActionPopover } from '@templates-library/components/TemplatesActionPopover/TemplatesActionPopover'
import { useSaveTemplate } from '@pipeline/utils/useSaveTemplate'
import type { Failure } from 'services/template-ng'
import { DefaultNewTemplateId } from 'framework/Templates/templates'
import { AppStoreContext } from 'framework/AppStore/AppStoreContext'
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
    state: { template, yamlHandler, gitDetails },
    setLoading,
    fetchTemplate,
    deleteTemplateCache,
    view
  } = React.useContext(TemplateContext)
  const { isGitSyncEnabled } = React.useContext(AppStoreContext)
  const { getString } = useStrings()
  const { disabled = false, getErrors } = props
  const { templateIdentifier } = useParams<TemplateStudioPathProps & ModulePathParams>()
  const [modalProps, setModalProps] = React.useState<ModalProps>()
  const [menuOpen, setMenuOpen] = React.useState(false)

  const [showConfigModal, hideConfigModal] = useModalHook(
    () => (
      <Dialog enforceFocus={false} isOpen={true} className={css.configDialog}>
        {modalProps && (
          <TemplateConfigModal
            initialValues={merge(template, {
              repo: defaultTo(gitDetails.repoIdentifier, ''),
              branch: defaultTo(gitDetails.branch, '')
            })}
            onClose={hideConfigModal}
            modalProps={modalProps}
          />
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
            if (isGitSyncEnabled) {
              saveAndPublish(template, { isEdit: true }, comments)
            } else {
              updateExistingLabel(comments)
            }
          }}
        />
      </Dialog>
    )
  }, [template])

  const { saveAndPublish, updateExistingLabel } = useSaveTemplate(
    {
      template,
      yamlHandler,
      gitDetails,
      setLoading,
      fetchTemplate,
      deleteTemplateCache,
      view
    },
    hideConfigModal,
    hideCommentsModal
  )

  const saveAsNewLabel = (): void => {
    setModalProps({
      title: getString('templatesLibrary.saveAsNewLabelModal.heading'),
      promise: saveAndPublish,
      disabledFields: [],
      emptyFields: [Fields.VersionLabel]
    })
    showConfigModal()
  }

  const saveAsNewTemplate = (): void => {
    setModalProps({
      title: getString('common.template.saveAsNewTemplateHeading'),
      promise: saveAndPublish,
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
                  saveAndPublish(template, { isEdit: false })
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
            label: getString('common.template.saveAsNewTemplateHeading'),
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
