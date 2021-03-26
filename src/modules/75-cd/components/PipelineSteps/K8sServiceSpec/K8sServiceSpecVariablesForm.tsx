import React from 'react'
import { NestedAccordionPanel } from '@wings-software/uicore'
import cx from 'classnames'
import { isEmpty, omit } from 'lodash-es'

import { useStrings } from 'framework/exports'
import type { ServiceSpec } from 'services/cd-ng'
import type { VariableMergeServiceResponse, YamlProperties } from 'services/pipeline-ng'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type {
  CustomVariablesData,
  CustomVariableEditableExtraProps
} from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableEditable'
import type { AllNGVariables } from '@pipeline/utils/types'

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

export function K8sServiceSpecVariablesForm(props: K8sServiceSpecVariablesFormProps): React.ReactElement {
  const { initialValues, stepsFactory, stageIdentifier, onUpdate, variablesData, metadataMap } = props
  const { manifests, artifacts, variables } = initialValues
  const { getString } = useStrings()

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
                <VariablesListTable
                  data={primaryArtifactVariables}
                  originalData={initialValues?.artifacts?.primary?.spec}
                  metadataMap={metadataMap}
                />

                <div className={cx(css.artifactHeader, css.mtop)}>Sidecar Artifacts</div>
                {Array.isArray(sidecarArtifactVariables) &&
                  sidecarArtifactVariables.map(({ sidecar }, index) => (
                    <VariablesListTable
                      key={index}
                      data={sidecar}
                      originalData={initialValues?.artifacts?.sidecars?.[index] || ({} as any)}
                      metadataMap={metadataMap}
                    />
                  ))}
              </>
            )
          }
        />
      ) : null}
      {manifests && typeof manifestsVariables !== 'string' && !isEmpty(omit(manifestsVariables, 'uuid')) ? (
        <NestedAccordionPanel
          isDefaultOpen
          addDomId
          id={`Stage.${stageIdentifier}.Service.Manifests`}
          summary="Manifests"
          details={
            manifestsVariables && (
              <>
                {manifestsVariables?.map(({ manifest }, index) => (
                  <VariablesListTable
                    key={index}
                    className={css.manifestVariablesTable}
                    data={manifest?.spec?.store?.spec}
                    originalData={initialValues?.manifests?.[index]?.manifest?.spec?.store?.spec}
                    metadataMap={metadataMap}
                  />
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
              variables: (variables || []) as AllNGVariables[],
              canAddVariable: true
            }}
            type={StepType.CustomVariable}
            stepViewType={StepViewType.InputVariable}
            onUpdate={onUpdate}
            customStepProps={{
              variableNamePrefix: 'serviceConfig.variables.',
              className: css.customVariables,
              heading: <b>{getString('customVariables.title')}</b>,
              yamlProperties: (variablesData?.variables as AllNGVariables[])?.map(
                variable => metadataMap?.[variable.value || '']?.yamlProperties || {}
              )
            }}
          />
        }
      />
    </React.Fragment>
  )
}
