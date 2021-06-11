import React from 'react'
import type { Story, Meta } from '@storybook/react'
// import styled from '@emotion/styled'
import { TestWrapper } from '@common/utils/testUtils'

import { ApprovalTab, ApprovalTabProps } from './ApprovalTab'
import harnessApprovalData from './__tests__/HarnessApprovalData.json'
import jiraApprovalData from './__tests__/JiraAprovalData.json'

export default {
  title: 'Pipelines / Execution / ApprovalTab',
  component: ApprovalTab,
  argTypes: {
    type: {
      control: {
        type: 'radio',
        options: ['HarnessApproval', 'JiraApproval']
      }
    }
  }
} as Meta

export interface ApprovalTabStoryProps {
  type: 'HarnessApproval' | 'JiraApproval'
  isWaiting: boolean
  isUserAuthorized: boolean
  harnessData: ApprovalTabProps['mock']
  jiraData: ApprovalTabProps['mock']
}

export const Basic: Story<ApprovalTabStoryProps> = args => {
  const { type, harnessData, jiraData, isWaiting, isUserAuthorized } = args
  return (
    <TestWrapper>
      <ApprovalTab
        step={{ status: isWaiting ? 'ApprovalWaiting' : 'Success', stepType: type }}
        mock={type === 'HarnessApproval' ? harnessData : jiraData}
        getApprovalAuthorizationMock={{
          loading: false,
          data: { data: { authorized: isUserAuthorized } }
        }}
      />
    </TestWrapper>
  )
}

Basic.args = {
  type: 'JiraApproval',
  isWaiting: true,
  isUserAuthorized: true,
  harnessData: {
    loading: false,
    data: { data: harnessApprovalData } as any
  },
  jiraData: {
    loading: false,
    data: { data: jiraApprovalData } as any
  }
}
