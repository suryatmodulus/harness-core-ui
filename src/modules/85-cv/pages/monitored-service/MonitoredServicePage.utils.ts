export const isProjectChangedOnMonitoredService = (error: any, identifier: string): boolean => {
  return (
    error?.data?.message === `Invalid request: Monitored Source Entity with identifier ${identifier} is not present`
  )
}
