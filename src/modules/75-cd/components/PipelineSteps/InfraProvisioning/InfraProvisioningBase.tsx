import React from 'react'
import { Spinner } from '@blueprintjs/core'
import { Field, FormikProps } from 'formik'
import { Container, Formik, FormikForm, FormInput } from '@wings-software/uicore'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
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
import css from './InfraProvisioning.module.scss'

export const InfraProvisioningBase = (
  { initialValues, onUpdate }: InfraProvisioningProps,
  _formikRef: StepFormikFowardRef<InfraProvisioningData>
): JSX.Element => {
  const {
    stepsFactory,
    state: { pipelineView },
    updatePipelineView,
    isReadonly
  } = React.useContext(PipelineContext)

  const { getString } = useStrings()

  const executionRef = React.useRef<ExecutionGraphRefObj | null>(null)

  return (
    <Formik
      enableReinitialize={true}
      initialValues={getInitialValuesInCorrectFormat<InfraProvisioningData, InfraProvisioningDataUI>(
        initialValues,
        transformValuesFieldsConfig
      )}
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
          <FormikForm>
            <FormInput.CheckBox
              name={`provisionerEnabled`}
              disabled={formik.values.provisionerSnippetLoading}
              className={css.provisionerEnabledCheckbox}
              label={getString('pipelineSteps.deploy.provisioner.enableProvisionerLabel')}
              onChange={(event: React.FormEvent<HTMLInputElement>) => {
                if (!event.currentTarget.checked) {
                  formik.values.provisioner.stage.spec.execution = { steps: [], rollbackSteps: [] }
                }

                formik.setFieldValue('provisioner', formik.values.provisioner)
                onUpdate?.({
                  provisioner: formik.values.provisioner.stage.spec.execution,
                  provisionerEnabled: event.currentTarget.checked
                })
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
                        gridStyle={{ startX: -150, startY: 80 }}
                        rollBackPropsStyle={{ top: '10px' }}
                        rollBackBannerStyle={{ top: '10px', backgroundColor: 'rgba(0,0,0,0)' }}
                        canvasButtonsLayout={'horizontal'}
                        canvasButtonsTooltipPosition={'top'}
                        allowAddGroup={true}
                        isReadonly={isReadonly}
                        hasRollback={true}
                        hasDependencies={false}
                        stepsFactory={stepsFactory}
                        stage={formik.values.provisioner}
                        originalStage={formik.values.originalProvisioner}
                        ref={executionRef}
                        updateStage={() => {
                          formik.submitForm()
                        }}
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
                                  node: event.node,
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
