import React, { useEffect, useRef } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import {
  Formik,
  Page,
  useToaster,
  Container,
  Layout,
  Button,
  Heading,
  FontVariation,
  useModalHook,
  Dialog,
  Text,
  Color
} from '@wings-software/uicore'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import routes from '@common/RouteDefinitions'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { ServiceLevelObjectiveDTO, useGetServiceLevelObjective, useSaveSLOData, useUpdateSLOData } from 'services/cv'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import sloReviewChange from '@cv/assets/sloReviewChange.svg'
import CreateSLOForm from './components/CreateSLOForm/CreateSLOForm'
import { getSLOInitialFormData, createSLORequestPayload, getIsUserUpdatedSLOData } from './CVCreateSLO.utils'
import { getSLOFormValidationSchema } from './CVCreateSLO.constants'
import type { SLOForm } from './CVCreateSLO.types'

const CVCreateSLO: React.FC = () => {
  const history = useHistory()
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const { accountId, orgIdentifier, projectIdentifier, identifier } = useParams<
    ProjectPathProps & { identifier: string }
  >()

  const projectIdentifierRef = useRef<string>()
  const sloPayloadRef = useRef<ServiceLevelObjectiveDTO | null>(null)

  useEffect(() => {
    if (projectIdentifierRef.current && projectIdentifierRef.current !== projectIdentifier) {
      history.push(routes.toCVSLOs({ accountId, orgIdentifier, projectIdentifier, module: 'cv' }))
      return
    }

    projectIdentifierRef.current = projectIdentifier
  }, [projectIdentifier, accountId, orgIdentifier, history])

  const { mutate: createSLO, loading: createSLOLoading } = useSaveSLOData({
    queryParams: { accountId }
  })

  const { mutate: updateSLO, loading: updateSLOLoading } = useUpdateSLOData({
    identifier,
    queryParams: { accountId, orgIdentifier, projectIdentifier }
  })

  const {
    data: SLODataResponse,
    error: SLODataError,
    refetch: refetchSLOData,
    loading: SLODataLoading
  } = useGetServiceLevelObjective({
    identifier,
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier
    },
    lazy: true
  })

  useEffect(() => {
    if (identifier) {
      refetchSLOData()
    }
  }, [identifier, refetchSLOData])

  const [openModal, closeModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        usePortal={true}
        autoFocus={true}
        canEscapeKeyClose={true}
        canOutsideClickClose={true}
        enforceFocus={false}
        style={{
          width: 600,
          borderLeft: 0,
          paddingBottom: 0,
          paddingTop: 'large',
          position: 'relative',
          overflow: 'hidden'
        }}
        onClose={closeModal}
      >
        <Layout.Vertical>
          <Layout.Horizontal>
            <Container width="70%" padding={{ right: 'large' }}>
              <Heading level={2} font={{ variation: FontVariation.H3 }} margin={{ bottom: 'xxlarge' }}>
                {getString('cv.slos.reviewChanges')}
              </Heading>
              <Text color={Color.GREY_600} font={{ weight: 'light' }} style={{ lineHeight: 'var(--spacing-xlarge)' }}>
                {getString('cv.slos.sloEditWarningMessage')}
              </Text>
            </Container>
            <Container margin={{ top: 'small' }}>
              <img width="170" src={sloReviewChange} />
            </Container>
          </Layout.Horizontal>

          <Layout.Horizontal spacing="medium" margin={{ top: 'large', bottom: 'xlarge' }}>
            <Button
              text={getString('common.ok')}
              onClick={async () => {
                await updateSLO(sloPayloadRef.current as ServiceLevelObjectiveDTO)
                sloPayloadRef.current = null
                showSuccess(getString('cv.slos.sloUpdated'))
                history.push(routes.toCVSLOs({ accountId, orgIdentifier, projectIdentifier, module: 'cv' }))
              }}
              intent="primary"
            />
            <Button
              text={getString('cancel')}
              onClick={() => {
                sloPayloadRef.current = null
                closeModal()
              }}
            />
          </Layout.Horizontal>
        </Layout.Vertical>
      </Dialog>
    ),
    [projectIdentifier, orgIdentifier, accountId]
  )

  const handleSLOSubmit = async (values: SLOForm): Promise<void> => {
    const sloCreateRequestPayload = createSLORequestPayload(values, orgIdentifier, projectIdentifier)

    try {
      if (identifier) {
        if (
          !getIsUserUpdatedSLOData(
            SLODataResponse?.resource?.serviceLevelObjective as ServiceLevelObjectiveDTO,
            sloCreateRequestPayload
          )
        ) {
          sloPayloadRef.current = sloCreateRequestPayload
          openModal()
        } else {
          await updateSLO(sloCreateRequestPayload)
          showSuccess(getString('cv.slos.sloUpdated'))
          history.push(routes.toCVSLOs({ accountId, orgIdentifier, projectIdentifier, module: 'cv' }))
        }
      } else {
        await createSLO(sloCreateRequestPayload)
        showSuccess(getString('cv.slos.sloCreated'))
        history.push(routes.toCVSLOs({ accountId, orgIdentifier, projectIdentifier, module: 'cv' }))
      }
    } catch (e) {
      showError(getErrorMessage(e))
    }
  }

  const sloName = SLODataResponse?.resource?.serviceLevelObjective.name
  const title = identifier ? getString('cv.slos.editSLO', { name: sloName }) : getString('cv.slos.createSLO')
  const links = [
    {
      url: routes.toCVSLOs({ accountId, orgIdentifier, projectIdentifier, module: 'cv' }),
      label: getString('cv.slos.title')
    }
  ]

  return (
    <>
      <Page.Header breadcrumbs={<NGBreadcrumbs links={links} />} title={title} />
      <Formik<SLOForm>
        initialValues={getSLOInitialFormData(SLODataResponse?.resource?.serviceLevelObjective)}
        formName="SLO_form"
        onSubmit={values => {
          handleSLOSubmit(values)
        }}
        validationSchema={getSLOFormValidationSchema(getString)}
        enableReinitialize
      >
        {formik => (
          <CreateSLOForm
            formikProps={formik}
            loading={SLODataLoading}
            error={getErrorMessage(SLODataError)}
            createOrUpdateLoading={createSLOLoading || updateSLOLoading}
            retryOnError={refetchSLOData}
          />
        )}
      </Formik>
    </>
  )
}

export default CVCreateSLO
