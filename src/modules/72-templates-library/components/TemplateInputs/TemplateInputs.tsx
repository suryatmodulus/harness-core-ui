import React from 'react'
import cx from 'classnames'
import { Color, Text } from '@wings-software/uicore'

import css from './TemplateInputs.module.scss'

export interface TemplateInputsProps {
  templateInputs?: any
}

export const TemplateInputs: React.FC<TemplateInputsProps> = _props => {
  return (
    <div className={css.main}>
      <div>
        <div className={cx(css.titleHolder)}>
          <Text font={{ size: 'normal', weight: 'bold' }} color={Color.GREY_800}>
            Stage 2: Dev
          </Text>
          <Text font={{ size: 'small' }} className={css.numberOfInputs}>
            Total Inputs: 8
          </Text>
        </div>
      </div>
    </div>
  )
}
