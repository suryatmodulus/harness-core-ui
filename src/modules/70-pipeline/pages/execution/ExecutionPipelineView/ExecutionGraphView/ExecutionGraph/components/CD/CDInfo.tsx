import React from 'react'
import { get } from 'lodash-es'
import { Container, Icon, Text, Layout, Color } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import BarrierStageTooltip from './BarrierStageTooltip'

export interface CDInfoProps {
  data?: any
  barrier?: {
    barrierInfoLoading?: boolean
    barrierData?: any
  }
}

export default function CDInfo(props: CDInfoProps): React.ReactElement {
  const { getString } = useStrings()
  const { data, barrier } = props
  const artifacts = get(data, 'data.moduleInfo.cd.serviceInfo.artifacts.sidecars', []).map(
    (artifact: any) => artifact.imagePath
  )
  const primaryArtifact = get(data, 'data.moduleInfo.cd.serviceInfo.artifacts.primary.imagePath', '')
  if (primaryArtifact.length > 0) {
    artifacts.push(primaryArtifact)
  }
  const serviceName = get(data, 'data.moduleInfo.cd.serviceInfo.displayName', null)
  const environment = get(data, 'data.moduleInfo.cd.infraExecutionSummary.name', null)

  return (
    <Container>
      {barrier?.barrierData?.data && data.status === 'Running' && (
        <BarrierStageTooltip
          loading={!!barrier.barrierInfoLoading}
          stageName={data.name}
          data={barrier.barrierData?.data}
        />
      )}
      {(serviceName || artifacts.length > 0 || environment) && (
        <Container border={{ top: true, width: 1, color: Color.GREY_200 }} padding={{ top: 'small' }}>
          {serviceName && (
            <Layout.Horizontal padding={{ right: 'medium', bottom: 'small', left: 'small' }}>
              <Container flex={{ justifyContent: 'center', alignItems: 'start' }} width={32}>
                <Icon name="services" color={Color.GREY_600} size={24} />
              </Container>
              <Layout.Vertical spacing={'xsmall'}>
                <Text style={{ fontSize: '12px' }} font={{ weight: 'semi-bold' }} color={Color.BLACK}>
                  {getString('serviceOrServices')}
                </Text>
                <Text style={{ fontSize: '10px' }} color={Color.GREY_700} data-testid="hovercard-service">
                  {serviceName}
                </Text>
              </Layout.Vertical>
            </Layout.Horizontal>
          )}
          {artifacts.length > 0 && (
            <Layout.Horizontal padding={{ right: 'medium', bottom: 'small', left: 'small' }}>
              <Container flex={{ justifyContent: 'center', alignItems: 'start' }} width={32}>
                <Icon name="services" color={Color.GREY_600} size={24} />
              </Container>
              <Layout.Vertical spacing={'xsmall'}>
                <Text style={{ fontSize: '12px' }} font={{ weight: 'semi-bold' }} color={Color.BLACK}>
                  {getString('artifactOrArtifacts')}
                </Text>
                <Container data-testid="hovercard-artifact">
                  {artifacts.map((imagePath: string, index: number) => (
                    <Text
                      key={`${imagePath}+${index}`}
                      style={{ fontSize: '10px' }}
                      color={Color.GREY_700}
                      data-testid="hovercard-environment"
                    >
                      {imagePath}
                    </Text>
                  ))}
                </Container>
              </Layout.Vertical>
            </Layout.Horizontal>
          )}
          {environment && (
            <Layout.Horizontal padding={{ right: 'medium', bottom: 'small', left: 'small' }}>
              <Container flex={{ justifyContent: 'center', alignItems: 'start' }} width={32}>
                <Icon name="services" color={Color.GREY_600} size={24} />
              </Container>
              <Layout.Vertical spacing={'xsmall'}>
                <Text style={{ fontSize: '12px' }} font={{ weight: 'semi-bold' }} color={Color.BLACK}>
                  {getString('environmentOrEnvironments')}
                </Text>
                <Text style={{ fontSize: '10px' }} color={Color.GREY_700} data-testid="hovercard-environment">
                  {environment}
                </Text>
              </Layout.Vertical>
            </Layout.Horizontal>
          )}
        </Container>
      )}
    </Container>
  )
}
