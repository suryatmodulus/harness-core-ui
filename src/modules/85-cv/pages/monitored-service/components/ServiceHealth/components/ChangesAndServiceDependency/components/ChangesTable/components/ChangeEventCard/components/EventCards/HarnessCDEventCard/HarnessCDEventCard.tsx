/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { Divider } from '@blueprintjs/core'
import { Card, Color, Container, Text } from '@wings-software/uicore'
import type { ChangeEventDTO } from 'services/cv'
import { useStrings } from 'framework/strings'
import ChangeEventServiceHealth from '@cv/pages/monitored-service/components/ServiceHealth/components/ChangesAndServiceDependency/components/ChangesTable/components/ChangeCard/components/ChangeEventServiceHealth/ChangeEventServiceHealth'
import type { ChangeTitleData, ChangeDetailsDataInterface } from '../../../ChangeEventCard.types'
import { createChangeTitleData, createChangeDetailsData } from '../../../ChangeEventCard.utils'
import ChangeDetails from '../../ChangeDetails/ChangeDetails'
import ChangeTitle from '../../ChangeTitle/ChangeTitle'
import DeploymentTimeDuration from '../../DeploymentTimeDuration/DeploymentTimeDuration'
import css from '../../../ChangeEventCard.module.scss'

export default function HarnessCDEventCard({
  data,
  serviceIdentifier,
  environmentIdentifier
}: {
  data: ChangeEventDTO
  serviceIdentifier?: string
  environmentIdentifier?: string
}): JSX.Element {
  const { getString } = useStrings()
  const changeTitleData: ChangeTitleData = useMemo(() => createChangeTitleData(data), [])
  const changeDetailsData: ChangeDetailsDataInterface = useMemo(() => createChangeDetailsData(data), [])

  const { name = '', artifactType = '', artifactName = '' } = data?.metadata || {}
  const changeInfoData = { name, 'artifact type': artifactType, 'artifact name': artifactName }

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
