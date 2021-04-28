import React from 'react'
import moment from 'moment'
import { Color, Container, Icon, Layout, Text } from '@wings-software/uicore'
import { Spinner } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'

export interface BarrierStageTooltipProps {
  loading: boolean
  data?: any
  stageName: string
}

export default function BarrierStageTooltip(props: BarrierStageTooltipProps): React.ReactElement {
  const { getString } = useStrings()
  return props.loading ? (
    <Container border={{ top: true, width: 1, color: Color.GREY_200 }} padding={'medium'}>
      <Spinner size={24} />
    </Container>
  ) : (
    <Container>
      {props?.data.map((barrier: any) => {
        let timeDiff = barrier?.startedAt + barrier?.timeoutIn - Date.now()
        timeDiff = timeDiff > 0 ? timeDiff : 0
        const timeoutData: { value: number; unit: string } = moment.duration(timeDiff, 'milliseconds').get('minutes')
          ? { value: moment.duration(timeDiff, 'milliseconds').get('minutes'), unit: 'min' }
          : { value: moment.duration(timeDiff, 'milliseconds').get('seconds'), unit: 'sec' }
        const altUnit = 'min'
        const altDuration = moment.duration(barrier?.timeoutIn, 'milliseconds').get('minutes')

        return (
          <Layout.Horizontal
            key={barrier.identifier}
            border={{ top: true, width: 1, color: Color.GREY_200 }}
            padding={{ right: 'medium', top: 'small', bottom: 'small', left: 'small' }}
          >
            <Container flex={{ justifyContent: 'center', alignItems: 'start' }} width={32}>
              <Icon name="barrier-open-with-links" size={20} />
            </Container>
            <Layout.Vertical spacing={'xsmall'} margin={{ right: 'medium' }} style={{ flex: 1 }}>
              <Text style={{ fontSize: '12px' }} font={{ weight: 'semi-bold' }} color={Color.BLACK}>
                {barrier.name}
              </Text>
              <Text style={{ fontSize: '12px' }} color={Color.GREY_900} data-testid="hovercard-service">
                {getString('pipeline.barriers.tooltips.barrierWaiting')}
                {barrier.identifier} | {getString('pipeline.execution.stageTitlePrefix')}
                {props?.stageName}
              </Text>
            </Layout.Vertical>
            <Container>
              <Layout.Vertical
                background={Color.YELLOW_500}
                border={{ radius: 4 }}
                flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
                padding={'xsmall'}
              >
                <Text style={{ fontSize: '10px' }} font={{ weight: 'bold' }} color={Color.GREY_800}>
                  {barrier?.startedAt > 0 ? timeoutData.value : altDuration}
                </Text>
                <Text font={{ size: 'xsmall' }} color={Color.GREY_600}>
                  {barrier?.startedAt > 0 ? timeoutData.unit : altUnit}
                </Text>
              </Layout.Vertical>
            </Container>
          </Layout.Horizontal>
        )
      })}
    </Container>
  )
}
