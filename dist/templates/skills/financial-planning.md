---
name: financial-planning
description: |
  Implements financial models, projections, unit economics, and KPI dashboards.
  Use when: building financial projections, modeling revenue/costs, tracking SaaS metrics, implementing pricing strategies, or creating investor reports.
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
---

# Financial Planning Skill

This skill covers financial modeling, unit economics, and KPI tracking for startups and digital businesses. Based on Pasquale Tuosto's approach to sustainable growth through rigorous financial planning and scenario analysis.

## Quick Start

### SaaS Metrics Dashboard Data Model

```typescript
interface SaaSMetrics {
  period: string; // YYYY-MM
  // Revenue
  mrr: number;
  arr: number;
  newMrr: number;
  expansionMrr: number;
  churnedMrr: number;
  netNewMrr: number;
  // Customers
  totalCustomers: number;
  newCustomers: number;
  churnedCustomers: number;
  // Unit Economics
  arpu: number; // Average Revenue Per User
  cac: number;  // Customer Acquisition Cost
  ltv: number;  // Lifetime Value
  ltvCacRatio: number;
  paybackMonths: number;
  // Efficiency
  grossMargin: number;
  burnRate: number;
  runway: number; // months
  burnMultiple: number;
}

function calculateMetrics(data: MonthlyData): SaaSMetrics {
  const arpu = data.mrr / data.totalCustomers;
  const monthlyChurnRate = data.churnedCustomers / data.previousTotalCustomers;
  const grossMargin = (data.revenue - data.cogs) / data.revenue;
  const ltv = arpu * grossMargin * (1 / monthlyChurnRate);
  const cac = data.salesMarketingSpend / data.newCustomers;

  return {
    period: data.period,
    mrr: data.mrr,
    arr: data.mrr * 12,
    newMrr: data.newMrr,
    expansionMrr: data.expansionMrr,
    churnedMrr: data.churnedMrr,
    netNewMrr: data.newMrr + data.expansionMrr - data.churnedMrr,
    totalCustomers: data.totalCustomers,
    newCustomers: data.newCustomers,
    churnedCustomers: data.churnedCustomers,
    arpu,
    cac,
    ltv,
    ltvCacRatio: ltv / cac,
    paybackMonths: cac / (arpu * grossMargin),
    grossMargin,
    burnRate: data.totalExpenses - data.revenue,
    runway: data.cashBalance / (data.totalExpenses - data.revenue),
    burnMultiple: (data.totalExpenses - data.revenue) / (data.netNewMrr * 12),
  };
}
```

## Key Concepts

| Metric | Formula | Healthy Target |
|--------|---------|---------------|
| MRR | Customers x ARPU | Growing MoM |
| ARR | MRR x 12 | Growing YoY |
| CAC | Sales+Marketing / New Customers | Declining over time |
| LTV | ARPU x Gross Margin x (1/Churn) | >3x CAC |
| Payback | CAC / (ARPU x Margin) | <12 months |
| Gross Margin | (Revenue - COGS) / Revenue | >70% (SaaS) |
| Burn Multiple | Net Burn / Net New ARR | <1x excellent |
| Rule of 40 | Growth % + Margin % | >40% |
| Runway | Cash / Monthly Burn | >12 months |

## Common Patterns

### Revenue Projection Model

**When:** Forecasting revenue for investor materials or planning

```typescript
interface RevenueProjection {
  month: string;
  existingCustomers: number;
  newCustomers: number;
  churnedCustomers: number;
  totalCustomers: number;
  arpu: number;
  mrr: number;
  cumulativeRevenue: number;
}

function projectRevenue(
  startCustomers: number,
  monthlyNewCustomers: number,
  monthlyChurnRate: number,
  arpu: number,
  months: number,
  growthRate: number = 0 // monthly growth in new customers
): RevenueProjection[] {
  const projections: RevenueProjection[] = [];
  let customers = startCustomers;
  let cumulative = 0;

  for (let i = 0; i < months; i++) {
    const newCusts = Math.round(monthlyNewCustomers * Math.pow(1 + growthRate, i));
    const churned = Math.round(customers * monthlyChurnRate);
    customers = customers + newCusts - churned;
    const mrr = customers * arpu;
    cumulative += mrr;

    projections.push({
      month: `Month ${i + 1}`,
      existingCustomers: customers - newCusts,
      newCustomers: newCusts,
      churnedCustomers: churned,
      totalCustomers: customers,
      arpu,
      mrr,
      cumulativeRevenue: cumulative,
    });
  }

  return projections;
}
```

### Scenario Analysis

**When:** Planning for different outcomes (conservative, base, optimistic)

```typescript
interface Scenario {
  name: string;
  assumptions: {
    monthlyNewCustomers: number;
    churnRate: number;
    arpu: number;
    growthRate: number;
    monthlyBurn: number;
  };
}

const scenarios: Scenario[] = [
  {
    name: 'Conservative',
    assumptions: {
      monthlyNewCustomers: 20,
      churnRate: 0.05,
      arpu: 49,
      growthRate: 0.05,
      monthlyBurn: 50000,
    },
  },
  {
    name: 'Base',
    assumptions: {
      monthlyNewCustomers: 40,
      churnRate: 0.03,
      arpu: 49,
      growthRate: 0.10,
      monthlyBurn: 60000,
    },
  },
  {
    name: 'Optimistic',
    assumptions: {
      monthlyNewCustomers: 60,
      churnRate: 0.02,
      arpu: 59,
      growthRate: 0.15,
      monthlyBurn: 70000,
    },
  },
];
```

### Pricing Tier Structure

**When:** Designing or evaluating pricing models

```typescript
interface PricingTier {
  name: string;
  monthlyPrice: number;
  annualPrice: number; // usually 2 months free
  features: string[];
  targetSegment: string;
  expectedMix: number; // % of customers
}

const pricingTiers: PricingTier[] = [
  {
    name: 'Starter',
    monthlyPrice: 29,
    annualPrice: 290, // ~17% discount
    features: ['Core features', '1 user', '1GB storage'],
    targetSegment: 'Individuals and freelancers',
    expectedMix: 0.40,
  },
  {
    name: 'Pro',
    monthlyPrice: 79,
    annualPrice: 790,
    features: ['All Starter', '5 users', '10GB storage', 'Priority support'],
    targetSegment: 'Small teams',
    expectedMix: 0.45,
  },
  {
    name: 'Enterprise',
    monthlyPrice: 199,
    annualPrice: 1990,
    features: ['All Pro', 'Unlimited users', 'SSO', 'SLA', 'Dedicated support'],
    targetSegment: 'Larger organizations',
    expectedMix: 0.15,
  },
];

// Blended ARPU = sum(tier.monthlyPrice * tier.expectedMix)
const blendedArpu = pricingTiers.reduce(
  (sum, tier) => sum + tier.monthlyPrice * tier.expectedMix, 0
); // $62.70
```

## Pitfalls

- Don't track vanity metrics (total signups) without activation and retention
- Revenue recognized is not cash received — track accounts receivable
- CAC should include ALL sales and marketing costs, not just ad spend
- Annual contracts improve cash flow but hide churn — track both logo and revenue churn
- Runway calculations should use the trailing 3-month average burn, not a single month

## Related Skills

For building dashboards, see the **react** or **nextjs** skill. For database modeling, see the **prisma** skill. For API integration, see the **typescript** skill.
