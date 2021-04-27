/**
 * Test utility to mock any import. It's better than jest.mock() because you can use
 * mockImport() inside tests.
 *
 * Sample:
 *
 *  mockImport('services/cf', {
 *    useGetFeatureFlag: () => ({
 *      data: mockFeatureFlag,
 *      loading: undefined,
 *      error: undefined,
 *      refetch: jest.fn()
 *     })
 *  })
 *
 * Mock an `export default`:
 *
 *  mockImport('@cf/components/FlagActivation/FlagActivation', {
 *     // FlagActivation is exported as `export default`
 *     default: function FlagActivation() {
 *       return <div>FlagActivation</div>
 *    }
 *  })
 *
 * @param moduleName
 * @param implementation
 */
export default function mockImport(moduleName: string, implementation: Record<string, any>): void {
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires, global-require
  const module = require(moduleName)

  Object.keys(implementation).forEach(key => {
    module[key] = implementation?.[key]
  })
}
