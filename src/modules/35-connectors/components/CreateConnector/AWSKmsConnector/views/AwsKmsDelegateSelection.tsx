import React from 'react'
import { Text, Color, Button, Layout, Container } from '@wings-software/uicore'
// import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/exports'
import type { AwsKmsConfigDataProps } from './AwsKmsConfig'

const AwsKmsDelegateSelection: React.FC<AwsKmsConfigDataProps> = ({
  // onSubmit,
  // connectorInfo,
  // isEditMode,
  isLoading,
  previousStep,
  prevStepData
}) => {
  const { getString } = useStrings()
  // const { accountId } = useParams()
  //   const [initialValues, setInitialValues] = useState(defaultInitialFormData)
  //   const [loadingConnectorSecrets, setLoadingConnectorSecrets] = useState(true && isEditMode)

  //   useEffect(() => {
  //     if (loadingConnectorSecrets) {
  //       if (isEditMode) {
  //         if (connectorInfo) {
  //           setupAwsKmsFormData(connectorInfo, accountId).then(data => {
  //             setInitialValues(data as AwsAccessKeyFormData)
  //             setLoadingConnectorSecrets(false)
  //           })
  //         } else {
  //           setLoadingConnectorSecrets(false)
  //         }
  //       }
  //     }
  //   }, [loadingConnectorSecrets])

  return (
    <Container style={{ minHeight: 460, marginTop: 'var(--spacing-xxlarge)' }}>
      <Layout.Horizontal spacing="medium">
        <Container style={{ minHeight: 460, marginTop: 'var(--spacing-xxlarge)' }}>
          <Text font={{ size: 'medium' }} style={{ marginBottom: 'var(--spacing-medium)' }} color={Color.BLACK}>
            {getString('connectors.title.delegateSelection')}
          </Text>
        </Container>
        <Button text={getString('back')} onClick={() => previousStep?.(prevStepData)} />
        <Button
          type="submit"
          intent="primary"
          rightIcon="chevron-right"
          text={getString('saveAndContinue')}
          disabled={isLoading}
        />
      </Layout.Horizontal>
    </Container>
  )
}

export default AwsKmsDelegateSelection
