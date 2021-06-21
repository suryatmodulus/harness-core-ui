import { Container, Heading, Text } from '@wings-software/uicore'
import React from 'react'
import css from '../../CreateCeAzureConnector.module.scss'

interface Step {
  text: string
  children?: Step[]
}

const steps: Step[] = [
  { text: 'Click on Add to create a new Export.' },
  { text: 'In Export Details, provide Name' },
  { text: 'For Export type, select "Daily export of month-to-date costs' },
  { text: 'Leave the Start date as Today' },
  {
    text: 'For the Storage, select Use existing or Create new.',
    children: [
      {
        text: 'If use existing',
        children: [
          { text: 'Select the Subscription where your storage account is present' },
          { text: 'Select the Storage account' }
        ]
      },
      {
        text: 'If create new',
        children: [
          { text: 'Select the Subscription where you want to create the storage account' },
          { text: 'Select Resource group name for this storage account' },
          { text: 'Provide the Storage account name' },
          { text: 'Provide the Location' }
        ]
      }
    ]
  },
  { text: 'Provide the Container name' },
  { text: 'Provide the Directory name' },
  { text: 'Review your export details and click on Create.' }
]

const AzureConnectorBillingExtension: React.FC = () => {
  function renderSteps(s: Step[] = [], type?: string) {
    if (!s.length) return s
    const markup = s.map((step, idx) => {
      return (
        <li key={idx}>
          {step.text}
          {step.children && renderSteps(step.children)}
        </li>
      )
    })

    return type === 'number' ? <ol type="1">{markup}</ol> : <ul>{markup}</ul>
  }

  return (
    <Container>
      <Heading level={2} className={css.header}>
        How to Create a Billing Export?
      </Heading>
      <Text font="normal" color="grey1000">
        After logging into Azure billing export:
      </Text>
      <Container>
        <ol type="1">{renderSteps(steps, 'number')}</ol>
      </Container>
      <Text font="normal" color="grey1000">
        Your new export appears in the list of exports.
      </Text>
      <Container color="grey1000" font="normal">
        <dl>
          <dt>Useful links:</dt>
          <dd>
            <a>- Watch help video</a> <i> (coming soon)</i>
          </dd>
          <dd>
            <a href="https://docs.harness.io/article/7idbmchsim-set-up-cost-visibility-for-azure#set-up-cost-visibility-for-azure">
              - Harness Documentation
            </a>
          </dd>
          <dd>
            <a href="https://docs.harness.io/article/7idbmchsim-set-up-cost-visibility-for-azure#step_2_enable_billing_export_for_azure_subscription">
              - Creating a Billing Export
            </a>
          </dd>
        </dl>
      </Container>
    </Container>
  )
}

export default AzureConnectorBillingExtension
