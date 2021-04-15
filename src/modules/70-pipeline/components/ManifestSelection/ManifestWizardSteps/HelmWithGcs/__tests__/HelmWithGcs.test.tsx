import React from 'react'
import { render, queryByAttribute, fireEvent, act, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import HelmWithGcs from '../HelmWithGcs'

const props = {
  stepName: 'Manifest details',
  expressions: [],
  handleSubmit: jest.fn()
}
describe('helm with http tests', () => {
  test(`renders without crashing`, () => {
    const initialValues = {
      identifier: '',
      helmVersion: 'V2',
      chartName: '',
      chartVersion: '',
      skipResourceVersioning: false,
      bucketName: '',
      folderPath: '',
      commandFlags: [{ commandType: undefined, flag: undefined, id: 'id1' }]
    }
    const { container } = render(
      <TestWrapper>
        <HelmWithGcs {...props} initialValues={initialValues} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`renders while adding step first time`, () => {
    const initialValues = {
      identifier: '',
      helmVersion: 'V2',
      chartName: '',
      chartVersion: '',
      skipResourceVersioning: false,
      store: {
        type: 'Gcs',
        spec: {
          connectorRef: '',
          bucketName: '',
          folderPath: ''
        }
      },
      commandFlags: [{ commandType: undefined, flag: undefined, id: 'id2' }]
    }

    const { container } = render(
      <TestWrapper>
        <HelmWithGcs initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`renders correctly in edit case`, () => {
    const initialValues = {
      identifier: 'id3',
      helmVersion: 'V2',
      chartName: '',
      chartVersion: '',
      skipResourceVersioning: false,
      store: {
        type: 'Gcs',
        spec: {
          connectorRef: 'connectorref',
          bucketName: 'bucketName',
          folderPath: 'folderPath'
        }
      },
      commandFlags: [{ commandType: 'Template', flag: 'testflag', id: 'a1' }]
    }

    const { container } = render(
      <TestWrapper>
        <HelmWithGcs initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('submits with the right payload', async () => {
    const initialValues = {
      identifier: '',
      helmVersion: 'V2',
      chartName: '',
      chartVersion: '',
      skipResourceVersioning: false,
      store: {
        type: 'Gcs',
        spec: {
          connectorRef: 'connectorref',
          bucketName: 'bucketName',
          folderPath: 'folderPath'
        }
      },
      commandFlags: [{ commandType: 'Fetch', flag: 'flag', id: 'a1' }]
    }

    const { container } = render(
      <TestWrapper>
        <HelmWithGcs initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    await act(async () => {
      fireEvent.change(queryByNameAttribute('identifier')!, { target: { value: 'testidentifier' } })
      fireEvent.change(queryByNameAttribute('folderPath')!, { target: { value: 'test-folder ' } })
      fireEvent.change(queryByNameAttribute('bucketName')!, { target: { value: 'testbucket' } })
      fireEvent.change(queryByNameAttribute('chartName')!, { target: { value: 'testchart' } })
      fireEvent.change(queryByNameAttribute('chartVersion')!, { target: { value: 'v1' } })
    })
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() => {
      expect(props.handleSubmit).toHaveBeenCalledWith({
        manifest: {
          identifier: 'testidentifier',
          spec: {
            store: {
              spec: {
                bucketName: 'testbucket',
                connectorRef: '',
                folderPath: 'test-folder '
              },
              type: undefined
            },
            chartName: 'testchart',
            chartVersion: 'v1',
            helmVersion: 'V2',
            skipResourceVersioning: false
          }
        }
      })
    })
  })
})
