import React from 'react'
import { render, queryByAttribute, fireEvent, act, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ManifestDataType } from '@pipeline/components/ManifestSelection/Manifesthelper'
import HelmWithGcs from '../HelmWithGcs'

const props = {
  stepName: 'Manifest details',
  expressions: [],
  handleSubmit: jest.fn(),
  manifestIdsList: []
}

const mockBukcets = {
  resource: { bucket1: 'bucket1', testbucket: 'testbucket' }
}

jest.mock('services/cd-ng', () => ({
  useGetGCSBucketList: jest.fn().mockImplementation(() => {
    return { data: mockBukcets, refetch: jest.fn(), error: null, loading: false }
  })
}))
describe('helm with http tests', () => {
  test(`renders without crashing`, () => {
    const initialValues = {
      identifier: '',
      spec: {},
      type: ManifestDataType.HelmChart,
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

  test('expand advanced section', () => {
    const initialValues = {
      identifier: '',
      spec: {},
      type: ManifestDataType.HelmChart,
      helmVersion: 'V2',
      chartName: '',
      chartVersion: '',
      skipResourceVersioning: false,
      bucketName: '',
      folderPath: '',
      commandFlags: [{ commandType: undefined, flag: undefined, id: 'id1' }]
    }
    const { container, getByText } = render(
      <TestWrapper>
        <HelmWithGcs {...props} initialValues={initialValues} />
      </TestWrapper>
    )

    fireEvent.click(getByText('advancedTitle'))
    expect(container).toMatchSnapshot()
  })

  test(`renders while adding step first time`, () => {
    const initialValues = {
      identifier: '',
      helmVersion: 'V2',
      spec: {},
      type: ManifestDataType.HelmChart,
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
      spec: {},
      type: ManifestDataType.HelmChart,
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

      type: ManifestDataType.HelmChart,
      chartName: '',
      chartVersion: '',

      spec: {
        helmVersion: 'V2',
        skipResourceVersioning: false,
        store: {
          type: 'Gcs',
          spec: {
            connectorRef: 'connectorref',
            bucketName: { label: 'testbucket', value: 'testbucket' },
            folderPath: 'folderPath'
          }
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

      fireEvent.change(queryByNameAttribute('chartName')!, { target: { value: 'testchart' } })
      fireEvent.change(queryByNameAttribute('chartVersion')!, { target: { value: 'v1' } })
    })
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    expect(container).toMatchSnapshot()
    await waitFor(() => {
      expect(props.handleSubmit).toHaveBeenCalledWith({
        manifest: {
          identifier: 'testidentifier',
          type: 'HelmChart',
          spec: {
            store: {
              spec: {
                bucketName: {
                  label: 'testbucket',
                  value: 'testbucket'
                },
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
