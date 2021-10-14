import React, { useMemo } from 'react'
import { Divider } from '@blueprintjs/core'
import { Card } from '@wings-software/uicore'
import type { ChangeEventDTO } from 'services/cv'
import type { ChangeTitleData, ChangeDetailsDataInterface, ChangeInfoData } from './ChangeEventCard.types'
import { createChangeTitleData, createChangeDetailsData, createChangeInfoData } from './ChangeEventCard.utils'
import ChangeDetails from './components/ChangeDetails/ChangeDetails'
import ChangeInformation from './components/ChangeInformation/ChangeInformation'
import ChangeTitle from './components/ChangeTitle/ChangeTitle'
import css from './ChangeEventCard.module.scss'

export default function PagerDutyEventCard({ data }: { data: ChangeEventDTO }) {
  const { metadata } = data
  const changeTitleData: ChangeTitleData = useMemo(() => createChangeTitleData(data), [])
  const changeDetailsData: ChangeDetailsDataInterface = useMemo(() => createChangeDetailsData(data), [])
  const changeInfoData: ChangeInfoData = useMemo(() => createChangeInfoData(metadata), [metadata])

  return (
    <Card className={css.main}>
      <ChangeTitle changeTitleData={changeTitleData} />
      <Divider className={css.divider} />
      <ChangeDetails ChangeDetailsData={changeDetailsData} />
      <Divider className={css.divider} />
      <ChangeInformation infoData={changeInfoData} />
      <Divider className={css.divider} />
    </Card>
  )
}
