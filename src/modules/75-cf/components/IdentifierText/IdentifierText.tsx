import React from 'react'
import { Button, Color, Icon, Text, TextProps, Utils } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { useToaster } from '@common/exports'

export interface IdentifierTextProps extends TextProps {
  identifier?: string
  allowCopy?: boolean
}

export const IdentifierText: React.FC<IdentifierTextProps> = ({ identifier, style, allowCopy, ...props }) => {
  const { getString } = useStrings()
  const { showSuccess, clear } = useToaster()

  return (
    <Text
      inline
      style={{
        backgroundColor: '#EFFBFF',
        marginBottom: 'var(--spacing-small)',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        lineHeight: '15px',
        color: '#22222A',
        border: '1px solid #D9DAE6',
        ...style
      }}
      {...props}
    >
      {getString('idLabel')}
      {identifier}
      {allowCopy && (
        <Button
          noStyling
          style={{
            border: 'none',
            background: 'none',
            padding: 0,
            margin: '0 0 0 var(--spacing-small)',
            transform: 'translateY(-2px)',
            cursor: 'pointer'
          }}
          title={getString('clickToCopy')}
          onClick={() => {
            Utils.copy(identifier as string)
            clear()
            showSuccess(getString('copiedToClipboard'))
          }}
        >
          <Icon name="duplicate" size={12} color={Color.GREY_350} />
        </Button>
      )}
    </Text>
  )
}
