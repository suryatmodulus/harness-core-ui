import type { UseGetReturnData } from '@common/utils/testUtils'
import type { ResponseGcpResponseDTO } from 'services/cd-ng'

export const ClusterNamesResponse: UseGetReturnData<ResponseGcpResponseDTO> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      clusterNames: ['us-west2/abc', 'us-west1-b/qwe']
    },
    correlationId: '33715e30-e0cd-408c-ad82-a412161733c2'
  }
}
