import React from 'react'
import { StepWizard } from '@wings-software/uicore'
import { Connectors, CreateConnectorModalProps, TESTCONNECTION_STEP_INDEX } from '@connectors/constants'
import { useStrings } from 'framework/strings'
import { getConnectorIconByType, getConnectorTitleIdByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
import { BaseForm } from './BaseForm'
import { dsconfigTypetoResourcesConnectorDetailsTitle } from '../CommonCVConnector/utils'
import ConnectorDetailsStep from '../commonSteps/ConnectorDetailsStep'
import DelegateSelectorStep from '../commonSteps/DelegateSelectorStep/DelegateSelectorStep'
import { builstCustomHealthPayload } from './CustonPayloadBuilder'

export default function CreateCustomConnector(props: CreateConnectorModalProps): JSX.Element {
  const { getString } = useStrings()
  console.log('proooooooooops', props)
  const { isEditMode, connectorInfo, onClose, onSuccess, setIsEditMode } = props
  return (
    <StepWizard
      icon={getConnectorIconByType(Connectors.CUSTOM)}
      iconProps={{ size: 37 }}
      title={getString(getConnectorTitleIdByType(Connectors.CUSTOM))}
    >
      <ConnectorDetailsStep
        isEditMode={isEditMode}
        connectorInfo={connectorInfo}
        gitDetails={props.gitDetails}
        type={Connectors.CUSTOM}
        name={dsconfigTypetoResourcesConnectorDetailsTitle(Connectors.CUSTOM, getString)}
      />
      {/* <StepWizard> */}
      <BaseForm {...{ ...props, name: 'headers' }} key="headers" />
      <BaseForm {...{ ...props, name: 'parameters' }} key="parameters" />
      <BaseForm {...{ ...props, name: 'validation', title: 'Validation Path' }} key="validation" />
      {/* </StepWizard> */}
      <DelegateSelectorStep
        name={getString('delegate.DelegateselectionLabel')}
        hideModal={onClose}
        onConnectorCreated={onSuccess}
        connectorInfo={connectorInfo}
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
        buildPayload={builstCustomHealthPayload as any}
      />
      <VerifyOutOfClusterDelegate
        name={`${getString('verify')} ${getString('connection')}`}
        connectorInfo={props.connectorInfo}
        onClose={onClose}
        isStep
        isLastStep
        type={Connectors.CUSTOM}
        stepIndex={TESTCONNECTION_STEP_INDEX}
      />
    </StepWizard>
  )
}
