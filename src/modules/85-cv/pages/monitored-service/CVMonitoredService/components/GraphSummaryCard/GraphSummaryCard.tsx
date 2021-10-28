import React from 'react'
import { Container, Layout, Text, Color, FontVariation, ButtonVariation, Button } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { useConfirmationDialog } from '@common/exports'
import ToggleOnOff from '@common/components/ToggleOnOff/ToggleOnOff'
import { ServiceDeleteContext, ServiceHealthTrend, RiskTagWithLabel } from '../../CVMonitoredService.utils'
import type { GraphSummaryCardProps } from '../../CVMonitoredService.types'
import { GraphServiceChanges } from './GraphSummaryCard.utils'
import css from '../../CVMonitoredService.module.scss'

const GraphSummaryCard: React.FC<GraphSummaryCardProps> = ({
  monitoredService,
  onEditService,
  onDeleteService,
  onToggleService,
  healthMonitoringFlagLoading
}) => {
  const { getString } = useStrings()

  const { openDialog: confirmServiceDelete } = useConfirmationDialog({
    titleText: getString('common.delete', { name: monitoredService.serviceName }),
    contentText: <ServiceDeleteContext serviceName={monitoredService.serviceName} />,
    confirmButtonText: getString('yes'),
    cancelButtonText: getString('cancel'),
    onCloseDialog: function (shouldDelete: boolean) {
      if (shouldDelete) {
        onDeleteService(monitoredService.identifier as string)
      }
    }
  })

  return (
    <Container width={358} background={Color.GREY_700} padding="large" className={css.graphSummaryCard}>
      <Layout.Horizontal flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Container>
          <Text color={Color.GREY_0} font={{ variation: FontVariation.H6 }}>
            {monitoredService?.serviceName?.toUpperCase()}
          </Text>
          <Text color={Color.GREY_0} font={{ variation: FontVariation.SMALL }}>
            {monitoredService?.environmentName}
          </Text>
        </Container>
        <Layout.Horizontal flex={{ alignItems: 'center' }}>
          <Button
            icon="Edit"
            iconProps={{ color: Color.GREY_0 }}
            variation={ButtonVariation.ICON}
            onClick={() => onEditService(monitoredService.identifier as string)}
          />
          <Button
            icon="trash"
            iconProps={{ color: Color.GREY_0 }}
            variation={ButtonVariation.ICON}
            margin={{ right: 'small' }}
            onClick={confirmServiceDelete}
          />
          <ToggleOnOff
            checked={!!monitoredService.healthMonitoringEnabled}
            loading={healthMonitoringFlagLoading}
            onChange={checked => {
              onToggleService(monitoredService.identifier as string, checked)
            }}
          />
        </Layout.Horizontal>
      </Layout.Horizontal>

      <Container
        border={{ top: true, bottom: true, color: Color.GREY_400 }}
        padding={{ top: 'medium', bottom: 'medium' }}
        margin={{ top: 'medium', bottom: 'medium' }}
      >
        <Text color={Color.GREY_0} font={{ variation: FontVariation.TINY_SEMI }} padding={{ bottom: 'medium' }}>
          {getString('cv.Dependency.serviceChanges').toUpperCase()}
        </Text>
        <GraphServiceChanges changeSummary={monitoredService.changeSummary} />
      </Container>

      <Layout.Vertical spacing="large">
        <Text color={Color.GREY_0} font={{ variation: FontVariation.TINY_SEMI }}>
          {getString('cv.monitoredServices.monitoredServiceTabs.serviceHealth').toUpperCase()}
        </Text>
        <ServiceHealthTrend healthScores={monitoredService.historicalTrend?.healthScores} />
        {monitoredService.healthMonitoringEnabled && (
          <Container margin={{ top: 'large' }}>
            <RiskTagWithLabel
              riskData={monitoredService.currentHealthScore}
              labelVariation={FontVariation.SMALL}
              color={Color.GREY_0}
            />
          </Container>
        )}
      </Layout.Vertical>
    </Container>
  )
}

export default GraphSummaryCard
