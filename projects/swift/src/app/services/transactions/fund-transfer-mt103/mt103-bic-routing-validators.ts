export type Mt103RoutingCodeValueValidatorDecision = {
  requiresValue: boolean;
};

export function getRoutingCodeValueValidatorDecision(
  routingCode: string | null | undefined
): Mt103RoutingCodeValueValidatorDecision {
  return {
    requiresValue: Boolean(routingCode),
  };
}
