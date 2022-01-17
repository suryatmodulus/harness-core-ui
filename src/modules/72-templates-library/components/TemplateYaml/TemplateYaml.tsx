import React from 'react'
import { Color, Container, Text, Layout } from '@wings-software/uicore'
import { defaultTo } from 'lodash-es'
import MonacoEditor from '@common/components/MonacoEditor/MonacoEditor'

import { yamlStringify } from '@common/utils/YamlHelperMethods'
import css from './TemplateYaml.module.scss'

export interface TemplateYamlProps {
  templateYaml?: string
}

export const TemplateYaml: React.FC<TemplateYamlProps> = ({ templateYaml }) => {
  const [height, setHeight] = React.useState<number>()

  React.useEffect(() => {
    const stringifiedYaml = yamlStringify(templateYaml) as string
    setHeight((defaultTo(stringifiedYaml.match(/\n/g)?.length, 0) + 1) * 20)
  }, [templateYaml])

  return (
    <Container className={css.container}>
      <Layout.Vertical spacing={'medium'}>
        <Container
          padding={{ top: 'large', right: 'xxlarge', bottom: 'large', left: 'xxlarge' }}
          border={{ bottom: true }}
          background={Color.WHITE}
        >
          <Text font={{ size: 'normal', weight: 'bold' }} color={Color.GREY_800}>
            template.yaml
          </Text>
        </Container>
        <Container style={{ flexGrow: 1 }}>
          <MonacoEditor
            value={templateYaml}
            language={'yaml'}
            height={height}
            options={
              {
                fontFamily: "'Roboto Mono', monospace",
                fontSize: 13,
                minimap: {
                  enabled: false
                },
                readOnly: true,
                scrollbar: {
                  handleMouseWheel: false
                },
                overviewRulerLanes: 0,
                scrollBeyondLastLine: false
              } as any
            }
          />
        </Container>
      </Layout.Vertical>
    </Container>
  )
}
