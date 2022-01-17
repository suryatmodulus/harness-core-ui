/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Spinner } from '@blueprintjs/core'
import { Field, FormikProps } from 'formik'
import { Container, Formik, FormikForm, FormInput } from '@wings-software/uicore'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useStrings } from 'framework/strings'
import { DrawerTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import { AdvancedPanels } from '@pipeline/components/PipelineStudio/StepCommands/StepCommandTypes'
import ExecutionGraph, {
  ExecutionGraphAddStepEvent,
  ExecutionGraphEditStepEvent,
  ExecutionGraphRefObj
} from '@pipeline/components/PipelineStudio/ExecutionGraph/ExecutionGraph'
import {
  getInitialValuesInCorrectFormat,
  getFormValuesInCorrectFormat
} from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import { transformValuesFieldsConfig } from './InfraProvisioningFunctionConfigs'
import type { InfraProvisioningData, InfraProvisioningDataUI, InfraProvisioningProps } from './InfraProvisioning'
import useChooseProvisioner from './ChooseProvisioner'

import css from './InfraProvisioning.module.scss'

export const InfraProvisioningBase = (
  { initialValues, onUpdate, onChange }: InfraProvisioningProps,
  _formikRef: StepFormikFowardRef<InfraProvisioningData>
): JSX.Element => {
  const {
    stepsFactory,
    state: {
      pipelineView,
      selectionState: { selectedStageId = '' },
      templateTypes
    },
    updatePipelineView,
    isReadonly,
    getStagePathFromPipeline
  } = usePipelineContext()

  const { getString } = useStrings()
  const stagePath = getStagePathFromPipeline(selectedStageId || '', 'pipeline.stages')

  const executionRef = React.useRef<ExecutionGraphRefObj | null>(null)
  const { showModal, hideModal } = useChooseProvisioner({
    onSubmit: (data: any) => {
      onUpdate?.(data)
      //  setTypeEnabled(true)
    },
    onClose: () => {
      hideModal()
    }
  })

  return (
    <Formik
      enableReinitialize={true}
      initialValues={getInitialValuesInCorrectFormat<InfraProvisioningData, InfraProvisioningDataUI>(
        initialValues,
        transformValuesFieldsConfig
      )}
      formName="infraProvisionerBase"
      validate={(_values: InfraProvisioningDataUI) => {
        const schemaValues = getFormValuesInCorrectFormat<InfraProvisioningDataUI, InfraProvisioningData>(
          _values,
          transformValuesFieldsConfig
        )
        onChange?.(schemaValues)
      }}
      onSubmit={(_values: InfraProvisioningDataUI) => {
        const schemaValues = getFormValuesInCorrectFormat<InfraProvisioningDataUI, InfraProvisioningData>(
          _values,
          transformValuesFieldsConfig
        )
        onUpdate?.(schemaValues)
      }}
    >
      {(formik: FormikProps<InfraProvisioningDataUI>) => {
        return (
          <FormikForm className={css.provisionerForm}>
            <FormInput.CheckBox
              name={`provisionerEnabled`}
              disabled={formik.values.provisionerSnippetLoading}
              label={getString('pipelineSteps.deploy.provisioner.enableProvisionerLabel')}
              onChange={(event: React.FormEvent<HTMLInputElement>) => {
                if (!event.currentTarget.checked) {
                  formik.values.provisioner.stage.spec.execution = { steps: [], rollbackSteps: [] }
                  formik.setFieldValue('provisioner', formik.values.provisioner)
                  onUpdate?.({
                    provisioner: formik.values.provisioner.stage.spec.execution,
                    provisionerEnabled: event.currentTarget.checked
                  })
                } else {
                  showModal({
                    provisioner: formik.values.provisioner.stage.spec.execution,
                    provisionerEnabled: true
                  })
                }
              }}
            />
            {formik.values.provisionerSnippetLoading ? (
              <Container>
                <Spinner />
              </Container>
            ) : null}

            {formik.values.provisionerEnabled && !formik.values.provisionerSnippetLoading ? (
              <div className={css.graphContainer}>
                <Field name="provisioner">
                  {(_props: any) => {
                    return (
                      <ExecutionGraph
                        gridStyle={{ startX: 50, startY: 80 }}
                        rollBackPropsStyle={{ top: '10px' }}
                        rollBackBannerStyle={{ top: '10px', backgroundColor: 'rgba(0,0,0,0)' }}
                        canvasButtonsLayout={'horizontal'}
                        canvasButtonsTooltipPosition={'top'}
                        allowAddGroup={true}
                        isReadonly={isReadonly}
                        hasRollback={true}
                        hasDependencies={false}
                        stepsFactory={stepsFactory}
                        templateTypes={templateTypes}
                        stage={formik.values.provisioner as any}
                        originalStage={formik.values.originalProvisioner as any}
                        ref={executionRef}
                        updateStage={stageData => {
                          formik.setFieldValue('provisioner', stageData)
                          onUpdate?.({
                            provisioner: stageData.stage?.spec?.execution || ({} as any),
                            provisionerEnabled: formik.values.provisionerEnabled
                          })
                        }}
                        // Check and update the correct stage path here
                        pathToStage={`${stagePath}.stage.spec.execution`}
                        onAddStep={(event: ExecutionGraphAddStepEvent) => {
                          updatePipelineView({
                            ...pipelineView,
                            isDrawerOpened: true,
                            drawerData: {
                              type: DrawerTypes.AddProvisionerStep,
                              data: {
                                paletteData: {
                                  entity: event.entity,
                                  stepsMap: event.stepsMap,
                                  onUpdate: executionRef.current?.stepGroupUpdated,
                                  isRollback: event.isRollback,
                                  isParallelNodeClicked: event.isParallel,
                                  hiddenAdvancedPanels: [AdvancedPanels.PreRequisites]
                                }
                              }
                            }
                          })
                          formik.submitForm()
                        }}
                        onEditStep={(event: ExecutionGraphEditStepEvent) => {
                          updatePipelineView({
                            ...pipelineView,
                            isDrawerOpened: true,
                            drawerData: {
                              type: DrawerTypes.ProvisionerStepConfig,
                              data: {
                                stepConfig: {
                                  node: event.node as any,
                                  stepsMap: event.stepsMap,
                                  onUpdate: executionRef.current?.stepGroupUpdated,
                                  isStepGroup: event.isStepGroup,
                                  isUnderStepGroup: event.isUnderStepGroup,
                                  addOrEdit: event.addOrEdit,
                                  hiddenAdvancedPanels: [AdvancedPanels.PreRequisites]
                                }
                              }
                            }
                          })
                        }}
                      />
                    )
                  }}
                </Field>
              </div>
            ) : null}
          </FormikForm>
        )
      }}
    </Formik>
  )
}

export const InfraProvisioningBaseWithRef = React.forwardRef(InfraProvisioningBase)
