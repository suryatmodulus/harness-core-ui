import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import {
  Layout,
  Button,
  Formik,
  Text,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  FormikForm as Form,
  StepProps,
  Color
} from '@wings-software/uicore'
// import * as Yup from 'yup'
import { noop } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { DelegateTypes } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { PageSpinner } from '@common/components'
import { useToaster } from '@common/exports'
import {
  useCreateConnector,
  useUpdateConnector,
  ConnectorConfigDTO,
  ConnectorRequestBody,
  ConnectorInfoDTO,
  ResponseConnectorResponse,
  Connector,
  EntityGitDetails
} from 'services/cd-ng'

import useSaveToGitDialog from '@common/modals/SaveToGitDialog/useSaveToGitDialog'
import { useGitDiffDialog } from '@common/modals/GitDiff/useGitDiffDialog'
import { Entities } from '@common/interfaces/GitSyncInterface'
import type { SaveToGitFormInterface } from '@common/components/SaveToGitForm/SaveToGitForm'
import { DelegateOptions, DelegateSelector } from './DelegateSelector/DelegateSelector'
import css from '@connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/DelegateSelector/DelegateSelector.module.scss'

interface BuildPayloadProps {
  projectIdentifier: string
  orgIdentifier: string
  delegateSelectors: Array<string>
}

interface ConnectorCreateEditProps {
  gitData?: SaveToGitFormInterface
  payload?: Connector
}

export interface DelegateSelectorProps {
  buildPayload: (data: BuildPayloadProps) => ConnectorRequestBody
  hideModal?: () => void
  onConnectorCreated?: (data?: ConnectorRequestBody) => void | Promise<void>
  isEditMode: boolean
  setIsEditMode?: (val: boolean) => void
  connectorInfo: ConnectorInfoDTO | void
  gitDetails?: EntityGitDetails
  customHandleCreate?: (
    payload: ConnectorConfigDTO,
    prevData: ConnectorConfigDTO,
    stepData: StepProps<ConnectorConfigDTO> & DelegateSelectorProps
  ) => Promise<ConnectorInfoDTO | undefined>
  customHandleUpdate?: (
    payload: ConnectorConfigDTO,
    prevData: ConnectorConfigDTO,
    stepData: StepProps<ConnectorConfigDTO> & DelegateSelectorProps
  ) => Promise<ConnectorInfoDTO | undefined>
}

type InitialFormData = { delegateSelectors: Array<string> }

const defaultInitialFormData: InitialFormData = {
  delegateSelectors: []
}

const NoMatchingDelegateWarning: React.FC = () => {
  const { getString } = useStrings()
  return (
    <Text
      icon="warning-sign"
      iconProps={{ margin: { right: 'xsmall' }, color: Color.YELLOW_900 }}
      font={{ size: 'small', weight: 'semi-bold' }}
    >
      {getString('connectors.delegate.noMatchingDelegate')}
    </Text>
  )
}

const DelegateSelectorStep: React.FC<StepProps<ConnectorConfigDTO> & DelegateSelectorProps> = props => {
  const {
    prevStepData,
    nextStep,
    buildPayload,
    customHandleCreate,
    customHandleUpdate,
    connectorInfo,
    gitDetails
  } = props
  const { accountId, projectIdentifier: projectIdentifierFromUrl, orgIdentifier: orgIdentifierFromUrl } = useParams<
    any
  >()
  const projectIdentifier = connectorInfo ? connectorInfo.projectIdentifier : projectIdentifierFromUrl
  const orgIdentifier = connectorInfo ? connectorInfo.orgIdentifier : orgIdentifierFromUrl
  const { showSuccess } = useToaster()
  const { getString } = useStrings()
  const { isGitSyncEnabled } = useAppStore()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()
  const { mutate: createConnector, loading: creating } = useCreateConnector({
    queryParams: { accountIdentifier: accountId }
  })
  const { mutate: updateConnector, loading: updating } = useUpdateConnector({
    queryParams: { accountIdentifier: accountId }
  })
  const [initialValues, setInitialValues] = useState<InitialFormData>(defaultInitialFormData)
  const [delegateSelectors, setDelegateSelectors] = useState<Array<string>>([])
  const [mode, setMode] = useState<DelegateOptions>(
    DelegateTypes.DELEGATE_IN_CLUSTER === prevStepData?.delegateType
      ? DelegateOptions.DelegateOptionsSelective
      : DelegateOptions.DelegateOptionsAny
  )
  const [delegatesFound, setDelegatesFound] = useState<boolean>(true)
  let stepDataRef: ConnectorConfigDTO | null = null
  const [connectorPayloadRef, setConnectorPayloadRef] = useState<Connector | undefined>()

  const afterSuccessHandler = (response: ResponseConnectorResponse): void => {
    props.onConnectorCreated?.(response?.data)
    showSuccess(
      getString(props.isEditMode ? 'connectors.successfullUpdate' : 'connectors.successfullCreate', {
        name: prevStepData?.name
      })
    )

    if (stepDataRef?.skipDefaultValidation) {
      props.hideModal?.()
    } else {
      nextStep?.({ ...prevStepData, ...stepDataRef } as ConnectorConfigDTO)
      props.setIsEditMode?.(true)
    }
  }

  const { openSaveToGitDialog } = useSaveToGitDialog({
    onSuccess: (gitData: SaveToGitFormInterface): void => {
      handleCreateOrEdit({ gitData, payload: connectorPayloadRef as Connector })
    },
    onClose: noop
  })

  const { openGitDiffDialog } = useGitDiffDialog<ConnectorCreateEditProps>({
    onSuccess: (data: ConnectorCreateEditProps): void => {
      try {
        handleCreateOrEdit(data)
      } catch (e) {
        //ignore error
      }
    },
    onClose: noop
  })

  const handleCreateOrEdit = async (connectorData: ConnectorCreateEditProps): Promise<void> => {
    const { gitData } = connectorData
    const payload = connectorData.payload || (connectorPayloadRef as Connector)

    try {
      modalErrorHandler?.hide()
      const queryParams = gitData ? { accountIdentifier: accountId, ...gitData } : {}

      const response = props.isEditMode
        ? await updateConnector(payload, {
            queryParams: gitData ? { ...queryParams, lastObjectId: gitDetails?.objectId } : queryParams
          })
        : await createConnector(payload, { queryParams: queryParams })
      afterSuccessHandler(response)
    } catch (e) {
      if (e.data?.code === 'SCM_CONFLICT_ERROR') {
        openGitDiffDialog(connectorData, connectorData?.gitData)
      } else {
        modalErrorHandler?.showDanger(e.data?.message || e.message)
      }
    }
  }

  useEffect(() => {
    const delegate = (props.connectorInfo as ConnectorInfoDTO & InitialFormData)?.spec?.delegateSelectors || []
    if (props.isEditMode) {
      setInitialValues({ delegateSelectors: delegate })
      setDelegateSelectors(delegate)
    }
  }, [])
  return (
    <Layout.Vertical height={'inherit'} padding={{ left: 'small' }}>
      <Text font="medium" margin={{ top: 'small' }} color={Color.BLACK}>
        {getString('delegateSelection')}
      </Text>
      {updating ? (
        <PageSpinner />
      ) : (
        <Formik
          initialValues={{
            ...initialValues,
            ...prevStepData
          }}
          //   Enable when delegateSelector adds form validation
          // validationSchema={Yup.object().shape({
          //   delegateSelector: Yup.string().when('delegateType', {
          //     is: DelegateTypes.DELEGATE_IN_CLUSTER,
          //     then: Yup.string().trim().required(i18n.STEP.TWO.validation.delegateSelector)
          //   })
          // })}
          onSubmit={stepData => {
            const connectorData: BuildPayloadProps = {
              ...prevStepData,
              ...stepData,
              delegateSelectors,
              projectIdentifier: projectIdentifier,
              orgIdentifier: orgIdentifier
            }

            const data = buildPayload(connectorData)
            setConnectorPayloadRef(data)
            stepDataRef = stepData
            if (isGitSyncEnabled) {
              openSaveToGitDialog(props.isEditMode, {
                type: Entities.CONNECTORS,
                name: data.connector?.name || '',
                identifier: data.connector?.identifier || '',
                gitDetails
              })
            } else {
              if (customHandleUpdate || customHandleCreate) {
                props.isEditMode
                  ? customHandleUpdate?.(data, { ...prevStepData, ...stepData }, props)
                  : customHandleCreate?.(data, { ...prevStepData, ...stepData }, props)
              } else {
                handleCreateOrEdit({ payload: data })
              }
            }
          }}
        >
          <Form>
            <ModalErrorHandler bind={setModalErrorHandler} />
            <DelegateSelector
              mode={mode}
              setMode={setMode}
              delegateSelectors={delegateSelectors}
              setDelegateSelectors={setDelegateSelectors}
              setDelegatesFound={setDelegatesFound}
              delegateSelectorMandatory={DelegateTypes.DELEGATE_IN_CLUSTER === prevStepData?.delegateType}
            />
            <Layout.Horizontal padding={{ top: 'small' }} margin={{ top: 'xxxlarge' }} spacing="medium">
              <Button
                text={getString('back')}
                icon="chevron-left"
                onClick={() => props?.previousStep?.(props?.prevStepData)}
                data-name="awsBackButton"
              />
              <Button
                type="submit"
                intent={'primary'}
                text={getString('saveAndContinue')}
                className={css.saveAndContinue}
                disabled={
                  (DelegateTypes.DELEGATE_IN_CLUSTER === prevStepData?.delegateType &&
                    delegateSelectors.length === 0) ||
                  creating ||
                  updating
                }
                rightIcon="chevron-right"
              />
              {!delegatesFound ? <NoMatchingDelegateWarning /> : <></>}
            </Layout.Horizontal>
          </Form>
        </Formik>
      )}
    </Layout.Vertical>
  )
}

export default DelegateSelectorStep
