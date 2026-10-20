# ScopeGuard Pro — Architecture & Technical Specifications

## 1\. System Overview

ScopeGuard Pro is a client-side commercial utility and legal document generator built to prevent unbilled scope creep for freelancers, agencies, and consultants. It pairs real-time financial impact algorithms with contract document rendering and psychology-based client negotiation scripts.

## 2\. Calculation Engine

- **Base Fee**: `Estimated Hours × Hourly Rate`  
- **Contingency Buffer**: Accounts for QA, code review, and edge cases (`Base Fee × Buffer %`).  
- **Rush Multiplier**: Adjusts rate for urgent delivery (1.0x, 1.25x, 1.5x).  
- **Total Compensation Formula**: \$\$\\text{Total} \= (\\text{Base} \+ \\text{Buffer}) \\times \\text{RushMultiplier}\$\$  
- **Delivery Impact**: Quantifies milestone delay days to protect sprint deadlines.

## 3\. Print Engine & Responsive Typography

- Utilizes CSS `@media print` rules to instantly transform the on-screen dashboard view into a formatted A4/US-Letter contractual document without requiring external PDF rendering services.  
- Zero server dependencies; 100% private and compliant with NDA client obligations.