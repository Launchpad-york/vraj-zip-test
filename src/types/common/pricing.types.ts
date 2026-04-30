/** Single plan level from GET /pricing/plans (e.g. employee range tier) */
export type PricingPlanLevel = {
	id: string;
	planTypeId: string;
	customerType: string;
	employeeRangeMin: number | null;
	employeeRangeMax: number | null;
	price: number;
	isCustomPricing: boolean;
};

/** Plan type group from GET /pricing/plans (e.g. BSP Blueprint with nested plans) */
export type PricingPlanType = {
	id: string;
	name: string;
	plans: PricingPlanLevel[];
};
