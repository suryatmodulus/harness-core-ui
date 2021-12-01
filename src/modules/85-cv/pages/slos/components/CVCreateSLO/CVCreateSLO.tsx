import React, { useCallback, useEffect, useMemo } from 'react'
import * as Yup from 'yup'
import { useHistory, useParams } from 'react-router-dom'
import { Formik, Page, useToaster } from '@wings-software/uicore'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import routes from '@common/RouteDefinitions'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { useGetServiceLevelObjective, useSaveSLOData, useUpdateSLOData } from 'services/cv'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import type { SLOForm } from './components/CreateSLOForm/CreateSLO.types'
import { createSLORequestPayload } from './components/CreateSLOForm/CreateSLO.utils'
import CreateSLOForm from './components/CreateSLOForm/CreateSLOForm'
import { getInitialValuesSLO } from './CVCreateSLO.utils'
import css from './CVCreateSLO.module.scss'

export default function CVCreateSLO(): JSX.Element {
  const { getString } = useStrings()
  const { orgIdentifier, projectIdentifier, accountId, identifier } = useParams<
    ProjectPathProps & { identifier: string }
  >()

  const { showSuccess, showError } = useToaster()
  const history = useHistory()

  const queryParams = useMemo(
    () => ({ accountId, orgIdentifier, projectIdentifier }),
    [accountId, orgIdentifier, projectIdentifier]
  )

  const { mutate: createSLO, loading: createSLOLoading } = useSaveSLOData({ queryParams })
  const { mutate: updateSLO, loading: updateSLOLoading } = useUpdateSLOData({ queryParams, identifier })
  const {
    data: SLODataById,
    error: SLOByIdFetchError,
    refetch: fetchSLOById,
    loading: getSLOLoading
  } = useGetServiceLevelObjective({ identifier, queryParams, lazy: true })

  useEffect(() => {
    if (identifier) {
      fetchSLOById()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identifier])

  const handleSLOSubmit = useCallback(
    async values => {
      const sloCreateRequestPayload = createSLORequestPayload(values, orgIdentifier, projectIdentifier)
      try {
        // creating/updating slo
        if (identifier) {
          await updateSLO(sloCreateRequestPayload)
          showSuccess(getString('cv.slos.sloUpdated'))
        } else {
          await createSLO(sloCreateRequestPayload)
          showSuccess(getString('cv.slos.sloCreated'))
        }

        // routing to list slos screen
        history.push(routes.toCVSLOs({ orgIdentifier, projectIdentifier, accountId }))
      } catch (e) {
        showError(getErrorMessage(e))
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const initialValuesSLO = useMemo(() => getInitialValuesSLO(identifier, SLODataById), [SLODataById, identifier])

  const title = useMemo(
    () => (identifier ? getString('cv.slos.editSLO') : getString('cv.slos.createSLO')),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [identifier]
  )

  return (
    <>
      <Page.Header
        breadcrumbs={
          <NGBreadcrumbs
            links={[
              {
                url: routes.toCVSLOs({
                  orgIdentifier: orgIdentifier,
                  projectIdentifier: projectIdentifier,
                  accountId: accountId
                }),
                label: getString('cv.slos.title')
              }
            ]}
          />
        }
        title={title}
      />
      <Page.Body
        loading={getSLOLoading || createSLOLoading || updateSLOLoading}
        error={getErrorMessage(SLOByIdFetchError)}
        retryOnError={() => fetchSLOById()}
        className={css.pageBody}
      >
        <Formik<SLOForm>
          initialValues={initialValuesSLO}
          formName="sloForm"
          onSubmit={values => {
            handleSLOSubmit(values)
          }}
          validationSchema={Yup.object().shape({
            name: Yup.string().required(getString('cv.slos.validations.nameValidation')),
            userJourneyRef: Yup.string().required(getString('cv.slos.validations.userJourneyRequired')),
            monitoredServiceRef: Yup.string()
              .nullable()
              .required(getString('connectors.cdng.validations.monitoringServiceRequired')),
            healthSourceRef: Yup.string().nullable().required(getString('cv.slos.validations.healthSourceRequired'))
          })}
          enableReinitialize
        >
          {formik => <CreateSLOForm formikProps={formik} identifier={identifier} />}
        </Formik>
      </Page.Body>
    </>
  )
}
