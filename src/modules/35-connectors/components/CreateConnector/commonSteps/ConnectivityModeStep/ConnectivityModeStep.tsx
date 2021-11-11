import React from 'react'
import {
  Button,
  ButtonVariation,
  Color,
  FontVariation,
  Formik,
  FormikForm,
  Layout,
  StepProps,
  Text
} from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import {
  ConnectorConfigDTO,
  ConnectorInfoDTO,
  EntityGitDetails
  // useCreateConnector,
  // useUpdateConnector
} from 'services/cd-ng'

import ConnectivityMode, { ConnectivityModeType } from '@common/components/ConnectivityMode/ConnectivityMode'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'

interface ConnectivityModeStepProps {
  type: ConnectorConfigDTO['type']
  isEditMode: boolean
  setIsEditMode?: (val: boolean) => void
  connectorInfo: ConnectorInfoDTO | void
  gitDetails?: EntityGitDetails
  disableGitSync?: boolean
  submitOnNextStep?: boolean
  connectivityMode?: ConnectivityModeType
  setConnectivityMode?: (val: ConnectivityModeType) => void
}

const ConnectivityModeStep: React.FC<StepProps<ConnectorConfigDTO> & ConnectivityModeStepProps> = props => {
  const { prevStepData, nextStep, connectorInfo } = props
  const { getString } = useStrings()
  const {
    // accountId,
    projectIdentifier: projectIdentifierFromUrl,
    orgIdentifier: orgIdentifierFromUrl
  } = useParams<any>()
  // let gitDetails = props.gitDetails

  const projectIdentifier = connectorInfo ? connectorInfo.projectIdentifier : projectIdentifierFromUrl
  const orgIdentifier = connectorInfo ? connectorInfo.orgIdentifier : orgIdentifierFromUrl
  const isGitSyncEnabled = useAppStore().isGitSyncEnabled && !props.disableGitSync && orgIdentifier && projectIdentifier
  // const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()
  // const { mutate: createConnector, loading: creating } = useCreateConnector({
  //   queryParams: { accountIdentifier: accountId }
  // })
  // const { mutate: updateConnector, loading: updating } = useUpdateConnector({
  //   queryParams: { accountIdentifier: accountId }
  // })

  const defaultInitialValues = { connectivityMode: ConnectivityModeType.Manager }
  //   const { openSaveToGitDialog } = useSaveToGitDialog<Connector>({
  //     onSuccess: (
  //       gitData: SaveToGitFormInterface,
  //       payload?: Connector,
  //       objectId?: string
  //     ): Promise<UseSaveSuccessResponse> =>
  //       handleCreateOrEdit({ gitData, payload: payload || (connectorPayloadRef as Connector) }, objectId),
  //     onClose: noop
  //   })

  return (
    <Layout.Vertical>
      <Formik
        initialValues={{
          //   ...(getInitialValues() as DetailsForm)
          ...defaultInitialValues,
          ...prevStepData
        }}
        onSubmit={stepData => {
          if (props.submitOnNextStep || stepData.connectivityMode === ConnectivityModeType.Delegate) {
            nextStep?.({ ...prevStepData, ...stepData, projectIdentifier, orgIdentifier })
            return
          }

          // const connectorData = {
          //   ...prevStepData,
          //   ...stepData,
          //   projectIdentifier: projectIdentifier,
          //   orgIdentifier: orgIdentifier
          // }

          if (isGitSyncEnabled) {
            // Using git context set at 1st step while creating new connector
            // if (!props.isEditMode) {
            //   gitDetails = { branch: prevStepData?.branch, repoIdentifier: prevStepData?.repo }
            // }
            // openSaveToGitDialog({
            //   isEditing: props.isEditMode,
            //   resource: {
            //     type: Entities.CONNECTORS,
            //     name: data.connector?.name || '',
            //     identifier: data.connector?.identifier || '',
            //     gitDetails
            //   },
            //   payload: data
            // })
          }
        }}
        formName={`connectivityModeForm${props.type}`}
        // validationSchema={Yup.object().shape({
        //   name: NameSchema(),
        //   identifier: IdentifierSchema()
        // })}
        enableReinitialize
      >
        {formik => {
          return (
            <FormikForm>
              <Layout.Vertical style={{ minHeight: 460 }} width={'700px'} spacing={'medium'}>
                <Text
                  font={{ variation: FontVariation.H3 }}
                  color={Color.BLACK}
                  tooltipProps={{ dataTooltipId: 'ConnectivityModeTitle' }}
                >
                  {'How do you want to connect to the provider?'}
                </Text>
                <ConnectivityMode
                  formik={formik}
                  onChange={val => {
                    props.setConnectivityMode?.(val)
                    // console.log(props.connectivityMode)
                  }}
                />
              </Layout.Vertical>
              <Layout.Horizontal padding={{ top: 'medium' }} margin={{ top: 'xxxlarge' }} spacing="medium">
                <Button
                  text={getString('back')}
                  icon="chevron-left"
                  onClick={() => props?.previousStep?.(props?.prevStepData)}
                  data-name="awsBackButton"
                  variation={ButtonVariation.SECONDARY}
                />
                <Button
                  type="submit"
                  intent={'primary'}
                  text={getString(
                    formik.values.connectivityMode === ConnectivityModeType.Delegate ? 'continue' : 'saveAndContinue'
                  )}
                  //   className={css.saveAndContinue}
                  rightIcon="chevron-right"
                  data-testid="connectivitySaveAndContinue"
                />
              </Layout.Horizontal>
            </FormikForm>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}

export default ConnectivityModeStep
