import React, { useMemo } from 'react'
import { Divider } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import { Card } from '@wings-software/uicore'
import { useGetChangeEventDetail } from 'services/cv'
import { PageSpinner } from '@common/components'
import { useStrings } from 'framework/strings'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { PageError } from '@common/components/Page/PageError'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { Connectors } from '@connectors/constants'
import noDataImage from '@cv/assets/noData.svg'
import { NoDataCard } from '@common/components/Page/NoDataCard'
import ChangeTitle from './components/ChangeTitle/ChangeTitle'
import ChangeDetails from './components/ChangeDetails/ChangeDetails'
import ChangeInformation from './components/ChangeInformation/ChangeInformation'
import { createChangeDetailsData, createChangeInfoData, createChangeTitleData } from './ChangeCard.utils'
import type { ChangeDetailsDataInterface, ChangeInfoData, ChangeTitleData } from './ChangeCard.types'
import css from './ChangeCard.module.scss'

export default function ChangeCard({ activityId }: { activityId: string }) {
  const { orgIdentifier, projectIdentifier, accountId } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { data, loading, error, refetch } = useGetChangeEventDetail({
    orgIdentifier,
    projectIdentifier,
    accountIdentifier: accountId,
    activityId: activityId
  })

  const { type } = data?.resource || {}

  const changeTitleData: ChangeTitleData = useMemo(() => createChangeTitleData(data?.resource), [data?.resource])
  const changeDetailsData: ChangeDetailsDataInterface = useMemo(
    () => createChangeDetailsData(data?.resource),
    [data?.resource]
  )
  const changeInfoData: ChangeInfoData = useMemo(
    () => createChangeInfoData(data?.resource?.metadata),
    [data?.resource?.metadata]
  )

  if (loading) {
    return <PageSpinner />
  } else if (error) {
    return <PageError message={getErrorMessage(error)} onClick={() => refetch()} />
  } else if (type !== Connectors.PAGER_DUTY) {
    return <NoDataCard message={getString('cv.changeSource.noDataAvaiableForCard')} image={noDataImage} />
  } else {
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
}
