import React from 'react'
import { Color, Container, Formik } from '@wings-software/uicore'
import { debounce, noop } from 'lodash-es'
import type { FormikProps } from 'formik'
import type { Values } from '../../../PipelineStudio/StepCommands/StepCommandTypes'
import type { Modes } from '../common'
import ConditionalExecutionPanelHeader from './ConditionalExecutionHeader'
import ConditionalExecutionPanelStatus from './ConditionalExecutionStatus'
import ConditionalExecutionPanelCondition from './ConditionalExecutionCondition'
import { ConditionalExecutionOption, PipelineOrStageStatus } from './ConditionalExecutionPanelUtils'

export interface ConditionalExecutionPanelProps {
  formikProps: FormikProps<Values>
  mode: Modes
  isReadonly: boolean
}

export default function ConditionalExecutionPanel(props: ConditionalExecutionPanelProps): React.ReactElement {
  const { formikProps, mode, isReadonly } = props

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
      onSubmit={noop}
      validate={debouncedUpdate}
    >
      {(panelFormikProps: FormikProps<ConditionalExecutionOption>) => {
        return (
          <>
            <ConditionalExecutionPanelHeader mode={mode} />
            <Container
              border={{ top: true, bottom: true, color: Color.GREY_300 }}
              padding={{ bottom: 'small', top: 'medium' }}
              margin={{ top: 'medium' }}
            >
              <ConditionalExecutionPanelStatus formikProps={panelFormikProps} isReadonly={isReadonly} mode={mode} />
            </Container>
            <Container padding={{ top: 'medium', left: 'xxlarge', right: 'medium' }}>
              <ConditionalExecutionPanelCondition formikProps={panelFormikProps} isReadonly={isReadonly} mode={mode} />
            </Container>
          </>
        )
      }}
    </Formik>
  )
}
