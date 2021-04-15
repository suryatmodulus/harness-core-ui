import React from 'react'
import { render } from '@testing-library/react'
import ArtifactsComponent, { ArtifactGroup } from '../ArtifactsComponent'
import artifacts from './artifacts-mock.json'

describe('ArtifactsComponent snapshot test', () => {
  test('should render properly', async () => {
    const { container } = render(<ArtifactsComponent artifactGroups={artifacts as ArtifactGroup[]} />)
    expect(container).toMatchSnapshot()
  })
})
