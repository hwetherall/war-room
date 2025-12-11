// Chapter-specific debate guidelines for the Bull/Bear agents
// These briefs teach the agents the "rules of each chapter"

export const CHAPTER_BRIEFS: Record<string, string> = {
  "Opportunity Validation": `
### CHAPTER GOAL:
Confirm a real, validated, and urgent customer need exists. Evidence of "problem-solution fit" and "market timing".

### KEY DEBATE POINTS (Focus on these):
1. **Customer Problem:** Is the pain point specific and acute? Or vague?
2. **Evidence of Demand:** Are there LOIs, pilot agreements, or signed contracts? Or just "interest"?
3. **Target Customer:** Is the segment defined (e.g., "Tier 1 Japanese HQ") or generic ("Offices")?
4. **Market Timing:** Why NOW? (e.g., Regulations, post-COVID shifts).
5. **Traction:** Is there *quantified* demand (surveys, data) or just anecdotes?

### CRITICAL QUESTIONS TO ANSWER:
- What evidence demonstrates this is a top-priority problem?
- How many customers have expressed intent to pay/pilot?
- What is the cost of NOT solving this problem for the customer?
  `,

  "Finance and Operations": `
### CHAPTER GOAL:
Validate the business model sustainability and operational efficiency.

### KEY DEBATE POINTS:
1. **Unit Economics:** Is CAC < LTV? What's the payback period?
2. **Burn Rate:** How long is the runway? Is spend justified?
3. **Margins:** Are gross margins healthy for the industry?
4. **Revenue Model:** Is pricing validated? Recurring vs one-time?
5. **Operational Efficiency:** Are processes scalable?

### CRITICAL QUESTIONS:
- What does the path to profitability look like?
- Are there hidden costs that will surface at scale?
- How capital-efficient is growth?
  `,

  "Product and Technology": `
### CHAPTER GOAL:
Assess technical feasibility, differentiation, and defensibility.

### KEY DEBATE POINTS:
1. **Technical Feasibility:** Can this actually be built as promised?
2. **IP Moat:** Is there defensible technology or trade secrets?
3. **Build vs Buy:** Why build this vs using existing solutions?
4. **Obsolescence Risk:** Could this be disrupted by AI/new tech?
5. **Technical Debt:** Is the architecture scalable?

### CRITICAL QUESTIONS:
- What is the technical risk in the next 12 months?
- How long would it take a well-funded competitor to replicate?
- Is the tech team capable of executing the roadmap?
  `,

  "Team and Execution": `
### CHAPTER GOAL:
Evaluate founder-market fit and team's ability to execute.

### KEY DEBATE POINTS:
1. **Founder Fit:** Do founders have unfair advantages in this market?
2. **Talent Gaps:** Are there critical missing roles?
3. **Hiring Speed:** Can they attract top talent?
4. **Execution Track Record:** Have they shipped before?
5. **Organizational Structure:** Is the team structured for scale?

### CRITICAL QUESTIONS:
- Why are THESE founders the right people for THIS problem?
- What happens if a key founder leaves?
- Is the culture sustainable through hypergrowth?
  `
};

