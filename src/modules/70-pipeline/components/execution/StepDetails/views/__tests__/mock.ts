import type { UseGetMockDataWithMutateAndRefetch } from '@common/utils/testUtils'
import type {
  ResponseHarnessApprovalInstanceAuthorization,
  ResponseApprovalInstanceResponse
} from 'services/pipeline-ng'

export const mockAuthData: UseGetMockDataWithMutateAndRefetch<ResponseHarnessApprovalInstanceAuthorization> = {
  refetch: jest.fn(),
  mutate: jest.fn(),
  loading: false,
  data: {
    correlationId: '',
    status: 'SUCCESS',
    metaData: null as unknown as undefined,
    data: {
      authorized: true
    }
  }
}

export const mockAuthDataLoading: UseGetMockDataWithMutateAndRefetch<ResponseHarnessApprovalInstanceAuthorization> = {
  refetch: jest.fn(),
  mutate: jest.fn(),
  loading: true,
  data: {
    correlationId: '',
    status: 'SUCCESS',
    metaData: null as unknown as undefined,
    data: {
      authorized: true
    }
  }
}

export const mockApprovalData: UseGetMockDataWithMutateAndRefetch<ResponseApprovalInstanceResponse> = {
  refetch: jest.fn(),
  mutate: jest.fn(),
  loading: false,
  data: {
    correlationId: '',
    status: 'SUCCESS',
    metaData: null as unknown as undefined,
    data: {
      type: 'HarnessApproval',
      id: 'approvalInstanceId',
      status: 'WAITING',
      details: {
        someDetail: 'someDetail'
      }
    }
  }
}

export const mockJiraApprovalData: UseGetMockDataWithMutateAndRefetch<ResponseApprovalInstanceResponse> = {
  refetch: jest.fn(),
  mutate: jest.fn(),
  loading: false,
  data: {
    correlationId: '',
    status: 'SUCCESS',
    metaData: null as unknown as undefined,
    data: {
      type: 'JiraApproval',
      id: 'approvalInstanceId',
      status: 'WAITING',
      details: {
        someDetail: 'someDetail',
        issue: {
          key: 'jiraIssueKey'
        }
      }
    }
  }
}

export const mockApprovalDataLoading: UseGetMockDataWithMutateAndRefetch<ResponseApprovalInstanceResponse> = {
  refetch: jest.fn(),
  mutate: jest.fn(),
  loading: true,
  data: {
    correlationId: '',
    status: 'SUCCESS',
    metaData: null as unknown as undefined,
    data: {
      type: 'HarnessApproval',
      id: 'approvalInstanceId',
      status: 'WAITING',
      details: {
        someDetail: 'someDetail'
      }
    }
  }
}

export const mockJiraApprovalDataLoading: UseGetMockDataWithMutateAndRefetch<ResponseApprovalInstanceResponse> = {
  refetch: jest.fn(),
  mutate: jest.fn(),
  loading: true,
  data: {
    correlationId: '',
    status: 'SUCCESS',
    metaData: null as unknown as undefined,
    data: {
      type: 'JiraApproval',
      id: 'approvalInstanceId',
      status: 'WAITING',
      details: {
        someDetail: 'someDetail'
      }
    }
  }
}

export const mockApprovalDataError: UseGetMockDataWithMutateAndRefetch<ResponseApprovalInstanceResponse> = {
  refetch: jest.fn(),
  mutate: jest.fn(),
  loading: false,
  // eslint-disable-next-line
  // @ts-ignore
  error: 'someerror',
  data: {
    correlationId: '',
    status: 'ERROR',
    metaData: null as unknown as undefined,
    data: {
      type: 'HarnessApproval',
      id: 'approvalInstanceId',
      status: 'FAILED',
      details: {}
    }
  }
}

export const mockJiraApprovalDataError: UseGetMockDataWithMutateAndRefetch<ResponseApprovalInstanceResponse> = {
  refetch: jest.fn(),
  mutate: jest.fn(),
  loading: false,
  // eslint-disable-next-line
  // @ts-ignore
  error: 'someerror',
  data: {
    correlationId: '',
    status: 'ERROR',
    metaData: null as unknown as undefined,
    data: {
      type: 'JiraApproval',
      id: 'approvalInstanceId',
      status: 'FAILED',
      details: {}
    }
  }
}
