import React from 'react'
import cx from 'classnames'
import { Text } from '@wings-software/uicore'
import css from './TemplateColor.module.scss'

export interface TemplateColorProps {
  fill: string
  stroke: string
  title: string
  textColor?: string
}
export const TemplateColor: React.FC<TemplateColorProps> = (props): JSX.Element => {
  const { fill, stroke, title, textColor } = props

  return (
    <div className={css.templateColor}>
      <div className={css.absolutePos}>
        <svg width="121" height="18" viewBox="0 0 121 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M10.6577 4.36758L0.989019 17.5H120.044L111.076 4.58226C109.301 2.02513 106.385 0.5 103.272 0.5H18.3079C15.288 0.5 12.4481 1.93575 10.6577 4.36758Z"
            fill={fill}
            stroke={stroke}
          />
        </svg>
      </div>
      <Text className={cx(css.text, css.absolutePos)} color={textColor}>
        {title}
      </Text>
    </div>
  )
}
