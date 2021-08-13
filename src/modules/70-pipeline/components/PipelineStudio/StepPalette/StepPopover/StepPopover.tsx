import React from 'react'
import { Text, Popover, Container, Layout, Color, Card, Icon } from '@wings-software/uicore'
import { Classes, IPopoverProps, PopoverInteractionKind, Position } from '@blueprintjs/core'

import { isNil } from 'lodash-es'
import { iconMap } from '@pipeline/components/PipelineStudio/StepPalette/iconMap'
import type { StepData } from 'services/pipeline-ng'
import { useStrings } from 'framework/strings'
import type { AbstractStepFactory } from '../../../AbstractSteps/AbstractStepFactory'
import css from './StepPopover.module.scss'

export interface StepPopoverProps {
  stepData: StepData
  stepsFactory: AbstractStepFactory
  popoverProps?: IPopoverProps
  className?: string
}
export const StepPopover: React.FC<StepPopoverProps> = props => {
  const { stepData, stepsFactory, popoverProps } = props
  const { getString } = useStrings()
  const step = stepsFactory.getStep(stepData.type)
  const description = stepsFactory.getStepDescription(stepData.type || '')

  return (
    <Popover
      interactionKind={PopoverInteractionKind.HOVER}
      position={Position.TOP}
      className={Classes.DARK}
      {...popoverProps}
    >
      <Card interactive={!isNil(step)} selected={false} className={css.paletteCard}>
        {stepsFactory.getStepIsHarnessSpecific(stepData.type || '') && (
          <Icon size={12} name="harness-logo-white-bg-blue" className={css.stepHarnessLogo} />
        )}
        <Icon
          name={!isNil(step) ? stepsFactory.getStepIcon(stepData.type || '') : iconMap[stepData.name || '']}
          size={25}
        />
      </Card>
      {description && (
        <Container width={200} padding="medium">
          <Text font={{ size: 'small' }} color={Color.GREY_50}>
            {getString(description)}
          </Text>
          {stepsFactory.getStepIsHarnessSpecific(stepData.type || '') && (
            <Layout.Horizontal margin={{ top: 'small' }} flex={{ justifyContent: 'flex-start' }} spacing={'small'}>
              <Icon size={12} name="harness-logo-white-bg-blue" />
              <Text font={{ size: 'xsmall' }} color={Color.GREY_400}>
                {getString('pipeline.poweredByHarness')}
              </Text>
            </Layout.Horizontal>
          )}
        </Container>
      )}
    </Popover>
  )
}
