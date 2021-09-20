import { Layout, Text, Color, Container, Pagination, Formik, FormInput } from '@wings-software/uicore'
import React, { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup'
import { noop } from 'lodash-es'
import { useListMonitoredService } from 'services/cv'
import { PageSpinner, useToaster } from '@common/components'
import { PageError } from '@common/components/Page/PageError'
import { NoDataCard } from '@common/components/Page/NoDataCard'
import SaveAndDiscardButton from '@common/components/SaveAndDiscardButton/SaveAndDiscardButton'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import type { MonitoredServiceForm } from '../Service/Service.types'
import SelectServiceCard from './component/SelectServiceCard'
import { onServiceChange } from './Dependency.utils'
import { isUpdated } from '../../Configurations.utils'
import css from './Dependency.module.scss'

export default function Dependency({
  value,
  onSuccess,
  cachedInitialValues,
  setDBData,
  onDiscard,
  dependencyTabformRef
}: {
  value: MonitoredServiceForm
  onSuccess: (val: any) => Promise<void>
  cachedInitialValues?: MonitoredServiceForm | null
  setDBData?: (val: MonitoredServiceForm) => void
  onDiscard?: () => void
  dependencyTabformRef?: any
}): JSX.Element {
  const { getString } = useStrings()
  const [page, setPage] = useState(0)
  const { showSuccess } = useToaster()
  const { accountId, identifier, orgIdentifier, projectIdentifier } = useParams<
    ProjectPathProps & { identifier: string }
  >()

  const {
    data: monitoredServiceList,
    loading: loadingGetMonitoredService,
    error: errorGetMonitoredService,
    refetch
  } = useListMonitoredService({
    queryParams: {
      offset: page,
      pageSize: 10,
      orgIdentifier,
      projectIdentifier,
      accountId,
      environmentIdentifier: identifier ? value?.environmentRef : cachedInitialValues?.environmentRef || ''
    },
    debounce: 400
  })

  const filteredMonitoredServiceList = useMemo(
    () => monitoredServiceList?.data?.content?.filter(item => item.identifier !== value.identifier) || [],
    [loadingGetMonitoredService]
  )

  const { pageSize = 0, pageIndex = 0, totalPages = 0, totalItems = 0 } = monitoredServiceList?.data ?? ({} as any)

  if (loadingGetMonitoredService) {
    return <PageSpinner />
  }

  if (errorGetMonitoredService) {
    return <PageError message={getErrorMessage(errorGetMonitoredService)} onClick={() => refetch()} />
  }

  return (
    <div>
      <Formik<MonitoredServiceForm>
        formName={'dependencyTab'}
        initialValues={cachedInitialValues || value}
        enableReinitialize
        validationSchema={Yup.object().shape({
          dependencies: Yup.array()
        })}
        onSubmit={noop}
      >
        {formik => {
          dependencyTabformRef.current = formik
          if (formik.dirty) {
            setDBData?.(formik.values)
          }
          return (
            <FormInput.CustomRender
              name={'dependencies'}
              render={() => {
                return (
                  <div>
                    <Container className={css.saveDiscardBlock}>
                      <SaveAndDiscardButton
                        isUpdated={isUpdated(formik.dirty, value, cachedInitialValues)}
                        onSave={async () => {
                          await onSuccess(formik?.values)
                          showSuccess(
                            getString(
                              identifier
                                ? 'cv.monitoredServices.monitoredServiceUpdated'
                                : 'cv.monitoredServices.monitoredServiceCreated'
                            )
                          )
                        }}
                        onDiscard={() => {
                          formik.resetForm()
                          onDiscard?.()
                        }}
                      />
                    </Container>
                    <Layout.Horizontal>
                      <div className={css.leftSection}>
                        <Container margin={{ left: 'medium', right: 'medium' }}>
                          <Text
                            margin={{ bottom: 'large' }}
                            color={Color.BLACK}
                            font={{ size: 'medium', weight: 'semi-bold' }}
                          >
                            {getString('cv.Dependency.serviceList')}
                          </Text>
                          <Text
                            margin={{ bottom: 'medium' }}
                            color={Color.BLACK}
                            font={{ size: 'small', weight: 'semi-bold' }}
                          >
                            {getString('total')} {filteredMonitoredServiceList.length}
                          </Text>
                        </Container>
                        {!filteredMonitoredServiceList.length ? (
                          <NoDataCard icon={'join-table'} message={getString('cv.monitoredServices.noData')} />
                        ) : (
                          filteredMonitoredServiceList.map(service => (
                            <SelectServiceCard
                              key={service.serviceRef}
                              data={service}
                              isChecked={
                                !!formik.values.dependencies
                                  ?.map(item => item.monitoredServiceIdentifier || '')
                                  .find(item => item === service.serviceRef)
                              }
                              onChange={data => onServiceChange(data, formik)}
                            />
                          ))
                        )}
                        <Container>
                          <Pagination
                            pageSize={pageSize}
                            pageIndex={pageIndex}
                            pageCount={totalPages}
                            itemCount={totalItems - 1}
                            gotoPage={pageNumber => setPage(pageNumber)}
                          />
                        </Container>
                      </div>
                      <div className={css.rightSection}>
                        <NoDataCard message={getString('cv.Dependency.noData')} icon="warning-sign" />
                      </div>
                    </Layout.Horizontal>
                  </div>
                )
              }}
            />
          )
        }}
      </Formik>
    </div>
  )
}
