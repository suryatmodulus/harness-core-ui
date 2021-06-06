import React from 'react'
import { Button, Heading, Layout, Text, StepProps, Container } from '@wings-software/uicore'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import css from '../../CreateCeAzureConnector.module.scss'

interface CommandsProps {
  command: string
  comment: string
}

const CreateServicePrincipal: React.FC<StepProps<ConnectorInfoDTO>> = (props): JSX.Element => {
  const { prevStepData, previousStep, nextStep } = props

  const saveAndContinue = () => {
    nextStep?.({ ...(prevStepData as ConnectorInfoDTO) })
  }

  return (
    <Layout.Vertical spacing="large" className={css.stepContainer}>
      <Heading color="grey800" level={2} style={{ fontSize: 20 }}>
        Create Service Principal
      </Heading>
      <Text>
        You can Create a Service Principal and assign permissions by running the following commands in the Command line
      </Text>
      <Container className={css.commandsContainer}>
        <Commands comment={'# Register the Harness app'} command={`az ad sp create --id ${'SOME_ID'}`} />
        <Commands
          comment={'# Role is assigned to this scope'}
          command={'SCOPE=`az storage account show --name cesrcbillingstorage --query "id" | xargs`'}
        />
        <Commands
          comment={'# Assign role to the app on the scope fetched above'}
          command={`az role assignment create --assignee --role 'Storage Blob Data Reader' --scope $SCOPE`}
        />
      </Container>
      <Layout.Horizontal spacing="medium" className={css.continueAndPreviousBtns}>
        <Button text="Previous" icon="chevron-left" onClick={() => previousStep?.(prevStepData)} />
        <Button
          type="submit"
          intent="primary"
          rightIcon="chevron-right"
          disabled={false}
          onClick={() => saveAndContinue()}
        >
          Continue
        </Button>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

const Commands: React.FC<CommandsProps> = ({ command, comment }) => {
  return (
    <>
      <Text>{comment}</Text>
      <pre>{command}</pre>
    </>
  )
}

export default CreateServicePrincipal
