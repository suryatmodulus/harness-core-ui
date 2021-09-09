import { Container, FormInput, Layout, SelectOption, Utils } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import React, { useEffect, useMemo } from 'react'
import type { FormikProps } from 'formik'
import { Color, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { useGetServicesFromPagerDuty } from 'services/cv'
import { useToaster } from '@common/exports'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { FormConnectorReferenceField } from '@connectors/components/ConnectorReferenceField/FormConnectorReferenceField'
import type { UpdatedChangeSourceDTO } from '../../ChangeSourceDrawer.types'
import style from './PagerDutyChangeSource.module.scss'

export default function PageDutyChangeSource({ formik }: { formik: FormikProps<UpdatedChangeSourceDTO> }): JSX.Element {
  const { getString } = useStrings()
  const { showError, clear } = useToaster()
  const { orgIdentifier, projectIdentifier, accountId } = useParams<ProjectPathProps & { identifier: string }>()

  const {
    data: pagerdutyServices,
    error: pagerdutyServicesError,
    refetch: fetchPagerDutyServices,
    loading: loadingPagerdutyServices
  } = useGetServicesFromPagerDuty({
    lazy: true
  })

  useEffect(() => {
    if (formik?.values?.spec?.connectorRef) {
      fetchPagerDutyServices({
        queryParams: {
          orgIdentifier,
          projectIdentifier,
          accountId,
          connectorIdentifier: formik?.values?.spec?.connectorRef,
          requestGuid: Utils.randomId()
        }
      })
    }
  }, [formik?.values?.spec?.connectorRef])

  if (pagerdutyServicesError) {
    clear()
    showError(getErrorMessage(pagerdutyServicesError))
  }

  const pagerDutyServiceOptions = useMemo(
    () =>
      pagerdutyServices?.resource?.map(item => {
        const service: SelectOption = {
          label: item.name || '',
          value: item.id || ''
        }
        return service
      }) || [],
    [pagerdutyServices?.resource]
  )

  return (
    <Layout.Horizontal spacing={'xxlarge'}>
      <Container margin={{ bottom: 'large' }} width={'400px'}>
        <div className={style.connectorField}>
          <FormConnectorReferenceField
            width={400}
            formik={formik}
            type={formik?.values?.type as any}
            name={'spec.connectorRef'}
            accountIdentifier={accountId}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            placeholder={getString('cv.healthSource.connectors.selectConnector', {
              sourceType: formik?.values?.type
            })}
            label={
              <Text color={Color.BLACK} font={'small'} margin={{ bottom: 'small' }}>
                {getString('connectors.selectConnector')}
              </Text>
            }
          />
        </div>
      </Container>
      {formik?.values?.spec?.connectorRef && (
        <Container margin={{ bottom: 'large' }} width={'400px'}>
          <Text color={Color.BLACK} font={'small'} className={style.pagerDutyServiceTitle}>
            {getString('cv.changeSource.PageDuty.pagerDutyService')}
          </Text>
          <FormInput.Select
            name="spec.pagerDutyServiceId"
            placeholder={
              loadingPagerdutyServices
                ? getString('loading')
                : getString('cv.changeSource.PageDuty.selectPagerDutyService')
            }
            items={pagerDutyServiceOptions}
          />
          {!pagerDutyServiceOptions.length && !loadingPagerdutyServices && (
            <Text font={'xsmall'} color={Color.ERROR}>
              {getString('cv.changeSource.PageDuty.pagerDutyEmptyService', {
                connector: formik?.values?.spec?.connectorRef
              })}
            </Text>
          )}
        </Container>
      )}
    </Layout.Horizontal>
  )
}
