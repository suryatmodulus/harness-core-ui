import { useState } from 'react'
import { omit, noop } from 'lodash-es'
import { getErrorInfoFromErrorObject, shouldShowError } from '@wings-software/uicore'
import { useToaster } from '@common/exports'
import { UseSaveSuccessResponse, useSaveToGitDialog } from '@common/modals/SaveToGitDialog/useSaveToGitDialog'
import type { SaveToGitFormInterface } from '@common/components/SaveToGitForm/SaveToGitForm'
import {
  Connector,
  ConnectorConfigDTO,
  ConnectorInfoDTO,
  CreateConnectorQueryParams,
  EntityGitDetails,
  useCreateConnector,
  useUpdateConnector
} from 'services/cd-ng'
import type { ConnectorCreateEditProps } from '@connectors/constants'
import { Entities } from '@common/interfaces/GitSyncInterface'
import { useStrings } from 'framework/strings'

interface UseCreateEditConnector {
  accountId: string
  isEditMode: boolean
  isGitSyncEnabled: boolean
  afterSuccessHandler: (data: any) => void
  gitDetails?: EntityGitDetails
}

interface OnInitiateConnectorCreateEditProps {
  buildPayload: (data: any) => any
  connectorFormData: any
  customHandleCreate?: (payload: ConnectorConfigDTO) => Promise<ConnectorInfoDTO | undefined>
  customHandleUpdate?: (payload: ConnectorConfigDTO) => Promise<ConnectorInfoDTO | undefined>
}

export default function useCreateEditConnector(props: UseCreateEditConnector) {
  const [connectorPayload, setConnectorPayload] = useState<Connector>({})
  const [connectorResponse, setConnectorResponse] = useState<UseSaveSuccessResponse>()
  const [gitDetails, setGitDetails] = useState(props.gitDetails)
  const { showSuccess, showError } = useToaster()
  const { getString } = useStrings()

  const { mutate: createConnector, loading: creating } = useCreateConnector({
    queryParams: { accountIdentifier: props.accountId }
  })
  const { mutate: updateConnector, loading: updating } = useUpdateConnector({
    queryParams: { accountIdentifier: props.accountId }
  })
  //   setLoading(creating || updating)

  const handleCreateOrEdit = async (
    connectorFormData: any,
    payload: ConnectorCreateEditProps,
    objectId?: EntityGitDetails['objectId']
  ): Promise<UseSaveSuccessResponse> => {
    const { gitData } = payload
    const data = payload.payload || connectorPayload
    let queryParams: CreateConnectorQueryParams = {}
    if (gitData) {
      queryParams = {
        accountIdentifier: props.accountId,
        ...omit(gitData, 'sourceBranch')
      }
      if (gitData.isNewBranch) {
        queryParams.baseBranch = connectorFormData?.branch
      }
    }

    const response = props.isEditMode
      ? await updateConnector(data, {
          queryParams: {
            ...queryParams,
            lastObjectId: objectId ?? gitDetails?.objectId
          }
        })
      : await createConnector(data, { queryParams: queryParams })

    setConnectorResponse(response)
    return {
      status: response.status,
      nextCallback: props.afterSuccessHandler.bind(null, response)
    }
  }

  const { openSaveToGitDialog } = useSaveToGitDialog<Connector>({
    onSuccess: (
      gitData: SaveToGitFormInterface,
      payload?: Connector,
      objectId?: string
    ): Promise<UseSaveSuccessResponse> =>
      handleCreateOrEdit(null, { gitData, payload: payload || connectorPayload }, objectId),
    onClose: noop
  })

  return {
    connectorResponse,
    gitDetails,
    connectorPayload,
    loading: creating || updating,
    onInitiate: ({
      connectorFormData,
      buildPayload,
      customHandleCreate,
      customHandleUpdate
    }: OnInitiateConnectorCreateEditProps) => {
      const payload = buildPayload(connectorFormData)
      setConnectorPayload(payload)
      if (props.isGitSyncEnabled) {
        // Using git context set at 1st step while creating new connector
        if (!props.isEditMode) {
          setGitDetails({ ...gitDetails, branch: connectorFormData?.branch, repoIdentifier: connectorFormData?.repo })
        }
        openSaveToGitDialog({
          isEditing: props.isEditMode,
          resource: {
            type: Entities.CONNECTORS,
            name: payload.connector?.name || '',
            identifier: payload.connector?.identifier || '',
            gitDetails: { ...gitDetails, branch: connectorFormData?.branch, repoIdentifier: connectorFormData?.repo }
          },
          payload
        })
      } else {
        {
          if (customHandleUpdate || customHandleCreate) {
            props.isEditMode ? customHandleUpdate?.(payload) : customHandleCreate?.(payload)
          } else {
            handleCreateOrEdit(connectorFormData, { payload: payload }) /* Handling non-git flow */
              .then(res => {
                if (res.status === 'SUCCESS') {
                  props.isEditMode
                    ? showSuccess(getString('connectors.updatedSuccessfully'))
                    : showSuccess(getString('connectors.createdSuccessfully'))

                  res.nextCallback?.()
                }
              })
              .catch(e => {
                if (shouldShowError(e)) {
                  showError(getErrorInfoFromErrorObject(e))
                }
              })
          }
        }
      }
    }
  }
}
