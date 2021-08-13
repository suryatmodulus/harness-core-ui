import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ManifestDataType } from '@pipeline/components/ManifestSelection/Manifesthelper'
import HelmWithS3 from '../HelmWithS3'

const props = {
  stepName: 'Manifest details',
  expressions: [],
  handleSubmit: jest.fn(),
  manifestIdsList: []
}

const mockRegions = {
  resource: [{ name: 'region1', value: 'region1' }]
}

const mockBuckets = {
  resource: [{ name: 'test-bucket', value: 'test-bucket' }]
}

jest.mock('services/portal', () => ({
  useListAwsRegions: jest.fn().mockImplementation(() => {
    return { data: mockRegions, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetBucketListForS3: jest.fn().mockImplementation(() => {
    return { data: mockBuckets, refetch: jest.fn(), error: null, loading: false }
  })
}))

describe('helm with S3 tests', () => {
  test(`renders without crashing`, () => {
    const initialValues = {
      identifier: 'test',
      spec: {},
      type: ManifestDataType.HelmChart,
      bucketName: { label: 'test-bucket', value: 'test-bucket' },
      region: { name: '', value: '' },
      folderPath: 'testfolder',
      helmVersion: 'V2',
      chartName: 'testChart',
      chartVersion: 'v1',
      skipResourceVersioning: false
    }
    const { container } = render(
      <TestWrapper>
        <HelmWithS3 {...props} initialValues={initialValues} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('expand advanced section', () => {
    const initialValues = {
      identifier: 'test',
      bucketName: { label: 'test-bucket', value: 'test-bucket' },
      spec: {},
      type: ManifestDataType.HelmChart,
      region: { name: '', value: '' },
      folderPath: 'testfolder',
      helmVersion: 'V2',
      chartName: 'testChart',
      chartVersion: 'v1',
      skipResourceVersioning: false
    }
    const { container, getByText } = render(
      <TestWrapper>
        <HelmWithS3 {...props} initialValues={initialValues} />
      </TestWrapper>
    )

    fireEvent.click(getByText('advancedTitle'))
    expect(container).toMatchSnapshot()
  })

  test('load form correctly in edit mode and fill region', () => {
    const initialValues = {
      identifier: 'test',
      type: ManifestDataType.HelmChart,
      spec: {
        store: {
          type: 'S3',
          spec: {
            connectorRef: 'test',
            bucketName: 'test-bucket',
            folderPath: 'testfolder',
            region: 'region1'
          }
        },
        chartName: 'testChart',
        chartVersion: 'v1',
        helmVersion: 'V2',
        skipResourceVersioning: false
      }
    }
    const { container } = render(
      <TestWrapper>
        <HelmWithS3 {...props} initialValues={initialValues} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  // eslint-disable-next-line jest/no-disabled-tests
  test.skip(`submits with the right payload`, async () => {
    const initialValues = {
      identifier: 'testidentifier',

      spec: {
        bucketName: 'test-bucket',
        connectorRef: 'awsconnectora',
        folderPath: 'sdfds',
        region: 'region1'
      },
      type: ManifestDataType.HelmChart,

      folderPath: 'testFolder',
      helmVersion: 'V2',
      chartName: 'testchart',
      chartVersion: 'v1',
      skipResourceVersioning: false,
      commandFlags: [{ commandType: undefined, flag: undefined, id: 'id1' }]
    }
    const { container } = render(
      <TestWrapper>
        <HelmWithS3 {...props} initialValues={initialValues} />
      </TestWrapper>
    )

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
                bucketName: 'test-bucket',
                connectorRef: '',
                folderPath: 'testFolder',
                region: 'region1'
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
