---
name: fundraising
description: |
  Implements fundraising strategy, pitch deck structure, investor communications, and cap table management.
  Use when: preparing for fundraising rounds, creating pitch decks, writing investor updates, modeling dilution, or structuring term sheets.
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
---

# Fundraising Skill

This skill covers startup fundraising strategy, investor materials, and capital management. Based on Pasquale Tuosto's approach: raise what you need, demonstrate capital efficiency, and maintain financial transparency with stakeholders.

## Quick Start

### Pitch Deck Structure (10-12 slides)

```markdown
1. TITLE          — Company name, one-line description, round details
2. PROBLEM        — What pain exists? How big is it? Who has it?
3. SOLUTION       — Your product. Demo screenshot or short explanation.
4. TRACTION       — Revenue, growth rate, key metrics, notable customers
5. MARKET         — TAM/SAM/SOM with bottom-up calculation
6. BUSINESS MODEL — How you make money. Unit economics.
7. COMPETITION    — Positioning matrix. Why you win.
8. TEAM           — Founders + key hires. Relevant experience.
9. FINANCIALS     — Revenue projection (3 years). Key assumptions.
10. THE ASK       — Amount raising, use of funds, milestones to hit.
```

### Investor Update Template

```markdown
Subject: [Company] — [Month Year] Update

Hi [Name],

## Highlights
- Crossed $X MRR (+X% MoM)
- Signed [Notable Customer]
- Launched [Feature]

## Metrics
| Metric          | Current | Last Month | Target |
|-----------------|---------|------------|--------|
| MRR             | $50K    | $45K       | $55K   |
| New Customers   | 28      | 22         | 30     |
| Churn           | 2.1%    | 2.5%       | <3%    |
| Runway          | 16 mo   | 18 mo      | >12 mo |

## Challenges
- [Honest assessment of what's not working]

## Help Needed
- Intro to [specific person/company]
- Advice on [specific question]

Best,
[Founder]
```

## Key Concepts

| Stage | Round Size | Typical Dilution | What Investors Want |
|-------|-----------|-----------------|-------------------|
| Pre-Seed | $100K-$500K | 10-15% | Team, vision, early signals |
| Seed | $500K-$3M | 15-25% | PMF signals, retention, early revenue |
| Series A | $5M-$15M | 20-30% | Proven unit economics, repeatable GTM |
| Series B | $15M-$50M | 15-25% | Scaling, market expansion, efficiency |

## Common Patterns

### Cap Table Model

**When:** Tracking ownership through funding rounds

```typescript
interface Shareholder {
  name: string;
  shares: number;
  type: 'common' | 'preferred' | 'option';
  pricePerShare: number;
  roundEntered: string;
}

interface FundingRound {
  name: string;
  preMoneyValuation: number;
  amountRaised: number;
  postMoneyValuation: number;
  pricePerShare: number;
  newShares: number;
  investors: { name: string; amount: number }[];
}

function calculateDilution(
  existingShares: number,
  newShares: number
): number {
  return newShares / (existingShares + newShares);
}

function modelRound(
  currentShares: number,
  preMoneyValuation: number,
  amountRaised: number
): FundingRound {
  const postMoney = preMoneyValuation + amountRaised;
  const pricePerShare = preMoneyValuation / currentShares;
  const newShares = amountRaised / pricePerShare;

  return {
    name: '',
    preMoneyValuation,
    amountRaised,
    postMoneyValuation: postMoney,
    pricePerShare,
    newShares: Math.round(newShares),
    investors: [],
  };
}

// Example: Seed round
// 10M shares outstanding, $8M pre-money, raising $2M
// Price per share: $0.80, New shares: 2.5M, Dilution: 20%
```

### Use of Funds Breakdown

**When:** Showing investors how capital will be deployed

```typescript
interface UseOfFunds {
  category: string;
  amount: number;
  percentage: number;
  purpose: string;
  milestones: string[];
}

const seedUseOfFunds: UseOfFunds[] = [
  {
    category: 'Engineering',
    amount: 800000,
    percentage: 40,
    purpose: 'Product development and infrastructure',
    milestones: ['Launch v2.0', 'API platform', 'Mobile app'],
  },
  {
    category: 'Sales & Marketing',
    amount: 500000,
    percentage: 25,
    purpose: 'Customer acquisition and brand',
    milestones: ['10 enterprise customers', 'Content engine', 'SDR team'],
  },
  {
    category: 'Operations',
    amount: 400000,
    percentage: 20,
    purpose: 'Team growth and infrastructure',
    milestones: ['5 key hires', 'Office setup', 'Legal/compliance'],
  },
  {
    category: 'Reserve',
    amount: 300000,
    percentage: 15,
    purpose: 'Buffer for opportunities and contingencies',
    milestones: ['6 months additional runway'],
  },
];
```

### Market Sizing (Bottom-Up)

**When:** Estimating market opportunity for investors

```typescript
interface MarketSizing {
  tam: { value: number; description: string };
  sam: { value: number; description: string };
  som: { value: number; description: string; timeframe: string };
}

// Bottom-up approach (more credible than top-down)
function calculateMarketSize(): MarketSizing {
  // Example: B2B SaaS for design teams
  const totalCompanies = 500000;         // Companies with design teams
  const percentDigitized = 0.60;          // Already use digital tools
  const averageContractValue = 5000;      // Annual contract value

  const tam = totalCompanies * averageContractValue;

  const targetSegment = 0.30;             // Mid-market companies
  const sam = tam * targetSegment;

  const reachableInYear1 = 0.02;          // 2% market penetration
  const som = sam * reachableInYear1;

  return {
    tam: { value: tam, description: `${totalCompanies.toLocaleString()} companies × $${averageContractValue} ACV` },
    sam: { value: sam, description: `${(totalCompanies * targetSegment).toLocaleString()} mid-market companies` },
    som: { value: som, description: `${(totalCompanies * targetSegment * reachableInYear1).toLocaleString()} customers at 2% penetration`, timeframe: '12 months' },
  };
}
```

### Due Diligence Data Room Structure

**When:** Preparing for investor due diligence

```markdown
📁 Data Room/
├── 📁 Corporate/
│   ├── Certificate of Incorporation
│   ├── Bylaws and amendments
│   ├── Board minutes and resolutions
│   └── Cap table (current)
├── 📁 Financials/
│   ├── P&L (last 12 months + projections)
│   ├── Balance sheet
│   ├── Cash flow statement
│   ├── Monthly MRR breakdown
│   └── Unit economics summary
├── 📁 Legal/
│   ├── Existing investor agreements
│   ├── Key customer contracts
│   ├── IP assignments
│   └── Employment agreements
├── 📁 Product/
│   ├── Product roadmap
│   ├── Technical architecture
│   └── Key metrics dashboard
└── 📁 Team/
    ├── Org chart
    ├── Key bios
    └── Hiring plan
```

## Pitfalls

- Don't use top-down market sizing alone ("the market is $50B, we just need 1%") — always include bottom-up
- Send investor updates monthly, even when news is bad — silence destroys trust
- Don't optimize for valuation at the expense of finding the right partner
- Term sheets: focus on liquidation preference, anti-dilution, and board composition, not just valuation
- Keep your cap table clean from Day 1 — messy cap tables kill deals

## Related Skills

For financial modeling, see the **financial-planning** skill. For building investor portals, see the **react** or **nextjs** skill.
