import React from 'react'
import { cloneDeep, defaultTo, isEmpty, omit } from 'lodash-es'
import { parse } from 'yaml'
import { useHistory, useParams } from 'react-router-dom'
import {
  createTemplatePromise,
  EntityGitDetails,
  NGTemplateInfoConfig,
  updateExistingTemplateLabelPromise
} from 'services/template-ng'
import { SelectedView } from '@common/components/VisualYamlToggle/VisualYamlToggle'
import { AppStoreContext } from 'framework/AppStore/AppStoreContext'
import { useStrings } from 'framework/strings'
import { useToaster } from '@common/exports'
import { UseSaveSuccessResponse, useSaveToGitDialog } from '@common/modals/SaveToGitDialog/useSaveToGitDialog'
import type { SaveToGitFormInterface } from '@common/components/SaveToGitForm/SaveToGitForm'
import { DefaultNewTemplateId } from 'framework/Templates/templates'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import routes from '@common/RouteDefinitions'
import type { GitQueryParams, ModulePathParams, TemplateStudioPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import type { PromiseExtraArgs } from 'framework/Templates/TemplateConfigModal/TemplateConfigModal'
import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'

export interface FetchTemplateUnboundProps {
  forceFetch?: boolean
  forceUpdate?: boolean
  signal?: AbortSignal
  repoIdentifier?: string
  branch?: string
}

interface SaveTemplateObj {
  template: NGTemplateInfoConfig
}

interface UseSaveTemplateReturnType {
  saveAndPublish: (
    updatedTemplate: NGTemplateInfoConfig,
    extraInfo: PromiseExtraArgs,
    comments?: string
  ) => Promise<void>
  updateExistingLabel: (comments: string) => Promise<UseSaveSuccessResponse>
}

interface TemplateContextMetadata {
  template: NGTemplateInfoConfig
  yamlHandler?: YamlBuilderHandlerBinding
  gitDetails: EntityGitDetails
  setLoading?: (loading: boolean) => void
  fetchTemplate?: (args: FetchTemplateUnboundProps) => Promise<void>
  deleteTemplateCache?: (gitDetails?: EntityGitDetails) => Promise<void>
  view?: string
  isPipelineStudio?: boolean
}

export function useSaveTemplate(
  TemplateContextMetadata: TemplateContextMetadata,
  hideConfigModal?: () => void,
  hideCommentsModal?: () => void
): UseSaveTemplateReturnType {
  const { template, yamlHandler, gitDetails, setLoading, fetchTemplate, deleteTemplateCache, view, isPipelineStudio } =
    TemplateContextMetadata
  const { isGitSyncEnabled } = React.useContext(AppStoreContext)
  const { templateIdentifier, templateType, projectIdentifier, orgIdentifier, accountId, module } = useParams<
    TemplateStudioPathProps & ModulePathParams
  >()
  const { branch } = useQueryParams<GitQueryParams>()
  const { getString } = useStrings()
  const { showSuccess, showError, clear } = useToaster()
  const history = useHistory()
  const [updatedComments, setUpdatedComments] = React.useState<string | undefined>('')

  const isYaml = view === SelectedView.YAML

  const navigateToLocation = (
    newTemplateId: string,
    versionLabel: string,
    updatedGitDetails?: SaveToGitFormInterface
  ): void => {
    history.replace(
      routes.toTemplateStudio({
        projectIdentifier,
        orgIdentifier,
        accountId,
        module,
        templateType: templateType,
        templateIdentifier: newTemplateId,
        versionLabel: versionLabel,
        repoIdentifier: updatedGitDetails?.repoIdentifier,
        branch: updatedGitDetails?.branch
      })
    )
  }

  const updateExistingLabel = async (
    comments?: string,
    updatedGitDetails?: SaveToGitFormInterface,
    lastObject?: { lastObjectId?: string }
  ): Promise<UseSaveSuccessResponse> => {
    const response = await updateExistingTemplateLabelPromise({
      templateIdentifier: template.identifier,
      versionLabel: template.versionLabel,
      body: yamlStringify({ template: omit(cloneDeep(template), 'repo', 'branch') }),
      queryParams: {
        accountIdentifier: accountId,
        projectIdentifier,
        orgIdentifier,
        comments,
        ...(updatedGitDetails ?? {}),
        ...(lastObject?.lastObjectId ? lastObject : {}),
        ...(updatedGitDetails && updatedGitDetails.isNewBranch ? { baseBranch: branch } : {})
      },
      requestOptions: { headers: { 'Content-Type': 'application/yaml' } }
    })
    hideCommentsModal?.()
    if (response && response.status === 'SUCCESS') {
      setLoading?.(false)
      clear()
      if (!isGitSyncEnabled) {
        showSuccess(getString('common.template.updateTemplate.templateUpdated'))
      }
      await fetchTemplate?.({ forceFetch: true, forceUpdate: true })
      if (updatedGitDetails?.isNewBranch) {
        navigateToLocation(template.identifier, template.versionLabel, updatedGitDetails)
        location.reload()
      }
    } else {
      setLoading?.(false)
      clear()
      // This is done because when git sync is enabled, errors are displayed in a modal
      if (!isGitSyncEnabled) {
        showError(
          getString('common.template.updateTemplate.errorWhileUpdating'),
          undefined,
          'template.update.template.error'
        )
      }
      throw response
    }
    return { status: response?.status }
  }

  const saveAndPublishTemplate = async (
    latestTemplate: NGTemplateInfoConfig,
    updatedGitDetails?: SaveToGitFormInterface,
    lastObject?: { lastObjectId?: string },
    isEdit = false
  ): Promise<UseSaveSuccessResponse> => {
    if (isEdit) {
      return updateExistingLabel(updatedComments, updatedGitDetails, lastObject)
    } else {
      const response = await createTemplatePromise({
        body: yamlStringify({ template: omit(cloneDeep(latestTemplate), 'repo', 'branch') }),
        queryParams: {
          accountIdentifier: accountId,
          projectIdentifier,
          orgIdentifier,
          ...(updatedGitDetails ?? {}),
          ...(updatedGitDetails && updatedGitDetails.isNewBranch ? { baseBranch: branch } : {})
        },
        requestOptions: { headers: { 'Content-Type': 'application/yaml' } }
      })
      hideConfigModal?.()
      setLoading?.(false)
      if (response && response.status === 'SUCCESS') {
        clear()
        if (!isGitSyncEnabled) {
          showSuccess(getString('common.template.saveTemplate.publishTemplate'))
        }
        await deleteTemplateCache?.()
        if (!isPipelineStudio) {
          navigateToLocation(latestTemplate.identifier, latestTemplate.versionLabel, updatedGitDetails)
          location.reload()
        }
      } else {
        clear()
        // This is done because when git sync is enabled, errors are displayed in a modal
        if (!isGitSyncEnabled) {
          showError(getString('errorWhileSaving'), undefined, 'template.save.template.error')
        }
        throw response
      }
      return { status: response?.status }
    }
  }

  const saveAngPublishWithGitInfo = async (
    updatedGitDetails: SaveToGitFormInterface,
    payload?: SaveTemplateObj,
    objectId?: string,
    isEdit = false
  ): Promise<UseSaveSuccessResponse> => {
    let latestTemplate: NGTemplateInfoConfig = payload?.template || template

    if (isYaml && yamlHandler) {
      try {
        latestTemplate = payload?.template || (parse(yamlHandler.getLatestYaml()).pipeline as NGTemplateInfoConfig)
      } /* istanbul ignore next */ catch (err) {
        showError(err.message || err, undefined, 'template.save.gitinfo.error')
      }
    }

    const response = await saveAndPublishTemplate(
      latestTemplate,
      omit(updatedGitDetails, 'name', 'identifier'),
      templateIdentifier !== DefaultNewTemplateId ? { lastObjectId: objectId } : {},
      isEdit
    )
    return {
      status: response?.status
    }
  }

  const { openSaveToGitDialog } = useSaveToGitDialog<SaveTemplateObj>({
    onSuccess: (
      gitData: SaveToGitFormInterface,
      payload?: SaveTemplateObj,
      objectId?: string,
      isEdit = false
    ): Promise<UseSaveSuccessResponse> =>
      saveAngPublishWithGitInfo(gitData, payload, objectId || gitDetails?.objectId || '', isEdit),
    onClose: () => setLoading?.(false)
  })

  const saveAndPublish = React.useCallback(
    async (updatedTemplate: NGTemplateInfoConfig, extraInfo: PromiseExtraArgs, comments?: string) => {
      setUpdatedComments(comments)
      setLoading?.(true)
      const { isEdit } = extraInfo
      let latestTemplate: NGTemplateInfoConfig = defaultTo(updatedTemplate, template)

      if (isYaml && yamlHandler) {
        if (!parse(yamlHandler.getLatestYaml())) {
          clear()
          showError(getString('invalidYamlText'))
          return
        }
        try {
          latestTemplate = parse(yamlHandler.getLatestYaml()).template as NGTemplateInfoConfig
        } /* istanbul ignore next */ catch (err) {
          showError(err.message || err, undefined, 'pipeline.save.pipeline.error')
        }
      }

      // if Git sync enabled then display modal
      if (isGitSyncEnabled) {
        if (isEmpty(gitDetails.repoIdentifier) || isEmpty(gitDetails.branch)) {
          clear()
          showError(getString('pipeline.gitExperience.selectRepoBranch'))
          return
        }
        // @TODO - Uncomment below snippet when schema validation is available at BE.
        // When git sync enabled, do not irritate user by taking all git info then at the end showing BE errors related to schema
        // const error = await validateJSONWithSchema({ template: latestTemplate }, templateSchema?.data as any)
        // if (error.size > 0) {
        //   clear()
        //   showError(error)
        //   return
        // }
        // if (isYaml && yamlHandler && !isValidYaml()) {
        //   return
        // }
        openSaveToGitDialog({
          isEditing: defaultTo(isEdit, false),
          resource: {
            type: 'Template',
            name: latestTemplate.name,
            identifier: latestTemplate.identifier,
            gitDetails: gitDetails
              ? { ...gitDetails, filePath: `${latestTemplate.identifier}_${latestTemplate.versionLabel}.yaml` }
              : {}
          },
          payload: { template: omit(latestTemplate, 'repo', 'branch') }
        })
      } else {
        await saveAndPublishTemplate(latestTemplate)
      }
    },
    [template, templateIdentifier, gitDetails, isGitSyncEnabled, isYaml, yamlHandler, showError, showSuccess]
  )

  return {
    saveAndPublish,
    updateExistingLabel
  }
}
