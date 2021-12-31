import React from 'react'
import { Layout, Text, TextInput } from '@wings-software/uicore'
import { Callout } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { CopyText } from '@common/components/CopyText/CopyText'

interface TokenValueRendererProps {
  token: string
  textInputClass?: string
  copyTextClass?: string
}

export const TokenValueRenderer: React.FC<TokenValueRendererProps> = props => {
  const { getString } = useStrings()
  const { token, textInputClass, copyTextClass } = props
  return (
    <Layout.Vertical spacing="small" margin={{ bottom: 'medium' }}>
      <Callout intent="success">
        <Text>{getString('valueLabel')}</Text>
        <TextInput
          className={textInputClass}
          value={token}
          disabled
          rightElement={
            (<CopyText className={copyTextClass} iconName="duplicate" textToCopy={token} iconAlwaysVisible />) as any
          }
        />
        <Text>{getString('rbac.token.form.tokenMessage')}</Text>
      </Callout>
    </Layout.Vertical>
  )
}
