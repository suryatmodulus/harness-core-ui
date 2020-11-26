import React from 'react'
import { Heading, Button } from '@wings-software/uikit'
import { noop } from 'lodash-es'
import { DrawerTypes } from '../PipelineContext/PipelineActions'
import { PipelineContext } from '../PipelineContext/PipelineContext'
import { RightBar } from '../RightBar/RightBar'
import type { ServiceWrapper } from '../ExecutionGraph/ExecutionGraphUtil'
import type { AbstractStepFactory } from '../../AbstractSteps/AbstractStepFactory'
import { StepWidget } from '../../AbstractSteps/StepWidget'

import i18n from './PipelineConfigureService.i18n'
import css from './PipelineConfigureService.module.scss'

export interface PipelineConfigureServiceProps {
  step: ServiceWrapper
  onSubmit?: (step: ServiceWrapper) => void
  onBack?: () => void
  onCancel?: () => void
  onClose?: () => void
  stepsFactory: AbstractStepFactory
}

export const PipelineConfigureService: React.FC<PipelineConfigureServiceProps> = ({
  step,
  stepsFactory,
  onSubmit = noop
}) => {
  const {
    state: { pipelineView },
    updatePipelineView
  } = React.useContext(PipelineContext)

  const handleBackClick = (): void => {
    updatePipelineView({
      ...pipelineView,
      drawerData: { type: DrawerTypes.AddService }
    })
  }

  const handleCloseClick = (): void => {
    updatePipelineView({
      ...pipelineView,
      isDrawerOpened: false,
      drawerData: { type: DrawerTypes.ConfigureService }
    })
  }

  return (
    <div className={css.wrapper}>
      <div className={css.inner}>
        <div className={css.header}>
          <div className={css.headerLeftSide}>
            <Button
              className={css.back}
              icon="arrow-left"
              minimal
              margin={{ right: 'small' }}
              onClick={handleBackClick}
            />
            <Heading className={css.title} level={2}>
              {i18n.title}
            </Heading>
          </div>
        </div>

        <StepWidget factory={stepsFactory} initialValues={step} onUpdate={onSubmit} type={step.type} />

        <Button className={css.close} icon="main-close" minimal onClick={handleCloseClick} />
      </div>

      <RightBar />
    </div>
  )
}
