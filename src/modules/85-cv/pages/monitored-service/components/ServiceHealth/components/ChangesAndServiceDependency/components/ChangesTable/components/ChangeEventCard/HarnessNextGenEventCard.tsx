import React, { useMemo } from 'react'
import { Divider } from '@blueprintjs/core'
import { Card, Color, Container, Layout, Text } from '@wings-software/uicore'
import type { ChangeEventDTO } from 'services/cv'
import { useStrings } from 'framework/strings'
import type { ChangeTitleData, ChangeDetailsDataInterface } from './ChangeEventCard.types'
import { createChangeTitleData, createChangeDetailsData } from './ChangeEventCard.utils'
import ChangeDetails from './components/ChangeDetails/ChangeDetails'
import ChangeTitle from './components/ChangeTitle/ChangeTitle'
import StatusChip from './components/ChangeDetails/components/StatusChip/StatusChip'
import DeploymentTimeDuration from './components/DeploymentTimeDuration/DeploymentTimeDuration'
import css from './ChangeEventCard.module.scss'

export default function HarnessNextGenEventCard({ data }: { data: ChangeEventDTO }) {
  const { getString } = useStrings()
  const changeTitleData: ChangeTitleData = useMemo(() => createChangeTitleData(data), [])
  const changeDetailsData: ChangeDetailsDataInterface = useMemo(() => createChangeDetailsData(data), [])

  const { artifactType = '', artifactTag = '', verifyStepSummaries = [] } = data?.metadata || {}
  const changeInfoData = { artifactType, artifactTag }

  const summary: {
    name: string
    verificationStatus: string
  }[] = verifyStepSummaries

  return (
    <Card className={css.main}>
      <ChangeTitle changeTitleData={changeTitleData} />
      <Divider className={css.divider} />
      <ChangeDetails ChangeDetailsData={changeDetailsData} />
      <Divider className={css.divider} />
      <Container>
        <Text font={{ size: 'medium', weight: 'bold' }} color={Color.GREY_800}>
          {getString('cv.changeSource.changeSourceCard.information')}
        </Text>
        <ChangeDetails ChangeDetailsData={{ details: changeInfoData }} />
        <DeploymentTimeDuration
          startTime={data?.metadata?.deploymentStartTime}
          endTime={data?.metadata?.deploymentEndTime}
        />
      </Container>
      <Divider className={css.divider} />
      {summary?.length ? (
        <Container>
          <Text font={{ size: 'medium', weight: 'bold' }} color={Color.GREY_800}>
            {getString('cv.changeSource.changeSourceCard.deploymentHealth')}
          </Text>
          <Layout.Horizontal margin={{ top: 'large', bottom: 'large' }} flex={{ justifyContent: 'flex-start' }}>
            {summary?.map(item => {
              return (
                <Container className={css.flexColumn} key={item.name}>
                  <Text className={css.summarylabel} font={{ size: 'xsmall' }} color={Color.GREY_400}>
                    {item.name}
                  </Text>
                  <StatusChip status={item.verificationStatus} />
                </Container>
              )
            })}
          </Layout.Horizontal>
        </Container>
      ) : null}
    </Card>
  )
}
