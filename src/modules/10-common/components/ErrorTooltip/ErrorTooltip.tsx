import React from 'react'
import { Position } from '@blueprintjs/core'
import { Popover, Layout, Text, Container, Color, FontVariation, Button, ButtonVariation } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { ErrorTooltipProps } from './ErrorTooltip.types'
import css from './ErrorTooltip.module.scss'

const ErrorTooltip: React.FC<ErrorTooltipProps> = ({ children, message, onRetry, width = 250 }) => {
  const { getString } = useStrings()

  return (
    <Popover
      interactionKind="click"
      position={Position.BOTTOM_LEFT}
      content={
        <Layout.Vertical width={width} padding="medium" spacing="small">
          <Text color={Color.RED_600} font={{ variation: FontVariation.SMALL }}>
            {`${getString('common.friendlyMessage')}: ${message ?? getString('somethingWentWrong')}`}
          </Text>
          <Container>
            <Text inline color={Color.BLACK} font={{ variation: FontVariation.SMALL }}>
              {getString('common.suggestionsLabel')}
            </Text>
            <Button
              inline
              onClick={onRetry}
              text={getString('retry')}
              variation={ButtonVariation.LINK}
              className={css.buttonLink}
            />
          </Container>
        </Layout.Vertical>
      }
    >
      {children}
    </Popover>
  )
}

export default ErrorTooltip
