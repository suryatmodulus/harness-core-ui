import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Layout, Heading, Text, NestedAccordionProvider, useNestedAccordion } from '@wings-software/uicore'
import { parse } from 'yaml'
import { pick, merge } from 'lodash-es'
import type { ITreeNode } from '@blueprintjs/core'
import { InputSetSelector, InputSetSelectorProps } from '@pipeline/components/InputSetSelector/InputSetSelector'
import type { NgPipeline } from 'services/cd-ng'
import {
  useGetTemplateFromPipeline,
  getInputSetForPipelinePromise,
  useGetMergeInputSetFromPipelineTemplateWithListInput
} from 'services/pipeline-ng'
import { PipelineInputSetForm } from '@pipeline/components/PipelineInputSetForm/PipelineInputSetForm'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import { useStrings } from 'framework/strings'
import { clearRuntimeInput } from '@pipeline/components/PipelineStudio/StepUtil'
import StagesTree, { stagesTreeNodeClasses } from '@pipeline/components/StagesTree/StagesTree'
import { getPipelineTree } from '@pipeline/components/PipelineStudio/PipelineUtils'
import { isPipelineWithCiCodebase, ciCodebaseBuild } from '../utils/TriggersWizardPageUtils'
import css from './WebhookPipelineInputPanel.module.scss'

interface WebhookPipelineInputPanelPropsInterface {
  formikProps?: any
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
  const { data: template, loading } = useGetTemplateFromPipeline({
    queryParams: { accountIdentifier: accountId, orgIdentifier, pipelineIdentifier, projectIdentifier }
  })
  const [selectedInputSets, setSelectedInputSets] = useState<InputSetSelectorProps['value']>(inputSetSelected)
  const [nodes, updateNodes] = React.useState<ITreeNode[]>([])
  const [selectedTreeNodeId, setSelectedTreeNodeId] = React.useState<string>('')
  const { getString } = useStrings()

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
              pipeline: NgPipeline | any
            }
            if (isPipelineWithCiCodebase(pipelineObject?.pipeline)) {
              pipelineObject.pipeline.properties.ci.codebase.build = ciCodebaseBuild
            }
            formikProps.setValues({
              ...values,
              inputSetSelected: selectedInputSets,
              pipeline: clearRuntimeInput(merge(pipeline, pipelineObject.pipeline))
            })
          }
        }
        fetchData()
      } else if (selectedInputSets && selectedInputSets.length === 1) {
        const fetchData = async (): Promise<void> => {
          const data = await getInputSetForPipelinePromise({
            inputSetIdentifier: selectedInputSets[0].value as string,
            queryParams: { accountIdentifier: accountId, projectIdentifier, orgIdentifier, pipelineIdentifier }
          })
          if (data?.data?.inputSetYaml) {
            if (selectedInputSets[0].type === 'INPUT_SET') {
              const pipelineObject = pick(parse(data.data.inputSetYaml)?.inputSet, 'pipeline') as {
                pipeline: NgPipeline | any
              }

              if (isPipelineWithCiCodebase(pipelineObject?.pipeline)) {
                pipelineObject.pipeline.properties.ci.codebase.build = ciCodebaseBuild
              }

              formikProps.setValues({
                ...values,
                inputSetSelected: selectedInputSets,
                pipeline: clearRuntimeInput(merge(pipeline, pipelineObject.pipeline))
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

  useEffect(() => {
    originalPipeline &&
      updateNodes(
        getPipelineTree(originalPipeline, stagesTreeNodeClasses, getString, {
          hideNonRuntimeFields: true,
          template: parse(template?.data?.inputSetTemplateYaml || '')?.pipeline
        })
      )
  }, [originalPipeline, template])

  const { openNestedPath } = useNestedAccordion()

  const handleSelectionChange = (id: string): void => {
    setSelectedTreeNodeId(id)
    openNestedPath(id)
    document.getElementById(`${id}-panel`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <Layout.Vertical className={css.webhookPipelineInputContainer} spacing="large" padding="none">
      {loading && (
        <div style={{ position: 'relative', height: 'calc(100vh - 128px)' }}>
          <PageSpinner />
        </div>
      )}
      {pipeline && template?.data?.inputSetTemplateYaml ? (
        <div className={css.inputsetGrid}>
          <div className={css.treeSidebar}>
            <StagesTree contents={nodes} selectedId={selectedTreeNodeId} selectionChange={handleSelectionChange} />
          </div>
          <div className={css.inputSetContent}>
            <div className={css.pipelineInputRow}>
              <Heading level={2}>{getString('pipeline.triggers.pipelineInputLabel')}</Heading>
              <InputSetSelector
                pipelineIdentifier={pipelineIdentifier}
                onChange={value => {
                  setSelectedInputSets(value)
                }}
                value={selectedInputSets}
              />
            </div>
            <PipelineInputSetForm
              originalPipeline={originalPipeline}
              template={
                (template?.data?.inputSetTemplateYaml && parse(template.data.inputSetTemplateYaml).pipeline) || {}
              }
              path="pipeline"
            />
          </div>
        </div>
      ) : (
        <Layout.Vertical style={{ padding: '0 var(--spacing-small)' }} margin="large" spacing="large">
          <h2 className={css.heading} style={{ marginTop: '0!important' }}>
            {getString('pipeline.triggers.pipelineInputLabel')}
          </h2>
          <Text>{getString('pipeline.triggers.pipelineInputPanel.noRuntimeInputs')}</Text>
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
