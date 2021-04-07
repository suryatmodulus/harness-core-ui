import React from 'react'
import { render, fireEvent, act, wait, queryByAttribute } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import HelmWithHttp from '../HelmWithHttp'

const props = {
  stepName: 'Manifest details',
  expressions: [],
  initialValues: {
    helmVersion: 'test',
    chartName: 'test',
    chartVersion: 'v3'
  },
  handleSubmit: jest.fn()
}
describe('helm with http tests', () => {
  test(`renders without crashing`, () => {
    const { container } = render(
      <TestWrapper>
        <HelmWithHttp {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('submits with the right payload', async () => {
    const { container } = render(
      <TestWrapper>
        <HelmWithHttp {...props} />
      </TestWrapper>
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    await act(async () => {
      fireEvent.change(queryByNameAttribute('identifier')!, { target: { value: 'testidentifier' } })
      fireEvent.change(queryByNameAttribute('chartName')!, { target: { value: 'testchart' } })
      fireEvent.change(queryByNameAttribute('chartVersion')!, { target: { value: 'v1' } })
    })
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await wait(() => {
      expect(props.handleSubmit).toHaveBeenCalledWith({
        manifest: {
          identifier: 'testidentifier',
          spec: {
            chartName: 'testchart',
            chartVersion: 'v1',
            store: {
              spec: {
                connectorRef: ''
              },
              type: undefined
            },
            helmVersion: 'V2',
            skipResourceVersioning: false
          }
        }
      })
    })
  })
})
