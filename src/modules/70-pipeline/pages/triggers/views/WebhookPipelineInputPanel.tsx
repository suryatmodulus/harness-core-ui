import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Layout, Text, NestedAccordionProvider, HarnessDocTooltip, PageSpinner } from '@wings-software/uicore'
import { parse } from 'yaml'
import { pick, merge, cloneDeep } from 'lodash-es'
import { InputSetSelector, InputSetSelectorProps } from '@pipeline/components/InputSetSelector/InputSetSelector'
import type { PipelineInfoConfig } from 'services/cd-ng'
import {
  useGetTemplateFromPipeline,
  getInputSetForPipelinePromise,
  useGetMergeInputSetFromPipelineTemplateWithListInput
} from 'services/pipeline-ng'
import { PipelineInputSetForm } from '@pipeline/components/PipelineInputSetForm/PipelineInputSetForm'
import { useStrings } from 'framework/strings'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import { clearRuntimeInput } from '@pipeline/components/PipelineStudio/StepUtil'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useMutateAsGet } from '@common/hooks'
import {
  ciCodebaseBuild,
  ciCodebaseBuildPullRequest,
  filterArtifactIndex,
  getFilteredStage,
  TriggerTypes,
  eventTypes
} from '../utils/TriggersWizardPageUtils'
import css from './WebhookPipelineInputPanel.module.scss'

interface WebhookPipelineInputPanelPropsInterface {
  formikProps?: any
}

let hasEverRendered = false

const applyArtifactToPipeline = (newPipelineObject: any, formikProps: any) => {
  const artifactIndex = filterArtifactIndex({
    runtimeData: newPipelineObject?.stages,
    stageId: formikProps?.values?.stageId,
    artifactId: formikProps?.values?.selectedArtifact?.identifier,
    isManifest: false
  })
  const filteredStage = getFilteredStage(newPipelineObject?.stages, formikProps?.values?.stageId)
  if (artifactIndex >= 0) {
    const selectedArtifact = {
      sidecar: {
        identifier: formikProps?.values?.selectedArtifact?.identifier,
        type: formikProps?.values?.selectedArtifact?.type,
        spec: {
          ...formikProps?.values?.selectedArtifact?.spec
        }
      }
    }

    const filteredStageArtifacts =
      filteredStage.stage?.spec?.serviceConfig?.serviceDefinition?.spec?.artifacts?.sidecars
    filteredStageArtifacts[artifactIndex] = selectedArtifact
  } else if (artifactIndex < 0) {
    const selectedArtifact = {
      identifier: formikProps?.values?.selectedArtifact?.identifier,
      type: formikProps?.values?.selectedArtifact?.type,
      spec: {
        ...formikProps?.values?.selectedArtifact?.spec
      }
    }

    const filteredStageArtifacts = filteredStage.stage?.spec?.serviceConfig?.serviceDefinition?.spec?.artifacts
    filteredStageArtifacts.primary = selectedArtifact
  }
  return newPipelineObject
}
// Selected Artifact is applied to inputYaml on Pipeline Input Panel in ManifestInputForm.tsx
// This is to apply the selected artifact values
// to the applied input sets pipeline stage values
const applySelectedArtifactToPipelineObject = (pipelineObj: any, formikProps: any) => {
  // Cloning or making into a new object
  // so the original pipeline is not effected
  const newPipelineObject = { ...pipelineObj }
  if (!newPipelineObject) {
    return {}
  }

  const { triggerType } = formikProps.values

  if (triggerType === TriggerTypes.MANIFEST) {
    const artifactIndex = filterArtifactIndex({
      runtimeData: newPipelineObject?.stages,
      stageId: formikProps?.values?.stageId,
      artifactId: formikProps?.values?.selectedArtifact?.identifier,
      isManifest: true
    })
    if (artifactIndex >= 0) {
      const filteredStage =
        (newPipelineObject?.stages || []).find(
          (stage: any) => stage.stage.identifier === formikProps?.values?.stageId
        ) || {}

      const selectedArtifact = {
        manifest: {
          identifier: formikProps?.values?.selectedArtifact?.identifier,
          type: formikProps?.values?.selectedArtifact?.type,
          spec: {
            ...formikProps?.values?.selectedArtifact?.spec
          }
        }
      }

      const filteredStageManifests = filteredStage.stage?.spec?.serviceConfig?.serviceDefinition?.spec?.manifests
      filteredStageManifests[artifactIndex] = selectedArtifact
    }
  } else if (triggerType === TriggerTypes.ARTIFACT && newPipelineObject) {
    return applyArtifactToPipeline(newPipelineObject, formikProps)
  }
  return newPipelineObject
}

const WebhookPipelineInputPanelForm: React.FC<WebhookPipelineInputPanelPropsInterface> = ({
  formikProps
}): JSX.Element => {
  const {
    values: { inputSetSelected, pipeline, originalPipeline },
    values
  } = formikProps

  const { orgIdentifier, accountId, projectIdentifier, pipelineIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
    pipelineIdentifier: string
    triggerIdentifier: string
  }>()
  const { data: template, loading } = useMutateAsGet(useGetTemplateFromPipeline, {
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      pipelineIdentifier,
      projectIdentifier
    },
    body: {
      stageIdentifiers: []
    }
  })
  const [selectedInputSets, setSelectedInputSets] = useState<InputSetSelectorProps['value']>(inputSetSelected)
  const { getString } = useStrings()

  useEffect(() => {
    if (!hasEverRendered) {
      const formikValues = cloneDeep(formikProps.values)

      if (formikValues.event === eventTypes.PULL_REQUEST) {
        formikValues.pipeline = {
          ...formikValues.pipeline,
          properties: {
            ci: {
              codebase: {
                build: ciCodebaseBuildPullRequest
              }
            }
          }
        }
      } else {
        formikValues.pipeline = {
          ...formikValues.pipeline,
          properties: {
            ci: {
              codebase: {
                build: ciCodebaseBuild
              }
            }
          }
        }
      }

      formikProps.setValues(formikValues)
    }

    hasEverRendered = true
  }, [hasEverRendered])

  useEffect(() => {
    setSelectedInputSets(inputSetSelected)
  }, [inputSetSelected])

  const { mutate: mergeInputSet } = useGetMergeInputSetFromPipelineTemplateWithListInput({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      pipelineIdentifier
    }
  })

  useEffect(() => {
    if (template?.data?.inputSetTemplateYaml) {
      if ((selectedInputSets && selectedInputSets.length > 1) || selectedInputSets?.[0]?.type === 'OVERLAY_INPUT_SET') {
        const fetchData = async (): Promise<void> => {
          const data = await mergeInputSet({
            inputSetReferences: selectedInputSets.map(item => item.value as string)
          })
          if (data?.data?.pipelineYaml) {
            const pipelineObject = parse(data.data.pipelineYaml) as {
              pipeline: PipelineInfoConfig | any
            }
            const newPipelineObject = applySelectedArtifactToPipelineObject(pipelineObject.pipeline, formikProps)
            formikProps.setValues({
              ...values,
              inputSetSelected: selectedInputSets,
              pipeline: clearRuntimeInput(merge(pipeline, newPipelineObject))
            })
          }
        }
        fetchData()
      } else if (selectedInputSets && selectedInputSets.length === 1) {
        const fetchData = async (): Promise<void> => {
          const data = await getInputSetForPipelinePromise({
            inputSetIdentifier: selectedInputSets[0].value as string,
            queryParams: {
              accountIdentifier: accountId,
              projectIdentifier,
              orgIdentifier,
              pipelineIdentifier
            }
          })
          if (data?.data?.inputSetYaml) {
            if (selectedInputSets[0].type === 'INPUT_SET') {
              const pipelineObject = pick(parse(data.data.inputSetYaml)?.inputSet, 'pipeline') as {
                pipeline: PipelineInfoConfig | any
              }

              const newPipelineObject = applySelectedArtifactToPipelineObject(pipelineObject.pipeline, formikProps)

              formikProps.setValues({
                ...values,
                inputSetSelected: selectedInputSets,
                pipeline: clearRuntimeInput(merge(pipeline, newPipelineObject))
              })
            }
          }
        }
        fetchData()
      }
    }
  }, [
    template?.data?.inputSetTemplateYaml,
    selectedInputSets?.length,
    selectedInputSets,
    accountId,
    projectIdentifier,
    orgIdentifier,
    pipelineIdentifier
  ])

  return (
    <Layout.Vertical className={css.webhookPipelineInputContainer} spacing="large" padding="none">
      {loading && (
        <div style={{ position: 'relative', height: 'calc(100vh - 128px)' }}>
          <PageSpinner />
        </div>
      )}
      {pipeline && template?.data?.inputSetTemplateYaml ? (
        <div className={css.inputsetGrid}>
          <div className={css.inputSetContent}>
            <div className={css.pipelineInputRow}>
              <Text className={css.formContentTitle} inline={true} data-tooltip-id="pipelineInputLabel">
                {getString('pipeline.triggers.pipelineInputLabel')}
                <HarnessDocTooltip tooltipId="pipelineInputLabel" useStandAlone={true} />
              </Text>
              <GitSyncStoreProvider>
                <InputSetSelector
                  pipelineIdentifier={pipelineIdentifier}
                  onChange={value => {
                    setSelectedInputSets(value)
                  }}
                  value={selectedInputSets}
                  selectedValueClass={css.inputSetSelectedValue}
                />
              </GitSyncStoreProvider>
              <div className={css.divider} />
            </div>
            <PipelineInputSetForm
              originalPipeline={originalPipeline}
              template={
                (template?.data?.inputSetTemplateYaml && parse(template.data.inputSetTemplateYaml).pipeline) || {}
              }
              path="pipeline"
              viewType={StepViewType.InputSet}
              maybeContainerClass={css.pipelineInputSetForm}
            />
          </div>
        </div>
      ) : (
        <Layout.Vertical style={{ padding: '0 var(--spacing-small)' }} margin="large" spacing="large">
          <Text className={css.formContentTitle} inline={true} data-tooltip-id="pipelineInputLabel">
            {getString('pipeline.triggers.pipelineInputLabel')}
          </Text>
          <HarnessDocTooltip tooltipId="pipelineInputLabel" useStandAlone={true} />
          <Layout.Vertical className={css.formContent}>
            <Text>{getString('pipeline.triggers.pipelineInputPanel.noRuntimeInputs')}</Text>
          </Layout.Vertical>
        </Layout.Vertical>
      )}
    </Layout.Vertical>
  )
}

const WebhookPipelineInputPanel: React.FC<WebhookPipelineInputPanelPropsInterface> = props => {
  return (
    <NestedAccordionProvider>
      <WebhookPipelineInputPanelForm {...props} />
    </NestedAccordionProvider>
  )
}
export default WebhookPipelineInputPanel
