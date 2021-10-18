import React, { useContext } from 'react'
import {
  Button,
  ButtonSize,
  ButtonVariation,
  Color,
  Container,
  DropDown,
  Icon,
  Layout,
  SelectOption,
  Text,
  useModalHook
} from '@wings-software/uicore'
import { isEmpty, isNil } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { Dialog } from '@blueprintjs/core'
import { useHistory } from 'react-router-dom'
import { TagsPopover, useToaster } from '@common/components'
import templateFactory from '@templates-library/components/Templates/TemplatesFactory'
import type { ModulePathParams, TemplateStudioPathProps } from '@common/interfaces/RouteInterfaces'
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import { SelectedView } from '@common/components/VisualYamlToggle/VisualYamlToggle'
import routes from '@common/RouteDefinitions'
import { useUpdateStableTemplate, NGTemplateInfoConfig } from 'services/template-ng'
import { useStrings } from 'framework/strings'
import type { UseSaveSuccessResponse } from '@common/modals/SaveToGitDialog/useSaveToGitDialog'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { Fields, ModalProps, TemplateConfigModal } from 'framework/Templates/TemplateConfigModal/TemplateConfigModal'
import { DefaultNewTemplateId, DefaultNewVersionLabel } from 'framework/Templates/templates'
import css from './TemplateStudioSubHeaderLeftView.module.scss'

export const TemplateStudioSubHeaderLeftView: () => JSX.Element = () => {
  const { state, updateTemplate, deleteTemplateCache, fetchTemplate, view, isReadonly, setLoading } =
    useContext(TemplateContext)
  const { template, versions, stableVersion, isUpdated, isInitialized } = state
  const { accountId, projectIdentifier, orgIdentifier, module, templateType, templateIdentifier } = useParams<
    TemplateStudioPathProps & ModulePathParams
  >()
  const iconColor = templateFactory.getTemplateColor(templateType) || Color.BLACK
  const [modalProps, setModalProps] = React.useState<ModalProps>()
  const isYaml = view === SelectedView.YAML
  const history = useHistory()
  const [versionOptions, setVersionOptions] = React.useState<SelectOption[]>([])
  const { showSuccess, showError } = useToaster()
  const { getString } = useStrings()

  const { mutate: updateStableTemplate, loading: updateStableTemplateLoading } = useUpdateStableTemplate({
    templateIdentifier: template.identifier,
    versionLabel: template.versionLabel,
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier
    },
    requestOptions: { headers: { 'content-type': 'application/json' } }
  })

  const [showConfigModal, hideConfigModal] = useModalHook(
    () => (
      <Dialog enforceFocus={false} isOpen={true} className={css.createTemplateDialog}>
        {modalProps && <TemplateConfigModal initialValues={template} onClose={onCloseCreate} modalProps={modalProps} />}
      </Dialog>
    ),
    [template, modalProps]
  )

  const onCloseCreate = React.useCallback(() => {
    if (template?.identifier === DefaultNewTemplateId) {
      history.push(routes.toTemplates({ orgIdentifier, projectIdentifier, accountId, module }))
    }
    hideConfigModal()
  }, [
    accountId,
    hideConfigModal,
    history,
    module,
    orgIdentifier,
    template?.identifier,
    projectIdentifier,
    routes.toTemplates
  ])

  const onSubmit = React.useCallback(
    async (data: NGTemplateInfoConfig): Promise<UseSaveSuccessResponse> => {
      template.name = data.name
      template.description = data.description
      template.identifier = data.identifier
      template.tags = data.tags ?? {}
      template.versionLabel = data.versionLabel
      try {
        await updateTemplate(template)
        return { status: 'SUCCESS' }
      } catch (error) {
        return { status: 'ERROR' }
      }
    },
    [template]
  )

  const goToTemplateVersion = async (versionLabel: string) => {
    if (versionLabel !== DefaultNewVersionLabel && versionLabel !== template.versionLabel) {
      await deleteTemplateCache()
      history.replace(
        routes.toTemplateStudio({
          projectIdentifier,
          orgIdentifier,
          accountId,
          module,
          templateType: template.type,
          templateIdentifier: template.identifier,
          versionLabel: versionLabel
        })
      )
    }
  }

  const updateStableLabel = async () => {
    try {
      await updateStableTemplate()
      showSuccess(getString('templatesLibrary.templateUpdated'))
      await fetchTemplate({ forceFetch: true, forceUpdate: true })
    } catch (error) {
      showError(
        error?.message || getString('templatesLibrary.errorWhileUpdating'),
        undefined,
        'template.save.template.error'
      )
      setLoading(false)
    }
  }

  React.useEffect(() => {
    if (updateStableTemplateLoading) {
      setLoading(true)
    }
  }, [updateStableTemplateLoading])

  React.useEffect(() => {
    const newVersionOption: SelectOption[] = versions.map(item => {
      return {
        label: item,
        value: item
      }
    })
    newVersionOption.sort((a, b) => a.label.localeCompare(b.label))
    setVersionOptions(newVersionOption)
  }, [versions])

  React.useEffect(() => {
    if (isInitialized) {
      if (template?.identifier === DefaultNewTemplateId && !isEmpty(template.type)) {
        setModalProps({
          title: getString('templatesLibrary.createNewModal.heading', { entity: template.type }),
          promise: onSubmit,
          onSuccess: () => {
            hideConfigModal()
          }
        })
        showConfigModal()
      }
    }
  }, [template?.identifier, showConfigModal, isInitialized, template.type])

  return (
    <Container className={css.subHeaderLeftView}>
      <Layout.Horizontal spacing={'medium'} padding={{ right: 'medium' }} flex={{ alignItems: 'center' }}>
        <Container>
          <Layout.Horizontal spacing={'small'} flex={{ alignItems: 'center' }}>
            <Icon color={iconColor} name="template-library" size={20} />
            <Text
              className={css.templateName}
              color={Color.GREY_700}
              font={{ weight: 'bold' }}
              tooltip={template?.name}
            >
              {template?.name}
            </Text>
            {!isNil(template?.tags) && !isEmpty(template?.tags) && <TagsPopover tags={template.tags} />}
            {!isYaml && !isReadonly && (
              <RbacButton
                variation={ButtonVariation.ICON}
                icon="Edit"
                onClick={() => {
                  setModalProps({
                    title: getString('templatesLibrary.createNewModal.editHeading'),
                    promise: onSubmit,
                    onSuccess: () => {
                      hideConfigModal()
                    },
                    disabledFields:
                      templateIdentifier === DefaultNewTemplateId ? [] : [Fields.VersionLabel, Fields.Identifier]
                  })
                  showConfigModal()
                }}
                permission={{
                  permission: PermissionIdentifier.EDIT_TEMPLATE,
                  resource: {
                    resourceType: ResourceType.TEMPLATE
                  }
                }}
              />
            )}
          </Layout.Horizontal>
        </Container>
        {templateIdentifier !== DefaultNewTemplateId && (
          <DropDown
            onChange={item => goToTemplateVersion(item.value.toString())}
            items={versionOptions}
            value={template.versionLabel}
            filterable={false}
            disabled={isReadonly}
            className={css.versionDropDown}
          />
        )}
        {!stableVersion && !isUpdated && !isReadonly && (
          <Button
            onClick={updateStableLabel}
            variation={ButtonVariation.LINK}
            size={ButtonSize.SMALL}
            text={getString('common.setAsDefault')}
          />
        )}
      </Layout.Horizontal>
    </Container>
  )
}
