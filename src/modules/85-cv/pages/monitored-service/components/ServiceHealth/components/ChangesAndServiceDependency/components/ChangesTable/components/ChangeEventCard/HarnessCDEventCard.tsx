import React, { useMemo } from 'react'
import { Divider } from '@blueprintjs/core'
import { Card, Color, Container, Text } from '@wings-software/uicore'
import type { ChangeEventDTO } from 'services/cv'
import { useStrings } from 'framework/strings'
import type { ChangeTitleData, ChangeDetailsDataInterface } from './ChangeEventCard.types'
import { createChangeTitleData, createChangeDetailsData } from './ChangeEventCard.utils'
import ChangeDetails from './components/ChangeDetails/ChangeDetails'
import ChangeTitle from './components/ChangeTitle/ChangeTitle'
import DeploymentTimeDuration from './components/DeploymentTimeDuration/DeploymentTimeDuration'
import css from './ChangeEventCard.module.scss'

export default function HarnessCDEventCard({ data }: { data: ChangeEventDTO }) {
  const { getString } = useStrings()
  const changeTitleData: ChangeTitleData = useMemo(() => createChangeTitleData(data), [])
  const changeDetailsData: ChangeDetailsDataInterface = useMemo(() => createChangeDetailsData(data), [])

  const { name = '' } = data?.metadata || {}
  const changeInfoData = { name }

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
          startTime={data?.metadata?.workflowStartTime}
          endTime={data?.metadata?.workflowEndTime}
        />
      </Container>
      <Divider className={css.divider} />
    </Card>
  )
}
