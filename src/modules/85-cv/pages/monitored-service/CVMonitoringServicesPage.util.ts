interface filterEnvInterface {
  searchTerm?: string
  environmentIdentifier?: string
}
export const getFilterAndEnvironmentValue = (environment: string, searchTerm: string): filterEnvInterface => {
  const filter: filterEnvInterface = {}
  if (environment && environment !== 'All') {
    filter['environmentIdentifier'] = environment
  }
  if (searchTerm) filter['searchTerm'] = searchTerm
  return filter
}
