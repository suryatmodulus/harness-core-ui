import React from 'react'
import { act, fireEvent, getByText, queryAllByText, render, waitFor } from '@testing-library/react'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'

import { SelectArtifactModal } from '../views/modals'

const defaultProps = {
  isModalOpen: true,
  formikProps: {},
  artifactTableData: [
    {
      artifactId: 'dsfds',
      artifactLabel: 'stagea: dsfds',
      artifactRepository: undefined,
      hasRuntimeInputs: true,
      stageId: 'stagea'
    }
  ],
  closeModal: jest.fn(),
  isManifest: true,
  runtimeData: [
    {
      stage: {
        identifier: 'stagea',
        spec: {
          serviceConfig: {
            serviceDefinition: {
              spec: {
                manifests: []
              }
            }
          }
        }
      }
    }
  ]
}

jest.mock('@pipeline/factories/ArtifactTriggerInputFactory', () => ({
  getTriggerFormDetails: jest.fn().mockImplementation(() => () => {
    return {
      component: <div>ABC</div>
    }
  })
}))
describe('Select Artifact Modal tests', () => {
  test('inital Render', () => {
    render(
      <TestWrapper>
        <SelectArtifactModal {...defaultProps} />
      </TestWrapper>
    )

    const dialog = findDialogContainer() as HTMLElement

    expect(dialog).toMatchSnapshot()
  })

  test('on click of cancel button', async () => {
    render(
      <TestWrapper>
        <SelectArtifactModal {...defaultProps} />
      </TestWrapper>
    )
    await act(async () => {
      const dialog = findDialogContainer() as HTMLElement
      const cancelBtn = getByText(dialog, 'cancel')

      fireEvent.click(cancelBtn!)

      expect(defaultProps.closeModal).toBeCalled()
    })
  })

  test('on click of select button', async () => {
    render(
      <TestWrapper>
        <SelectArtifactModal {...defaultProps} />
      </TestWrapper>
    )

    const dialog = findDialogContainer() as HTMLElement

    await act(async () => {
      const firstRow = dialog.querySelector('.table .body .row:first-child')
      const radioBtn = firstRow?.querySelector('input[name=artifactLabel]')
      fireEvent.change(radioBtn!, { target: { value: true } })

      const selectBtn = getByText(dialog, 'select')

      expect(selectBtn).not.toBeDisabled()

      fireEvent.click(selectBtn!)
    })
    await waitFor(() =>
      queryAllByText(dialog, 'pipeline.triggers.artifactTriggerConfigPanel.configureArtifactRuntimeInputs')
    )
    expect(dialog).toMatchSnapshot()
  })
})
