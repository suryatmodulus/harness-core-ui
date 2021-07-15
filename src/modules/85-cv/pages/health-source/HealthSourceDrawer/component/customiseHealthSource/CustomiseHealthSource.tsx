import React, { useContext } from 'react'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import {
  MonitoredServiceDTO,
  MonitoredServiceResponse,
  useSaveMonitoredService,
  useUpdateMonitoredService
} from 'services/cv'
import { useToaster } from '@common/components/Toaster/useToaster'
import { BGColorWrapper } from '@cv/pages/health-source/common/StyledComponents'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { LoadSourceByType, createHealthsourceList } from './CustomiseHealthSource.utils'
import type { updatedHealthSource } from '../../HealthSourceDrawerContent'

export default function CustomiseHealthSource({
  onSuccess
}: {
  onSuccess: (data: MonitoredServiceResponse) => void
}): JSX.Element {
  const params = useParams<ProjectPathProps & { identifier: string }>()
  const { getString } = useStrings()
  const { showError, showSuccess } = useToaster()
  const { sourceData } = useContext(SetupSourceTabsContext)
  const { mutate: saveMonitoredService } = useSaveMonitoredService({
    queryParams: { accountId: params.accountId }
  })
  const { mutate: updateMonitoredService } = useUpdateMonitoredService({
    identifier: sourceData?.monitoredServiceIdentifier,
    queryParams: { accountId: params.accountId }
  })

  const submitData = async (formdata: any, healthSourcePayload: updatedHealthSource): Promise<void> => {
    const healthSourceList = createHealthsourceList(formdata, healthSourcePayload)
    try {
      const payload: MonitoredServiceDTO = {
        orgIdentifier: params.orgIdentifier,
        projectIdentifier: params.projectIdentifier,
        environmentRef: formdata.environmentIdentifier,
        identifier: formdata?.monitoredServiceIdentifier,
        name: formdata?.monitoringSourceName,
        description: '',
        type: 'Application',
        serviceRef: formdata.serviceIdentifier,
        sources: {
          healthSources: healthSourceList
        }
      }
      const postdatavalue = params?.identifier
        ? await updateMonitoredService(payload)
        : await saveMonitoredService(payload)
      postdatavalue?.resource && onSuccess(postdatavalue?.resource)
      showSuccess(
        params?.identifier
          ? getString('cv.monitoredServices.monitoredServiceUpdated')
          : getString('cv.monitoredServices.monitoredServiceCreated')
      )
    } catch (error) {
      showError(error.message)
    }
  }

  return (
    <BGColorWrapper>
      <LoadSourceByType type={sourceData?.sourceType} data={sourceData} onSubmit={submitData} />
    </BGColorWrapper>
  )
}
