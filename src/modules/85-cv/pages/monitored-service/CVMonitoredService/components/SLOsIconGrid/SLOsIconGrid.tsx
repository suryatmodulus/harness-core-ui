import React from 'react'
import type { IconProps } from '@wings-software/uicore/dist/icons/Icon'
import { Color, Layout, Text, Utils, Icon, FontVariation } from '@wings-software/uicore'
import { getRiskColorValue, getRiskLabelStringId } from '@cv/utils/CommonUtils'
import { useStrings } from 'framework/strings'
import type { MonitoredServiceListItemDTO } from 'services/cv'
import css from './SLOsIconGrid.module.scss'

interface SLOsIconGridProps {
  items?: MonitoredServiceListItemDTO['sloHealthIndicators']
  iconProps: IconProps
  max?: number
  width?: number
  isDarkBackground?: boolean
}

const SLOsIconGrid: React.FC<SLOsIconGridProps> = ({ items, iconProps, max = 8, width, isDarkBackground }) => {
  const { getString } = useStrings()

  if (items) {
    return (
      <Layout.Horizontal className={css.container} width={width}>
        {items.slice(0, max).map((item, i) => (
          <Utils.WrapOptionalTooltip
            key={i}
            tooltip={
              `${Number(item?.errorBudgetRemainingPercentage || 0).toFixed(2)}%` ??
              getString(getRiskLabelStringId(item.errorBudgetRisk))
            }
            tooltipProps={{
              usePortal: false,
              popoverClassName: isDarkBackground ? css.errorBudgetPopoverDarkBg : css.errorBudgetPopoverLightBg
            }}
          >
            <Icon {...iconProps} color={getRiskColorValue(item.errorBudgetRisk, false, !!isDarkBackground)} />
          </Utils.WrapOptionalTooltip>
        ))}
        {items.length > max && (
          <Text
            font={{ variation: FontVariation.TINY_SEMI }}
            color={isDarkBackground ? Color.GREY_100 : Color.GREY_600}
          >
            +{items.length - max}
          </Text>
        )}
      </Layout.Horizontal>
    )
  }

  return null
}

export default SLOsIconGrid
