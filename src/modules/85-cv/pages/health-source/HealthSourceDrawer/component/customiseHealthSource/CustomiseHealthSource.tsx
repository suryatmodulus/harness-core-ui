import React, { useContext, useMemo } from 'react'
import { omit } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import {
  MonitoredServiceDTO,
  MonitoredServiceResponse,
  useSaveMonitoredService,
  useUpdateMonitoredService
} from 'services/cv'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { useToaster } from '@common/components/Toaster/useToaster'
import { BGColorWrapper } from '@cv/pages/health-source/common/StyledComponents'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { LoadSourceByType, createHealthsourceList } from './CustomiseHealthSource.utils'
import type { SourceDataInterface, UpdatedHealthSource } from '../../HealthSourceDrawerContent.types'
import { omitServiceEnvironmentKeys } from './CustomiseHealthSource.constant'

export default function CustomiseHealthSource({
  onSuccess,
  shouldRenderAtVerifyStep
}: {
  onSuccess: (data: MonitoredServiceResponse) => void
  shouldRenderAtVerifyStep?: boolean
}): JSX.Element {
  const params = useParams<ProjectPathProps & { identifier: string }>()
  const { getString } = useStrings()
  const { showError, showSuccess } = useToaster()
  const { sourceData } = useContext(SetupSourceTabsContext)
  const { mutate: saveMonitoredService } = useSaveMonitoredService({
    queryParams: { accountId: params.accountId }
  })
  const { mutate: updateMonitoredService } = useUpdateMonitoredService({
    identifier: sourceData?.monitoredServiceRef?.identifier,
    queryParams: { accountId: params.accountId }
  })

  // Removing Service and Environment keys
  const filteredSourceData: Omit<
    SourceDataInterface,
    'isEdit' | 'serviceRef' | 'environmentRef' | 'monitoredServiceRef'
  > = useMemo(() => omit(sourceData, omitServiceEnvironmentKeys), [sourceData])

  const isEdit = useMemo(
    () => params?.identifier || shouldRenderAtVerifyStep,
    [params?.identifier, shouldRenderAtVerifyStep]
  )

  const submitData = async (formdata: any, healthSourcePayload: UpdatedHealthSource): Promise<void> => {
    const healthSourceList = createHealthsourceList(formdata, healthSourcePayload)
    const { identifier, name, description, tags } = formdata?.monitoredServiceRef
    try {
      const payload: MonitoredServiceDTO = {
        orgIdentifier: params.orgIdentifier,
        projectIdentifier: params.projectIdentifier,
        serviceRef: sourceData.serviceRef,
        environmentRef: sourceData.environmentRef,
        identifier,
        name,
        description,
        tags,
        type: 'Application',
        sources: {
          healthSources: healthSourceList
        }
      }
      // From verify step it will be always update call since monitored service will already be created.
      // This flow will be triggered only when user is adding health source to existing monitored service
      const postdatavalue = isEdit ? await updateMonitoredService(payload) : await saveMonitoredService(payload)
      postdatavalue?.resource && onSuccess(postdatavalue?.resource)
      showSuccess(
        isEdit
          ? getString('cv.monitoredServices.monitoredServiceUpdated')
          : getString('cv.monitoredServices.monitoredServiceCreated')
      )
    } catch (error) {
      showError(getErrorMessage(error))
    }
  }

  return (
    <BGColorWrapper>
      <LoadSourceByType type={sourceData?.sourceType} data={filteredSourceData} onSubmit={submitData} />
    </BGColorWrapper>
  )
}
