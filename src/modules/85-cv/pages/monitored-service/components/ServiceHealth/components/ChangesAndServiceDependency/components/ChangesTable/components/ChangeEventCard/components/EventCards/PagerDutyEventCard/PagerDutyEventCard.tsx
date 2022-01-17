/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { Divider } from '@blueprintjs/core'
import { Card } from '@wings-software/uicore'
import type { ChangeEventDTO } from 'services/cv'
import ChangeEventServiceHealth from '@cv/pages/monitored-service/components/ServiceHealth/components/ChangesAndServiceDependency/components/ChangesTable/components/ChangeCard/components/ChangeEventServiceHealth/ChangeEventServiceHealth'
import type { ChangeTitleData, ChangeDetailsDataInterface, ChangeInfoData } from '../../../ChangeEventCard.types'
import { createChangeTitleData, createChangeDetailsData, createChangeInfoData } from '../../../ChangeEventCard.utils'
import ChangeDetails from '../../ChangeDetails/ChangeDetails'
import ChangeInformation from '../../ChangeInformation/ChangeInformation'
import ChangeTitle from '../../ChangeTitle/ChangeTitle'
import css from '../../../ChangeEventCard.module.scss'

export default function PagerDutyEventCard({
  data,
  serviceIdentifier,
  environmentIdentifier
}: {
  data: ChangeEventDTO
  serviceIdentifier?: string
  environmentIdentifier?: string
}): JSX.Element {
  const { metadata } = data || {}
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
      {data?.eventTime && data.serviceIdentifier && data.envIdentifier && (
        <ChangeEventServiceHealth
          serviceIdentifier={serviceIdentifier ?? data.serviceIdentifier}
          envIdentifier={environmentIdentifier ?? data.envIdentifier}
          startTime={data.eventTime}
          eventType={data.type}
        />
      )}
    </Card>
  )
}
