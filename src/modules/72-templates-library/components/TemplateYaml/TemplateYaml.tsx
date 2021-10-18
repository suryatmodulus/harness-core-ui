import React from 'react'
import { Color, Text } from '@wings-software/uicore'
import MonacoEditor from '@common/components/MonacoEditor/MonacoEditor'

import css from './TemplateYaml.module.scss'

export interface TemplateYamlProps {
  templateYaml?: string
}

export const TemplateYaml: React.FC<TemplateYamlProps> = props => {
  const { templateYaml } = props

  return (
    <div className={css.main}>
      <div className={css.titleHolder}>
        <Text font={{ size: 'normal', weight: 'bold' }} color={Color.GREY_800}>
          template.yaml
        </Text>
      </div>
      <MonacoEditor
        value={templateYaml}
        language={'yaml'}
        height={500}
        options={
          {
            classNames: css.editor,
            fontFamily: "'Roboto Mono', monospace",
            fontSize: 13,
            minimap: {
              enabled: false
            },
            readOnly: false,
            scrollBeyondLastLine: false
          } as any
        }
      />
    </div>
  )
}
