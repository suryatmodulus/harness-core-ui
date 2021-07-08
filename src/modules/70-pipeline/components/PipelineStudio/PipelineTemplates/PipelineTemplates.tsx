import React from 'react'
import { Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import css from './PipelineTemplates.module.scss'

export const PipelineTemplates: React.FC = (): JSX.Element => {
  const { getString } = useStrings()
  return (
    <div className={css.pipelineTemplates}>
      <div className={css.templatesContainer}>
        <Text font={{ size: 'large' }}>{getString('common.templates')}</Text>
      </div>
    </div>
  )
}
