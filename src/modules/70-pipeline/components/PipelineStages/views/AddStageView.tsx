import React from 'react'
import { Card, Icon } from '@wings-software/uicore'
import cx from 'classnames'
import type { PipelineStageProps } from '../PipelineStage'
import css from './AddStageView.module.scss'

export interface AddStageViewProps {
  callback: (type: string) => void
  stages: Array<PipelineStageProps>
  isParallel?: boolean
}

export const AddStageView: React.FC<AddStageViewProps> = ({ callback, isParallel = false, stages }) => {
  const [selectedType, setSelectedType] = React.useState(stages[0])
  React.useEffect(() => {
    if (stages.length) {
      setSelectedType(stages[0])
    }
  }, [stages, stages.length])
  return (
    <div className={cx(css.createNewContent, { [css.parallel]: isParallel })}>
      <div className={css.createNewCards}>
        {stages.map(stage => (
          <React.Fragment key={stage.type}>
            {stage.isHidden !== true && (!stage.isApproval || !isParallel) ? (
              <div>
                <Card
                  data-testid={`stage-${stage.type}`}
                  onMouseOver={() => !stage.isDisabled && selectedType?.type !== stage.type && setSelectedType(stage)}
                  interactive={true}
                  disabled={stage.isDisabled}
                  className={cx(css.cardNew)}
                  onClick={e => {
                    if (stage.isDisabled) {
                      e.stopPropagation()
                    } else {
                      callback(stage.type)
                    }
                  }}
                >
                  <Icon name={stage.icon} size={24} {...stage.iconsProps} style={stage.iconsStyle} />
                </Card>
                <div className={css.cardTitle}>{stage.name}</div>
              </div>
            ) : null}
          </React.Fragment>
        ))}
      </div>
      <div className={css.createNewMessage}>
        <div className={css.stageTitle}>{selectedType?.title}</div>
        <div className={css.stageDescription}>{selectedType?.description}</div>
      </div>
    </div>
  )
}
