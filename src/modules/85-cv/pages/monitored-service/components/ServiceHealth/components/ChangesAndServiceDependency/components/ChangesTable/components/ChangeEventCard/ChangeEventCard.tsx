import React from 'react'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { NoDataCard } from '@common/components/Page/NoDataCard'
import noDataImage from '@cv/assets/noData.svg'
import { useGetChangeEventDetail } from 'services/cv'
import { PageSpinner } from '@common/components'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { ChangeSourceTypes } from '@cv/pages/ChangeSource/ChangeSourceDrawer/ChangeSourceDrawer.constants'
import { PageError } from '@common/components/Page/PageError'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import PagerDutyEventCard from './PagerDutyEventCard'
import HarnessNextGenEventCard from './HarnessNextGenEventCard'
import HarnessCDEventCard from './HarnessCDEventCard'

export default function ChangeEventCard({ activityId }: { activityId: string }) {
  const { getString } = useStrings()
  const { orgIdentifier, projectIdentifier, accountId } = useParams<ProjectPathProps>()
  const { data, loading, error, refetch } = useGetChangeEventDetail({
    orgIdentifier,
    projectIdentifier,
    accountIdentifier: accountId,
    activityId: activityId
  })

  const { type } = data?.resource || {}

  if (loading) {
    return <PageSpinner />
  } else if (error) {
    return <PageError message={getErrorMessage(error)} onClick={() => refetch()} />
  } else if (data?.resource) {
    switch (type) {
      case ChangeSourceTypes.PagerDuty:
        return <PagerDutyEventCard data={data?.resource} />
      case ChangeSourceTypes.HarnessCD:
        return <HarnessCDEventCard data={data?.resource} />
      case ChangeSourceTypes.HarnessCDNextGen:
        return <HarnessNextGenEventCard data={data?.resource} />
      default:
        return <NoDataCard message={getString('cv.changeSource.noDataAvaiableForCard')} image={noDataImage} />
    }
  } else {
    return <NoDataCard message={getString('cv.changeSource.noDataAvaiableForCard')} image={noDataImage} />
  }
}
