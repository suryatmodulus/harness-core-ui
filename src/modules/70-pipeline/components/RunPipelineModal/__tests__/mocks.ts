import type { UseGetMockDataWithMutateAndRefetch } from '@common/utils/testUtils'
import type {
  ResponseInputSetResponse,
  ResponseInputSetTemplateResponse,
  ResponseMergeInputSetResponse,
  ResponsePageInputSetSummaryResponse,
  ResponsePlanExecutionResponseDto,
  ResponsePMSPipelineResponseDTO,
  ResponsePreFlightDTO,
  ResponseVariableMergeServiceResponse
} from 'services/pipeline-ng'

export const mockCreateInputSetResponse: UseGetMockDataWithMutateAndRefetch<ResponseInputSetResponse> = {
  loading: false,
  mutate: jest.fn().mockImplementation(() => ({
    data: {}
  })),
  refetch: jest.fn(),
  data: {
    correlationId: '',
    status: 'SUCCESS',
    metaData: null as unknown as undefined,
    data: {}
  }
}

export const mockPipelineTemplateYaml: UseGetMockDataWithMutateAndRefetch<ResponseInputSetTemplateResponse> = {
  loading: false,
  refetch: jest.fn(),
  mutate: jest.fn(),
  data: {
    correlationId: '',
    status: 'SUCCESS',
    metaData: null as unknown as undefined,
    data: {
      inputSetTemplateYaml:
        'pipeline:\n  identifier: "First"\n  variables:\n  - name: "checkVariable1"\n    type: "String"\n    value: "<+input>"\n'
    }
  }
}

export const mockPipelineTemplateYamlForRerun: UseGetMockDataWithMutateAndRefetch<ResponseInputSetTemplateResponse> = {
  loading: false,
  refetch: jest.fn(),
  mutate: jest.fn(),
  data: {
    correlationId: '',
    status: 'SUCCESS',
    metaData: null as unknown as undefined,
    data: {
      inputSetTemplateYaml:
        'pipeline:\n  identifier: "First"\n  variables:\n  - name: "checkVariable1"\n    type: "String"\n    value: "<+input>"\n',
      inputSetYaml:
        'pipeline:\n  identifier: "First"\n  variables:\n  - name: "checkVariable1"\n    type: "String"\n    value: "variablevalue"\n'
    }
  }
}

export const mockPreflightCheckResponse: UseGetMockDataWithMutateAndRefetch<ResponsePreFlightDTO> = {
  loading: false,
  refetch: jest.fn(),
  mutate: jest.fn(),
  data: {
    correlationId: '',
    status: 'SUCCESS',
    metaData: null as unknown as undefined,
    data: {
      status: 'SUCCESS'
    }
  }
}

export const mockGetPipeline: UseGetMockDataWithMutateAndRefetch<ResponsePMSPipelineResponseDTO> = {
  loading: false,
  refetch: jest.fn(),
  mutate: jest.fn(),
  data: {
    correlationId: '',
    status: 'SUCCESS',
    metaData: null as unknown as undefined,
    data: {
      yamlPipeline:
        'pipeline:\n    name: TestPipeline\n    identifier: First\n    tags: {}\n    stages:\n        - stage:\n              name: Stage1\n              identifier: Stage1\n              description: ""\n              type: Approval\n              spec:\n                  execution:\n                      steps:\n                          - step:\n                                name: Approval\n                                identifier: approval\n                                type: HarnessApproval\n                                timeout: 1d\n                                spec:\n                                    includePipelineExecutionHistory: true\n                                    approvers:\n                                        disallowPipelineExecutor: false\n                                        minimumCount: 2\n                                        userGroups:\n                                            - Chirag\n                                    approverInputs: []\n                                    approvalMessage: ABC\n              tags: {}\n              variables: []\n    projectIdentifier: Chirag\n    orgIdentifier: harness\n    variables:\n        - name: checkVariable1\n          type: String\n          value: <+input>\n'
    }
  }
}

export const mockPostPipelineExecuteYaml: UseGetMockDataWithMutateAndRefetch<ResponsePlanExecutionResponseDto> = {
  loading: false,
  refetch: jest.fn(),
  mutate: jest.fn(),
  data: {
    correlationId: '',
    status: 'SUCCESS',
    metaData: null as unknown as undefined,
    data: {}
  }
}

export const mockRePostPipelineExecuteYaml: UseGetMockDataWithMutateAndRefetch<ResponsePlanExecutionResponseDto> = {
  loading: false,
  refetch: jest.fn(),
  mutate: jest.fn(),
  data: {
    correlationId: '',
    status: 'SUCCESS',
    metaData: null as unknown as undefined,
    data: {}
  }
}

export const mockInputSetsList: UseGetMockDataWithMutateAndRefetch<ResponsePageInputSetSummaryResponse> = {
  loading: false,
  refetch: jest.fn(),
  mutate: jest.fn(),
  data: {
    correlationId: '',
    status: 'SUCCESS',
    metaData: null as unknown as undefined,
    data: {
      content: [
        {
          identifier: 'inputset1',
          inputSetType: 'INPUT_SET',
          name: 'is1',
          pipelineIdentifier: 'PipelineId'
        },
        {
          identifier: 'inputset2',
          inputSetType: 'INPUT_SET',
          name: 'is2',
          pipelineIdentifier: 'PipelineId'
        }
      ]
    }
  }
}

export const mockMergeInputSetResponse: UseGetMockDataWithMutateAndRefetch<ResponseMergeInputSetResponse> = {
  loading: false,
  refetch: jest.fn(),
  mutate: jest.fn().mockResolvedValue({
    data: {
      pipelineYaml:
        'pipeline:\n  identifier: "First"\n  variables:\n  - name: "checkVariable1"\n    type: "String"\n    value: "valuefrominputsetsmerge"\n'
    }
  }),
  data: {
    correlationId: '',
    status: 'SUCCESS',
    metaData: null as unknown as undefined,
    data: {
      pipelineYaml:
        'pipeline:\n  identifier: "First"\n  variables:\n  - name: "checkVariable1"\n    type: "String"\n    value: "valuefrominputsetsmerge"\n'
    }
  }
}

export const mockPipelineVariablesResponse: UseGetMockDataWithMutateAndRefetch<ResponseVariableMergeServiceResponse> = {
  loading: false,
  refetch: jest.fn(),
  mutate: jest.fn(),
  data: {
    correlationId: '',
    status: 'SUCCESS',
    metaData: null as unknown as undefined,
    data: {
      yaml: '---\npipeline:\n  name: "lv_wnLIBTiCm2yUf4GLcwA"\n  identifier: "First"\n  tags:\n    __uuid: "395mxDwgTbKOESVVUIv-tg"\n  stages:\n  - stage:\n      name: "K0nVJmi8SY2Yc7wMp3PA8Q"\n      identifier: "A2"\n      description: "SIByfUO-R6aEXOWEIFj_DA"\n      type: "Approval"\n      spec:\n        execution:\n          steps:\n          - step:\n              name: "B0VctCiyTJmU7YV9LlTVNA"\n              identifier: "approval"\n              type: "HarnessApproval"\n              timeout: "YE-9jT5aSBCCBjolSWkk2Q"\n              spec:\n                includePipelineExecutionHistory: "l_DycUWaQEyBh5Ss1vmSWw"\n                approvers:\n                  disallowPipelineExecutor: "9c7XQX10RlCY0_QBBLL0NQ"\n                  userGroups: "7_qK9swoS3OKg-y5ua_J0g"\n                  minimumCount: "yzbqDOdJSIS-z43HAJQhQw"\n                  __uuid: "YEmqs9LHRMayJ4FI_bGTVg"\n                approverInputs: []\n                approvalMessage: "4uw_D8DbTFWRUvr7BIGtrg"\n                __uuid: "TbtQH7poRmmmCwu2KLs7LQ"\n              __uuid: "MBd-NDByQDaHvQh-3k5wPg"\n            __uuid: "hMvRKk0JQOuaE-jgEphDhA"\n          __uuid: "kWNef9ZjRgSG1_UYkpj1_A"\n        __uuid: "GXR2PZ5zQyCpBuxfiGCGEA"\n      tags:\n        __uuid: "c-GQac7hRE6Siq4-zNR6BQ"\n      variables: []\n      __uuid: "FL2qIeUwRaqA6sWjcjbjVQ"\n    __uuid: "GXr_ru54SDeVrxHIBmN6kA"\n  projectIdentifier: "3xyt3nVISF6lsAPQyWwhzg"\n  orgIdentifier: "VPC7k446TjGJfLVTKu1FPg"\n  variables:\n  - name: "V1"\n    type: "String"\n    default: "r87yt77_SpWLgGl3Run1qg"\n    value: "Sl6CpFBbRYGpULzBrqYDrw"\n    __uuid: "_FP3gjfrSh-P6178lNoZCw"\n  __uuid: "SKYRDrBDSF-MNRQ07hDc_g"\n__uuid: "dTFK9sMlSD-2LLWTM89W0g"\n'
    }
  }
}
