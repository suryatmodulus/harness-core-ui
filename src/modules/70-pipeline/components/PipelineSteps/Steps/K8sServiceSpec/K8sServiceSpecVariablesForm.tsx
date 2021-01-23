import React from 'react'
import { NestedAccordionPanel, Text } from '@wings-software/uicore'
import cx from 'classnames'
import { isEmpty, omit } from 'lodash-es'
import type { ServiceSpec } from 'services/cd-ng'
import type { VariableMergeServiceResponse, YamlProperties } from 'services/pipeline-ng'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import { CopyText } from '@common/components/CopyText/CopyText'
import { toVariableStr } from '@common/utils/StringUtils'
import type { CustomVariablesData, CustomVariableEditableExtraProps } from '../CustomVariables/CustomVariableEditable'
import variableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'
import css from './K8sServiceSpec.module.scss'
export interface K8sServiceSpecVariablesFormProps {
  initialValues: ServiceSpec
  stepsFactory: AbstractStepFactory
  stageIdentifier: string
  onUpdate?(data: ServiceSpec): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: ServiceSpec
}
export interface VariableRowProps {
  data?: YamlProperties | undefined
  valueType?: string
  value: string
}
function VariableRow(props: VariableRowProps): React.ReactElement {
  const { data, valueType = 'String', value } = props

  return (
    <div className={variableCss.variableListTable}>
      <>
        <CopyText textToCopy={data?.fqn || ''}>{toVariableStr(data?.localName || '')}</CopyText>
        <Text>{valueType}</Text>
        <Text lineClamp={2} width={280}>
          {value}
        </Text>
      </>
    </div>
  )
}

export function K8sServiceSpecVariablesForm(props: K8sServiceSpecVariablesFormProps): React.ReactElement {
  const { initialValues, stepsFactory, stageIdentifier, onUpdate, variablesData, metadataMap } = props
  const { manifests, artifacts, variables } = initialValues

  const primaryArtifactVariables = variablesData?.artifacts?.primary?.spec
  const sidecarArtifactVariables = variablesData?.artifacts?.sidecars
  const manifestsVariables = variablesData.manifests

  return (
    <React.Fragment>
      {artifacts && !isEmpty(omit(variablesData?.artifacts, 'uuid')) ? (
        <NestedAccordionPanel
          isDefaultOpen
          addDomId
          id={`Stage.${stageIdentifier}.Service.Artifacts`}
          summary="Artifacts"
          details={
            variablesData?.artifacts && (
              <>
                <div className={css.artifactHeader}>Primary Artifact</div>
                {primaryArtifactVariables?.connectorRef && (
                  <VariableRow
                    data={metadataMap[(primaryArtifactVariables?.connectorRef as unknown) as string]?.yamlProperties}
                    value={initialValues.artifacts?.primary?.spec?.connectorRef}
                  />
                )}
                {primaryArtifactVariables?.imagePath && (
                  <VariableRow
                    data={metadataMap[(primaryArtifactVariables?.imagePath as unknown) as string]?.yamlProperties}
                    value={initialValues.artifacts?.primary?.spec?.imagePath}
                  />
                )}
                {primaryArtifactVariables?.tag && (
                  <VariableRow
                    data={metadataMap[(primaryArtifactVariables?.tag as unknown) as string]?.yamlProperties}
                    value={initialValues.artifacts?.primary?.spec?.tag}
                  />
                )}
                {primaryArtifactVariables?.tagRegex && (
                  <VariableRow
                    data={metadataMap[(primaryArtifactVariables?.tagRegex as unknown) as string]?.yamlProperties}
                    value={initialValues.artifacts?.primary?.spec?.tagRegex}
                  />
                )}

                <div className={cx(css.artifactHeader, css.mtop)}>Sidecar Artifacts</div>
                {Array.isArray(sidecarArtifactVariables) &&
                  sidecarArtifactVariables?.map(({ sidecar }, index) => (
                    <div key={index}>
                      <VariableRow
                        data={metadataMap[(sidecar?.spec?.connectorRef as unknown) as string]?.yamlProperties}
                        value={initialValues.artifacts?.sidecars?.[index]?.sidecar?.spec?.connectorRef}
                      />
                      <VariableRow
                        data={metadataMap[(sidecar?.spec?.imagePath as unknown) as string]?.yamlProperties}
                        value={initialValues.artifacts?.sidecars?.[index]?.sidecar?.spec?.imagePath}
                      />
                      {sidecar?.spec?.tag && (
                        <VariableRow
                          data={metadataMap[(sidecar?.spec?.tag as unknown) as string]?.yamlProperties}
                          value={initialValues.artifacts?.sidecars?.[index]?.sidecar?.spec?.tag}
                        />
                      )}
                      {sidecar?.spec?.tagRegex && (
                        <VariableRow
                          data={metadataMap[(sidecar?.spec?.tagRegex as unknown) as string]?.yamlProperties}
                          value={initialValues.artifacts?.sidecars?.[index]?.sidecar?.spec?.tagRegex}
                        />
                      )}
                    </div>
                  ))}
              </>
            )
          }
        />
      ) : null}
      {manifests && !isEmpty(omit(manifestsVariables, 'uuid')) ? (
        <NestedAccordionPanel
          isDefaultOpen
          addDomId
          id={`Stage.${stageIdentifier}.Service.Manifests`}
          summary="Manifests"
          details={
            manifestsVariables && (
              <>
                {manifestsVariables?.map(({ manifest }, index) => (
                  <div key={index}>
                    <VariableRow
                      data={
                        metadataMap[(manifest?.spec?.store?.spec?.connectorRef as unknown) as string]?.yamlProperties
                      }
                      value={initialValues.manifests?.[index]?.manifest?.spec?.store?.spec?.connectorRef}
                    />
                    <VariableRow
                      data={metadataMap[(manifest?.spec?.store?.spec?.branch as unknown) as string]?.yamlProperties}
                      value={initialValues.manifests?.[index]?.manifest?.spec?.store?.spec?.branch}
                    />
                    {
                      <VariableRow
                        data={
                          metadataMap[(manifest?.spec?.store?.spec?.gitFetchType as unknown) as string]?.yamlProperties
                        }
                        value={initialValues.manifests?.[index]?.manifest?.spec?.store?.spec?.gitFetchType}
                      />
                    }
                    {manifest?.spec?.store?.spec?.paths && (
                      <VariableRow
                        data={metadataMap[(manifest?.spec?.store?.spec?.paths as unknown) as string]?.yamlProperties}
                        value={initialValues.manifests?.[index]?.manifest?.spec?.store?.spec?.paths?.join(' , ')}
                      />
                    )}
                  </div>
                ))}
              </>
            )
          }
        />
      ) : null}
      <NestedAccordionPanel
        isDefaultOpen
        addDomId
        id={`Stage.${stageIdentifier}.Service.Variables`}
        summary="Variables"
        details={
          <StepWidget<CustomVariablesData, CustomVariableEditableExtraProps>
            factory={stepsFactory}
            initialValues={{
              variables: variables || [],
              canAddVariable: true
            }}
            type={StepType.CustomVariable}
            stepViewType={StepViewType.InputVariable}
            onUpdate={onUpdate}
            customStepProps={{
              variableNamePrefix: 'serviceConfig.variables.',
              yamlProperties: variablesData?.variables?.map(
                variable => metadataMap?.[variable.value || '']?.yamlProperties || {}
              )
            }}
          />
        }
      />
    </React.Fragment>
  )
}
