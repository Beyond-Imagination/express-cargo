/** A benchmark case: the request to send and the response every library must answer with. */
export type Scenario<ScenarioRequest, ScenarioResponse> = ScenarioRequest & {
    name: string
    route: string
    status: number
    response: ScenarioResponse
}
