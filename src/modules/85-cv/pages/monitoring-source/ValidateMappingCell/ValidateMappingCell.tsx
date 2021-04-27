import React from 'react'
import { Container, Text, Color } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { AppdynamicsValidationResponse } from 'services/cv'
import css from './ValidateMappingCell.module.scss'

export interface ValidationMappingCellProps {
  onRetry?: () => void
  validationStatus?: AppdynamicsValidationResponse['overallStatus'] | 'LOADING' | 'NO_STATUS'
  onCellClick: () => void
  apiError?: string
}

export function ValidateMappingCell(props: ValidationMappingCellProps): JSX.Element {
  const { onRetry, validationStatus, onCellClick, apiError } = props
  const { getString } = useStrings()

  if (apiError) {
    return (
      <Text
        icon="refresh"
        iconProps={{ size: 8 }}
        intent="danger"
        lineClamp={1}
        tooltipProps={{ className: css.popoverClass }}
        onClick={onRetry}
        className={css.errorWithRefresh}
      >
        {apiError}
      </Text>
    )
  }

  switch (validationStatus) {
    case 'LOADING':
      return (
        <Text icon="steps-spinner" intent="primary" iconProps={{ size: 16, color: Color.BLUE_500 }}>
          {getString('cv.monitoringSources.appD.verificationsInProgress')}
        </Text>
      )
    case 'NO_DATA':
      return (
        <Text icon="small-minus" className={css.clickableText} iconProps={{ size: 16 }} onClick={onCellClick}>
          {getString('cv.monitoringSources.appD.noData')}
        </Text>
      )
    case 'SUCCESS':
      return (
        <Text
          icon="tick"
          className={css.clickableText}
          intent="success"
          iconProps={{ size: 16, color: Color.GREEN_500 }}
          onClick={onCellClick}
        >
          {getString('cv.monitoringSources.appD.validationsPassed')}
        </Text>
      )
    case 'FAILED':
      return (
        <Text
          icon="refresh"
          iconProps={{ size: 8 }}
          intent="danger"
          lineClamp={1}
          tooltipProps={{ className: css.popoverClass }}
          onClick={onRetry}
          className={css.errorWithRefresh}
        >
          {getString('cv.monitoringSources.appD.validationsFailed')}
        </Text>
      )
    default:
      return <Container />
  }
}
