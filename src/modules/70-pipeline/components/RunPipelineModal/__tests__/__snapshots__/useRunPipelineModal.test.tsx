import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { TestWrapper } from '@common/utils/testUtils'
import { RunPipelineModalParams, useRunPipelineModal } from '../../useRunPipelineModal'

const props: RunPipelineModalParams & GitQueryParams = {
  pipelineIdentifier: 'pipelineIdentifier',
  branch: 'propsBranch',
  repoIdentifier: 'propsRepo'
}

jest.mock('@common/RouteDefinitions', () => ({
  toPipelineStudio: jest.fn()
}))

const Wrapped = (): React.ReactElement => {
  const runPipeline = useRunPipelineModal({ ...props })
  return (
    <>
      <button className="check" onClick={runPipeline} />
    </>
  )
}

const WrappedWithInputSets = (): React.ReactElement => {
  const runPipeline = useRunPipelineModal({
    ...props,
    inputSetSelected: [
      {
        type: 'INPUT_SET',
        label: 'is1',
        value: 'is1',
        gitDetails: {
          branch: 'br',
          repoIdentifier: 'repo'
        }
      }
    ]
  })
  return (
    <>
      <button className="check" onClick={runPipeline} />
    </>
  )
}

const WrappedWithInputSetsWithoutGitDetails = (): React.ReactElement => {
  const runPipeline = useRunPipelineModal({
    ...props,
    inputSetSelected: [
      {
        type: 'INPUT_SET',
        label: 'is1',
        value: 'is1'
      }
    ]
  })
  return (
    <>
      <button className="check" onClick={runPipeline} />
    </>
  )
}

describe('useRunPipelineModal tests', () => {
  test('without input sets', () => {
    const routesSpy = jest.spyOn(routes, 'toPipelineStudio')
    const { container } = render(
      <TestWrapper>
        <Wrapped />
      </TestWrapper>
    )

    const mockedButton = container.querySelector('.check')
    fireEvent.click(mockedButton!)
    expect(routesSpy).toBeCalledWith({
      accountId: undefined,
      branch: 'propsBranch',
      module: undefined,
      orgIdentifier: undefined,
      pipelineIdentifier: 'pipelineIdentifier',
      projectIdentifier: undefined,
      repoIdentifier: 'propsRepo',
      runPipeline: true
    })
  })

  test('with selected input sets', () => {
    const routesSpy = jest.spyOn(routes, 'toPipelineStudio')
    const { container } = render(
      <TestWrapper>
        <WrappedWithInputSets />
      </TestWrapper>
    )

    const mockedButton = container.querySelector('.check')
    fireEvent.click(mockedButton!)

    expect(routesSpy).toBeCalledWith({
      accountId: undefined,
      branch: 'propsBranch',
      module: undefined,
      orgIdentifier: undefined,
      pipelineIdentifier: 'pipelineIdentifier',
      projectIdentifier: undefined,
      repoIdentifier: 'propsRepo',
      inputSetType: 'INPUT_SET',
      inputSetLabel: 'is1',
      inputSetValue: 'is1',
      inputSetBranch: 'br',
      inputSetRepoIdentifier: 'repo',
      runPipeline: true
    })
  })

  test('with selected input sets but without git details', () => {
    const routesSpy = jest.spyOn(routes, 'toPipelineStudio')
    const { container } = render(
      <TestWrapper>
        <WrappedWithInputSetsWithoutGitDetails />
      </TestWrapper>
    )

    const mockedButton = container.querySelector('.check')
    fireEvent.click(mockedButton!)

    expect(routesSpy).toBeCalledWith({
      accountId: undefined,
      branch: 'propsBranch',
      module: undefined,
      orgIdentifier: undefined,
      pipelineIdentifier: 'pipelineIdentifier',
      projectIdentifier: undefined,
      repoIdentifier: 'propsRepo',
      inputSetType: 'INPUT_SET',
      inputSetLabel: 'is1',
      inputSetValue: 'is1',
      inputSetBranch: undefined,
      inputSetRepoIdentifier: undefined,
      runPipeline: true
    })
  })
})
