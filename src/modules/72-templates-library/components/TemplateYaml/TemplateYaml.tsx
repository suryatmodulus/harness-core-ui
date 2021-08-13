import React from 'react'
import { Color, Text } from '@wings-software/uicore'
import MonacoEditor from '@common/components/MonacoEditor/MonacoEditor'

import css from './TemplateYaml.module.scss'

export interface TemplateYamlProps {
  templateInputs?: any
}

export const TemplateYaml: React.FC<TemplateYamlProps> = _props => {
  const yaml = 'spec:\n  id: abc\n  name: abc\n  name2: abc\n  name3: abc\n'

  return (
    <div className={css.main}>
      <div className={css.titleHolder}>
        <Text font={{ size: 'normal', weight: 'bold' }} color={Color.GREY_800}>
          template.yaml
        </Text>
      </div>
      <MonacoEditor
        value={yaml}
        language={'yaml'}
        height="400"
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
