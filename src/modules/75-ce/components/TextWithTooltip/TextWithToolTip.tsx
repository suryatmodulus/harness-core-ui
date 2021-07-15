import React from 'react'
import { Color, Text, Layout } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { ServiceError } from 'services/lw'
import useErrorModalHook from '../../common/useErrorModalHook'
import css from './TextWithToolTip.module.scss'

export enum textWithToolTipStatus {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

interface TextWithToolTipProps {
  status: textWithToolTipStatus
  messageText?: string
  showDetails?: boolean
  errors: ServiceError[]
  indicatorColor?: string // TEMP: to set color for circle icon
}

const TextWithToolTip: React.FC<TextWithToolTipProps> = props => {
  const { getString } = useStrings()
  const { openErrorModal } = useErrorModalHook({ errorSummary: 'ERROR FOUND!!' })
  const isSuccess: boolean = props.status === textWithToolTipStatus.SUCCESS
  return (
    <Text
      inline
      icon={isSuccess ? 'full-circle' : 'warning-sign'}
      iconProps={{
        size: isSuccess ? 6 : 12,
        color: props.indicatorColor ? props.indicatorColor : isSuccess ? Color.GREEN_500 : Color.RED_500
      }}
      tooltip={
        <Layout.Vertical font={{ size: 'small' }} spacing="small" padding="small">
          <Text font={{ size: 'normal' }} color={Color.WHITE}>
            {'ERROR' + (props.messageText ? `: ${props.messageText}` : '')}
          </Text>
          <Text
            color={Color.BLUE_400}
            onClick={e => {
              e.stopPropagation()
              openErrorModal(props.errors || [])
            }}
            className={css.viewDetails}
          >
            {getString('connectors.testConnectionStep.errorDetails')}
          </Text>
        </Layout.Vertical>
      }
      tooltipProps={{ isDark: true, position: 'bottom' }}
    >
      {props.messageText || null}
    </Text>
  )
}

export default TextWithToolTip
