import React from 'react'

export const onNextMock = jest.fn()
const mockCVConnectorHoc = (input: any) => {
  const { ConnectorCredentialsStep, nestedStep } = input
  return function Wrapper(props: any) {
    return nestedStep ? (
      nestedStep
    ) : (
      <ConnectorCredentialsStep {...props} nextStep={onNextMock} prevStepData={props.connectorInfo} />
    )
  }
}

jest.mock('../CVConnectorHOC', () => ({
  ...(jest.requireActual('../CVConnectorHOC') as any),
  cvConnectorHOC: mockCVConnectorHoc
}))
