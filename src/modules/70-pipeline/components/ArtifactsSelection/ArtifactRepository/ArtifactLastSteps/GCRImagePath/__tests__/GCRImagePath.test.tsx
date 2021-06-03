import React from 'react'
import { act, fireEvent, queryByAttribute, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { TagTypes } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { GCRImagePath } from '../GCRImagePath'

const props = {
  name: 'Artifact details',
  expressions: [],
  context: 2,
  handleSubmit: jest.fn(),
  artifactIdentifiers: []
}

describe('GCR Image Path Artifact tests', () => {
  test(`renders without crashing`, () => {
    const initialValues = {
      identifier: '',
      imagePath: '',
      tag: '',
      tagType: TagTypes.Value,
      tagRegex: '',
      registryHostname: ''
    }

    const { container } = render(
      <TestWrapper>
        <GCRImagePath key={'key'} initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`renders while adding step first time`, () => {
    const initialValues = {
      identifier: 'id',
      imagePath: 'library/nginx',
      tag: '',
      tagType: TagTypes.Value,
      tagRegex: '',
      registryHostname: ''
    }

    const { container } = render(
      <TestWrapper>
        <GCRImagePath key={'key'} initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`renders correctly in edit case`, () => {
    const initialValues = {
      identifier: 'id',
      imagePath: 'library/nginx',
      tag: '',
      tagRegex: 'someregex',
      tagType: TagTypes.Regex,
      region: { name: 'region', value: 'region' }
    }

    const { container } = render(
      <TestWrapper>
        <GCRImagePath key={'key'} initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('submits with the right payload ', async () => {
    const initialValues = {
      identifier: '',
      spec: {
        registryHostname: 'registryHostname-data'
      },
      type: 'GCR',
      imagePath: '',
      tag: '',
      tagType: TagTypes.Value,
      tagRegex: ''
    }

    const { container } = render(
      <TestWrapper>
        <GCRImagePath key={'key'} initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    await act(async () => {
      fireEvent.change(queryByNameAttribute('identifier')!, { target: { value: 'testidentifier' } })
      fireEvent.change(queryByNameAttribute('imagePath')!, { target: { value: 'image-path' } })
      fireEvent.change(queryByNameAttribute('tagRegex')!, { target: { value: 'tag' } })
    })
    fireEvent.click(container.querySelector('button[type="submit"]')!)

    await waitFor(() => {
      expect(props.handleSubmit).toHaveBeenCalledWith({
        identifier: 'testidentifier',
        spec: {
          connectorRef: '',
          imagePath: 'image-path',
          registryHostname: 'registryHostname-data',
          tagRegex: 'tag'
        }
      })
    })
  })

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('submits with the right payload with Tagregex data ', async () => {
    const initialValues = {
      identifier: '',
      spec: {
        registryHostname: ''
      },
      type: 'GCR',
      imagePath: '',
      tag: '',
      tagType: TagTypes.Value,
      tagRegex: ''
    }

    const { container } = render(
      <TestWrapper>
        <GCRImagePath key={'key'} initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    await act(async () => {
      fireEvent.change(queryByNameAttribute('identifier')!, { target: { value: 'testidentifier2' } })
      fireEvent.change(queryByNameAttribute('imagePath')!, { target: { value: 'image-path' } })
      fireEvent.change(queryByNameAttribute('registryHostname')!, { target: { value: 'registryHostname-data1' } })
      fireEvent.change(queryByNameAttribute('tagRegex')!, { target: { value: 'tagregex' } })
    })
    fireEvent.click(container.querySelector('button[type="submit"]')!)

    await waitFor(() => {
      expect(props.handleSubmit).toHaveBeenCalledWith({
        identifier: 'testidentifier2',
        spec: {
          connectorRef: '',
          imagePath: 'image-path',
          registryHostname: 'registryHostname-data1',
          tagRegex: 'tagregex'
        }
      })
    })
  })
})
