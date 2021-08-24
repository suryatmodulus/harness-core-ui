export const isFFPipelinesEnabled = (): boolean => {
  const ffPipelines: string | null = localStorage.getItem('FF_PIPELINES')

  return !!ffPipelines && ffPipelines !== 'false'
}
