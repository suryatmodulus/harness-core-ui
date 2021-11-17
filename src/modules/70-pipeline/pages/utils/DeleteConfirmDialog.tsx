import React, { useState } from 'react'
import { defaultTo, pick } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { Intent, TextArea } from '@blueprintjs/core'
import { Text, useConfirmationDialog, useToaster } from '@wings-software/uicore'
import { EntityGitDetails, useDeleteInputSetForPipeline, useSoftDeletePipeline } from 'services/pipeline-ng'
import { useStrings } from 'framework/strings'
import { useDeleteTemplateVersionsOfIdentifier } from 'services/template-ng'
import type { ResponseBoolean } from 'services/cd-ng'
import type { PipelineDTO } from '../pipelines/views/PipelineListView'
import type { InputSetLocal } from '../inputSet-list/InputSetListView'

const useGetEntityText = (entityType: string): string => {
  const { getString } = useStrings()

  switch (entityType) {
    case 'pipeline':
      return getString('common.pipeline')
    case 'inputSet':
      return getString('inputSets.inputSetLabel')
    case 'overlayInputSet':
      return getString('inputSets.overlayInputSet')
    default:
      return ''
  }
}
interface DeleteConfirmDialogContentProps {
  gitDetails?: EntityGitDetails
  entityName: string
  commitMsg: string
  onCommitMsgChange: (commitMsg: string) => void
  entityType: string
}

export const DeleteConfirmDialogContent: React.FC<DeleteConfirmDialogContentProps> = ({
  gitDetails = {},
  entityName = '',
  commitMsg,
  onCommitMsgChange,
  entityType = ''
}): JSX.Element => {
  const { getString } = useStrings()
  return (
    <div className={'pipelineDeleteDialog'}>
      <Text margin={{ bottom: 'medium' }} title={entityName}>{`${getString(
        'common.git.confirmDelete'
      )} ${useGetEntityText(entityType)} ${entityName}?`}</Text>
      {gitDetails?.objectId && (
        <>
          <Text>{getString('common.git.commitMessage')}</Text>
          <TextArea
            value={commitMsg}
            onInput={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
              onCommitMsgChange(event.target.value)
            }}
          />
        </>
      )}
    </div>
  )
}

interface DeleteMetaData {
  versions?: string[]
}

export default function useDeleteConfirmationDialog(
  entityData: PipelineDTO | InputSetLocal,
  entityType: string,
  refetchData?: () => void,
  pipelineIdentifier = '',
  setLoading?: (isLoading: boolean) => void
): { confirmDelete: (deleteMetaData?: DeleteMetaData) => void } {
  const { showSuccess, showError } = useToaster()
  const { getString } = useStrings()

  const { projectIdentifier, orgIdentifier, accountId } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()

  const [deleteCallMetaData, setDeleteCallMetaData] = useState<DeleteMetaData>()

  const getSuccessMessage = (): string => {
    switch (entityType) {
      case 'pipeline':
        return getString('pipeline-list.pipelineDeleted', { name: entityData.name })
      case 'inputSet':
      case 'overlayInputSet':
        return getString('inputSets.inputSetDeleted', { name: entityData.name })
      case 'template':
        return getString('common.template.deleteTemplate.templatesDeleted', { name: entityData.name })
      default:
        return ''
    }
  }

  const getErrorMessage = (): string => {
    switch (entityType) {
      case 'pipeline':
        return `pipeline.delete.pipeline.error`
      case 'inputSet':
      case 'overlayInputSet':
        return `pipeline.delete.inputset.error`
      case 'template':
        return `common.template.deleteTemplate.errorWhileDeleting`
      default:
        return ''
    }
  }

  const [commitMsg, setCommitMsg] = React.useState<string>(`${getString('delete')} ${entityData.name}`)

  const gitParams = entityData.gitDetails?.objectId
    ? {
        ...pick(entityData.gitDetails, ['branch', 'repoIdentifier', 'filePath', 'rootFolder']),
        commitMsg,
        lastObjectId: entityData.gitDetails?.objectId
      }
    : {}

  const { mutate: deletePipeline } = useSoftDeletePipeline({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      ...gitParams
    }
  })

  const { mutate: deleteInputSet } = useDeleteInputSetForPipeline({
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier, pipelineIdentifier, ...gitParams }
  })

  const { mutate: deleteTemplates } = useDeleteTemplateVersionsOfIdentifier({})

  const deleteEntity = async (): Promise<ResponseBoolean> => {
    const contentType = 'application/json'
    let deleted = null
    if (entityType === 'pipeline') {
      deleted = await deletePipeline(entityData.identifier || /* istanbul ignore next */ '', {
        headers: { 'content-type': contentType }
      })
    } else if (entityType === 'template') {
      deleted = await deleteTemplates(defaultTo(entityData?.identifier, ''), {
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier,
          ...gitParams
        },
        body: JSON.stringify({ templateVersionLabels: deleteCallMetaData?.versions }),
        headers: { 'content-type': contentType }
      })
    } else {
      deleted = await deleteInputSet(entityData.identifier || /* istanbul ignore next */ '', {
        headers: { 'content-type': contentType }
      })
    }
    return deleted
  }

  const { openDialog: openConfirmDeleteDialog } = useConfirmationDialog({
    contentText: (
      <DeleteConfirmDialogContent
        entityName={entityData?.name || ''}
        entityType={entityType}
        gitDetails={entityData.gitDetails}
        commitMsg={commitMsg}
        onCommitMsgChange={setCommitMsg}
      />
    ),
    titleText: `${getString('delete')} ${useGetEntityText(entityType)}`,
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    intent: Intent.DANGER,
    buttonIntent: Intent.DANGER,
    onCloseDialog: async (isConfirmed: boolean) => {
      /* istanbul ignore else */
      if (isConfirmed) {
        try {
          setLoading?.(true)
          const deleted = await deleteEntity()
          setLoading?.(false)
          /* istanbul ignore else */
          if (deleted?.status === 'SUCCESS') {
            showSuccess(getSuccessMessage())
          } else {
            throw getString('somethingWentWrong')
          }
          refetchData?.()
        } catch (err) {
          /* istanbul ignore next */
          showError(err?.data?.message || err?.message, undefined, getErrorMessage())
        }
      }
    }
  })

  const confirmDelete = (deleteMetaData?: DeleteMetaData): void => {
    setDeleteCallMetaData(deleteMetaData)
    openConfirmDeleteDialog()
  }
  return { confirmDelete }
}
