import React from 'react'
import { Color, ButtonVariation, ButtonSize, useModalHook, ButtonProps } from '@wings-software/uicore'
import produce from 'immer'
import { defaultTo, merge, omit } from 'lodash-es'
import { Dialog } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { useStrings } from 'framework/strings'
import { DefaultTemplate } from 'framework/Templates/templates'
import type { NGTemplateInfoConfig } from 'services/template-ng'
import { ModalProps, TemplateConfigModal } from 'framework/Templates/TemplateConfigModal/TemplateConfigModal'
import type { ProjectPathProps, GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { useSaveTemplate } from '@pipeline/utils/useSaveTemplate'
import type { JsonNode, StageElementConfig } from 'services/cd-ng'
import type { StepOrStepGroupOrTemplateStepData } from '@pipeline/components/PipelineStudio/StepCommands/StepCommandTypes'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import css from './SaveTemplateButton.module.scss'

interface SaveTemplateButtonProps {
  data: StepOrStepGroupOrTemplateStepData | StageElementConfig
  type: 'Step' | 'Stage'
  buttonProps?: ButtonProps
}

export const SaveTemplateButton = ({ data, buttonProps, type }: SaveTemplateButtonProps): JSX.Element => {
  const { getString } = useStrings()
  const { orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const [template, setTemplate] = React.useState<NGTemplateInfoConfig>()
  const [modalProps, setModalProps] = React.useState<ModalProps>()
  const [showConfigModal, hideConfigModal] = useModalHook(
    () => (
      <Dialog enforceFocus={false} isOpen={true} className={css.configDialog}>
        {modalProps && template && (
          <TemplateConfigModal
            initialValues={merge(template, { repo: defaultTo(repoIdentifier, ''), branch: defaultTo(branch, '') })}
            onClose={hideConfigModal}
            modalProps={modalProps}
          />
        )}
      </Dialog>
    ),
    [template, modalProps, repoIdentifier, branch]
  )
  const { saveAndPublish } = useSaveTemplate(
    {
      template: template as NGTemplateInfoConfig,
      gitDetails: { repoIdentifier, branch },
      isPipelineStudio: true
    },
    hideConfigModal
  )

  const onSaveAsTemplate = () => {
    setTemplate(
      produce(DefaultTemplate, draft => {
        draft.projectIdentifier = projectIdentifier
        draft.orgIdentifier = orgIdentifier
        draft.type = type
        draft.spec = omit(data, 'name', 'identifier') as JsonNode
      })
    )
    setModalProps({
      title: getString('common.template.saveAsNewTemplateHeading'),
      promise: saveAndPublish
    })
    showConfigModal()
  }

  return (
    <RbacButton
      withoutCurrentColor
      text={buttonProps?.variation === ButtonVariation.ICON ? undefined : getString('common.saveAsTemplate')}
      className={buttonProps?.variation === ButtonVariation.ICON ? css.iconButton : ''}
      variation={ButtonVariation.SECONDARY}
      size={ButtonSize.SMALL}
      icon="upload-box"
      iconProps={{ color: Color.PRIMARY_7 }}
      onClick={onSaveAsTemplate}
      permission={{
        permission: PermissionIdentifier.EDIT_TEMPLATE,
        resource: {
          resourceType: ResourceType.TEMPLATE
        }
      }}
      featuresProps={{
        featuresRequest: {
          featureNames: [FeatureIdentifier.TEMPLATE_SERVICE]
        }
      }}
      {...buttonProps}
    />
  )
}
