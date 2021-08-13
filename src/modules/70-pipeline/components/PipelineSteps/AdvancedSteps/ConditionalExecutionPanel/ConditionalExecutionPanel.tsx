import React from 'react'
import { Color, Container, Formik } from '@wings-software/uicore'
import { debounce, noop } from 'lodash-es'
import type { FormikProps } from 'formik'
import type { StepMode as Modes } from '@pipeline/utils/stepUtils'
import type { Values } from '../../../PipelineStudio/StepCommands/StepCommandTypes'
import ConditionalExecutionPanelHeader from './ConditionalExecutionHeader'
import ConditionalExecutionPanelStatus from './ConditionalExecutionStatus'
import ConditionalExecutionPanelCondition from './ConditionalExecutionCondition'
import { ConditionalExecutionOption, PipelineOrStageStatus } from './ConditionalExecutionPanelUtils'

export interface ConditionalExecutionPanelProps {
  formikProps: FormikProps<Pick<Values, 'when'>>
  mode: Modes
  isReadonly: boolean
}

export default function ConditionalExecutionPanel(props: ConditionalExecutionPanelProps): React.ReactElement {
  const { formikProps, mode, isReadonly } = props

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdate = React.useCallback(
    debounce(({ status, enableJEXL, condition }: ConditionalExecutionOption): void => {
      formikProps.setFieldValue('when', {
        stageStatus: status,
        ...(enableJEXL &&
          !!condition?.trim() && {
            condition: condition?.trim()
          })
      })
    }, 300),
    [formikProps]
  )

  return (
    <Formik
      initialValues={
        {
          status: formikProps.values.when?.stageStatus || PipelineOrStageStatus.SUCCESS,
          enableJEXL: !!formikProps.values.when?.condition,
          condition: formikProps.values.when?.condition
        } as ConditionalExecutionOption
      }
      formName="conditionalExecution"
      onSubmit={noop}
      validate={debouncedUpdate}
    >
      {(panelFormikProps: FormikProps<ConditionalExecutionOption>) => {
        return (
          <>
            <ConditionalExecutionPanelHeader mode={mode} />
            <Container
              border={{ top: true, bottom: true, color: Color.GREY_200 }}
              padding={{ bottom: 'small', top: 'medium' }}
              margin={{ top: 'medium' }}
            >
              <ConditionalExecutionPanelStatus formikProps={panelFormikProps} isReadonly={isReadonly} mode={mode} />
            </Container>
            <Container padding={{ top: 'medium' }}>
              <ConditionalExecutionPanelCondition formikProps={panelFormikProps} isReadonly={isReadonly} mode={mode} />
            </Container>
          </>
        )
      }}
    </Formik>
  )
}
