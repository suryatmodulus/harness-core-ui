import React from 'react'
import { act, fireEvent, queryByAttribute, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { TagTypes } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { ImagePath } from '../ImagePath'

const props = {
  name: 'Artifact details',
  expressions: [],
  context: 2,
  handleSubmit: jest.fn()
}

jest.mock('services/cd-ng', () => ({
  useGetBuildDetailsForDocker: jest.fn().mockImplementation(() => {
    return { data: { buildDetailsList: [] }, refetch: jest.fn(), error: null, loading: false }
  })
}))
describe('DockerRegistry Image Path Artifact tests', () => {
  test(`renders without crashing`, () => {
    const initialValues = {
      identifier: '',
      imagePath: '',
      tag: '',
      tagType: TagTypes.Value,
      tagRegex: ''
    }

    const { container } = render(
      <TestWrapper>
        <ImagePath key={'key'} initialValues={initialValues} {...props} />
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
      tagRegex: ''
    }

    const { container } = render(
      <TestWrapper>
        <ImagePath key={'key'} initialValues={initialValues} {...props} />
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
      tagType: TagTypes.Regex
    }

    const { container } = render(
      <TestWrapper>
        <ImagePath key={'key'} initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('submits with the right payload ', async () => {
    const initialValues = {
      identifier: '',
      spec: {
        imagePath: ''
      },
      type: 'DockerRegistry',
      imagePath: '',
      tag: '',
      tagType: TagTypes.Value,
      tagRegex: ''
    }

    const { container } = render(
      <TestWrapper>
        <ImagePath key={'key'} initialValues={initialValues} {...props} />
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
          tagRegex: 'tag'
        }
      })
    })
  })

  test('submits with the right payload with Tagregex data ', async () => {
    const initialValues = {
      identifier: '',
      spec: {
        imagePath: ''
      },
      type: 'DockerRegistry',
      imagePath: '',
      tag: '',
      tagType: TagTypes.Value,
      tagRegex: ''
    }

    const { container } = render(
      <TestWrapper>
        <ImagePath key={'key'} initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    await act(async () => {
      fireEvent.change(queryByNameAttribute('identifier')!, { target: { value: 'testidentifier2' } })
      fireEvent.change(queryByNameAttribute('imagePath')!, { target: { value: 'image-path' } })
      fireEvent.change(queryByNameAttribute('tagRegex')!, { target: { value: 'tagregex' } })
    })
    fireEvent.click(container.querySelector('button[type="submit"]')!)

    await waitFor(() => {
      expect(props.handleSubmit).toHaveBeenCalledWith({
        identifier: 'testidentifier2',
        spec: {
          connectorRef: '',
          imagePath: 'image-path',
          tagRegex: 'tagregex'
        }
      })
    })
  })
})
