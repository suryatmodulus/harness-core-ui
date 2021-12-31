import React from 'react'
import { Classes, PopoverInteractionKind, Position } from '@blueprintjs/core'
import { Color, Container, Icon, Text, IconName, Popover, Layout } from '@wings-software/uicore'
import type { InputSetErrorResponse } from 'services/pipeline-ng'
import { useStrings } from 'framework/strings'
import type { StringsMap } from 'stringTypes'
import { getErrorsList } from '@pipeline/components/PipelineStudio/StepUtil'
import { getFormattedErrors } from '@pipeline/utils/runPipelineUtils'
import css from './Badge.module.scss'

export interface BadgeProps {
  text: keyof StringsMap
  iconName: IconName
  showTooltip?: boolean
  entityName?: string
  entityType: string
  uuidToErrorResponseMap?: { [key: string]: InputSetErrorResponse }
  overlaySetErrorDetails?: { [key: string]: string }
  showInvalidText?: boolean
}

interface BadgeTooltipContentInterface {
  iconName: IconName
  entityName: string
  entityType: string
  uuidToErrorResponseMap?: { [key: string]: InputSetErrorResponse }
  overlaySetErrorDetails?: { [key: string]: string }
}

const TooltipContent: React.FC<BadgeTooltipContentInterface> = (props: BadgeTooltipContentInterface): JSX.Element => {
  const { iconName, entityName = '', entityType, uuidToErrorResponseMap, overlaySetErrorDetails } = props
  const { getString } = useStrings()
  const nonGitErrors = uuidToErrorResponseMap
    ? getFormattedErrors(uuidToErrorResponseMap)
    : overlaySetErrorDetails
    ? overlaySetErrorDetails
    : {}
  const { errorStrings: nonGitErrorStrings, errorCount: nonGitErrorsCount } = getErrorsList(nonGitErrors)
  return (
    <Container padding="medium">
      {nonGitErrorsCount ? (
        // Show non git errors
        // i.e. input set is invalid maybe because a pipeline was updated and runtimeinputs modified
        <Layout.Vertical spacing="medium">
          <Text color={Color.GREY_0}>
            {getString('common.errorCount' as keyof StringsMap, { count: nonGitErrorsCount })}
          </Text>
          <div>
            {nonGitErrorStrings.map((errorMessage, index) => (
              <Text width={500} lineClamp={1} color={Color.GREY_0} key={index} font={{ weight: 'semi-bold' }}>
                {errorMessage}
              </Text>
            ))}
          </div>
        </Layout.Vertical>
      ) : (
        // Show git errors
        <Layout.Horizontal>
          <div className={css.tooltipIcon}>
            <Icon name={iconName} size={14} color={Color.RED_600} />
          </div>
          <Layout.Vertical width={292} padding={{ left: 'small' }}>
            <Text width={244} color={Color.GREY_0} margin={{ bottom: 'small' }} className={css.tooltipContentText}>
              {getString('common.gitSync.outOfSync', { entityType, name: entityName })}
            </Text>
            <Text width={244} color={Color.GREY_0} className={css.tooltipContentText}>
              {getString('common.gitSync.fixAllErrors')}
            </Text>
          </Layout.Vertical>
        </Layout.Horizontal>
      )}
    </Container>
  )
}

export const Badge: React.FC<BadgeProps> = (props: BadgeProps): JSX.Element => {
  const {
    text,
    iconName,
    showTooltip,
    entityName = '',
    entityType,
    uuidToErrorResponseMap,
    overlaySetErrorDetails,
    showInvalidText = false
  } = props
  const { getString } = useStrings()

  const badgeUI = React.useCallback(() => {
    if (showInvalidText) {
      return (
        <Container className={css.badge}>
          <Icon name={iconName} size={10} color={Color.RED_600} className={css.badgeIcon} />
          <Text color={Color.RED_900} font={{ weight: 'bold' }} className={css.badgeText}>
            {getString(text)}
          </Text>
        </Container>
      )
    }
    return <Icon name={iconName} size={16} color={Color.RED_600} className={css.badgeIcon} data-testid="invalid-icon" />
  }, [iconName, showInvalidText, text, getString])

  return showTooltip ? (
    <Popover interactionKind={PopoverInteractionKind.HOVER} position={Position.BOTTOM} className={Classes.DARK}>
      {badgeUI()}
      <TooltipContent
        iconName={iconName}
        entityName={entityName}
        entityType={entityType}
        uuidToErrorResponseMap={uuidToErrorResponseMap}
        overlaySetErrorDetails={overlaySetErrorDetails}
      />
    </Popover>
  ) : (
    badgeUI()
  )
}
