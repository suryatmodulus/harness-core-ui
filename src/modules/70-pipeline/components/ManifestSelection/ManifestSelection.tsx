import React from 'react'
import { Layout, Text } from '@wings-software/uicore'

import { useParams } from 'react-router-dom'
import { get } from 'lodash-es'
import { useGetConnectorListV2, PageConnectorResponse } from 'services/cd-ng'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'

// import { PredefinedOverrideSets } from '@pipeline/components/PredefinedOverrideSets/PredefinedOverrideSets'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import { getIdentifierFromValue, getScopeFromValue } from '@common/components/EntityReference/EntityReference'

import { useStrings } from 'framework/strings'
import type { ManifestSelectionProps } from './ManifestInterface'
import ManifestListView from './ManifestListView'

export default function ManifestSelection({
  isForOverrideSets = false,
  identifierName,
  isForPredefinedSets = false,
  isPropagating,
  overrideSetIdentifier
}: ManifestSelectionProps): JSX.Element {
  const {
    state: {
      pipeline,
      selectionState: { selectedStageId }
    },
    getStageFromPipeline,
    updateStage,
    isReadonly
  } = React.useContext(PipelineContext)

  const { stage } = getStageFromPipeline(selectedStageId || '')
  const getManifestList = React.useCallback(() => {
    if (isPropagating) {
      return get(stage, 'stage.spec.service.stageOverrides.manifests', [])
    }
    return !isForOverrideSets
      ? !isForPredefinedSets
        ? get(stage, 'stage.spec.serviceConfig.serviceDefinition.spec.manifests', [])
        : get(stage, 'stage.spec.service.stageOverrides.manifests', [])
      : get(stage, 'stage.spec.serviceConfig.serviceDefinition.spec.manifestOverrideSets', [])
  }, [stage])

  let listOfManifests = getManifestList()
  if (isForOverrideSets) {
    listOfManifests = listOfManifests
      .map((overrideSets: { overrideSet: { identifier: string; manifests: [Record<string, any>] } }) => {
        if (overrideSets.overrideSet.identifier === identifierName) {
          return overrideSets.overrideSet.manifests
        }
      })
      .filter((x: { overrideSet: { identifier: string; manifests: [Record<string, any>] } }) => x !== undefined)[0]
  }

  const [fetchedConnectorResponse, setFetchedConnectorResponse] = React.useState<PageConnectorResponse | undefined>()

  const { accountId, orgIdentifier, projectIdentifier } = useParams<
    PipelineType<{
      orgIdentifier: string
      projectIdentifier: string
      accountId: string
    }>
  >()
  const defaultQueryParams = {
    pageIndex: 0,
    pageSize: 10,
    searchTerm: '',
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    includeAllConnectorsAvailableAtScope: true
  }
  const { mutate: fetchConnectors } = useGetConnectorListV2({
    queryParams: defaultQueryParams
  })

  const getConnectorList = () => {
    return listOfManifests
      ? listOfManifests &&
          listOfManifests.map(
            (data: {
              manifest: {
                identifier: string
                type: string
                spec: {
                  store: {
                    type: string
                    spec: {
                      connectorRef: string
                      gitFetchType: string
                      branch: string
                      commitId: string
                      paths: string[]
                    }
                  }
                }
              }
            }) => ({
              scope: getScopeFromValue(data?.manifest?.spec?.store?.spec?.connectorRef),
              identifier: getIdentifierFromValue(data?.manifest?.spec?.store?.spec?.connectorRef)
            })
          )
      : []
  }

  const refetchConnectorList = async (): Promise<void> => {
    const connectorList = getConnectorList()
    const connectorIdentifiers = connectorList.map((item: { scope: string; identifier: string }) => item.identifier)
    const { data: connectorResponse } = await fetchConnectors({ filterType: 'Connector', connectorIdentifiers })
    setFetchedConnectorResponse(connectorResponse)
  }

  const { getString } = useStrings()

  React.useEffect(() => {
    refetchConnectorList()
  }, [stage])

  return (
    <Layout.Vertical>
      {/* {isForPredefinedSets && <PredefinedOverrideSets context="MANIFEST" currentStage={stage} />} //disabled for now */}
      {overrideSetIdentifier?.length === 0 && !isForOverrideSets && (
        <Text style={{ color: 'var(--grey-500)', lineHeight: '24px' }}>{getString('manifestSelectionInfo')}</Text>
      )}

      <ManifestListView
        isPropagating={isPropagating}
        pipeline={pipeline}
        updateStage={updateStage}
        stage={stage}
        isForOverrideSets={isForOverrideSets}
        identifierName={identifierName}
        isForPredefinedSets={isForPredefinedSets}
        overrideSetIdentifier={overrideSetIdentifier}
        connectors={fetchedConnectorResponse}
        refetchConnectors={refetchConnectorList}
        isReadonly={isReadonly}
      />
    </Layout.Vertical>
  )
}
