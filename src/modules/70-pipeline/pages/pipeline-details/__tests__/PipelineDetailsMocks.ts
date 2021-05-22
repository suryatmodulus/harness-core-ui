import type { UseGetReturnData } from '@common/utils/testUtils'
import type { ResponsePMSPipelineSummaryResponse } from 'services/pipeline-ng'

export const PipelineResponse: UseGetReturnData<ResponsePMSPipelineSummaryResponse> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      name: 'testsdfsdf',
      identifier: 'testqqq',
      description: '',
      numOfStages: 3
      // numOfErrors: 2,
      // deployments: [0, 4, 0, 3, 4, 2, 1, 5, 2, 4]
    },
    correlationId: '537bada2-d369-443f-9827-7ca8008b576d'
  }
}
