/**
 * ScopeGuard Pro - Client Scope Creep & Change Order Controller
 */
(function() {
  'use strict';

  const defaultPresets = {
    'web-dev': {
      title: 'Custom API & Payment Gateway Integration',
      clientName: 'Acme Ventures LLC',
      contractRef: 'MSA-2026-084',
      hourlyRate: 95,
      estimatedHours: 24,
      rushMultiplier: 1.25,
      bufferPercentage: 15,
      currency: 'USD',
      currencySymbol: '$',
      scopeDescription: 'Addition of Stripe Connect multi-vendor marketplace split payments, automated refund webhooks, and sandbox testing suite not included in original Statement of Work dated Aug 15, 2026.',
      deliverables: '1. Stripe Connect custom onboarding flow\n2. Automated payment split & escrow logic\n3. Webhook listener for payout failure alerts\n4. End-to-end sandbox test verification report',
      scheduleImpactDays: 6,
      paymentTerms: '50% upfront deposit upon execution of this Change Order, 50% upon deployment to staging.'
    },
    'ui-design': {
      title: 'Brand Design System & Dark Mode Extension',
      clientName: 'Apex Media UK',
      contractRef: 'DES-UK-902',
      hourlyRate: 75,
      estimatedHours: 18,
      rushMultiplier: 1.0,
      bufferPercentage: 10,
      currency: 'GBP',
      currencySymbol: '£',
      scopeDescription: 'Design of high-contrast Dark Mode tokens, 14 responsive component variants, and an interactive Figma prototype beyond the agreed 3 core wireframe revisions.',
      deliverables: '1. Complete Dark Mode color token palette\n2. 14 custom component UI states\n3. Updated Figma interactive prototype',
      scheduleImpactDays: 4,
      paymentTerms: '100% due upon delivery and Figma design asset handoff.'
    },
    'uae-enterprise': {
      title: 'Bilingual Arabic Localization & CRM Sync',
      clientName: 'Gulf Horizon Properties (Dubai)',
      contractRef: 'GHP-DXB-2026',
      hourlyRate: 350,
      estimatedHours: 32,
      rushMultiplier: 1.5,
      bufferPercentage: 20,
      currency: 'AED',
      currencySymbol: 'AED ',
      scopeDescription: 'Implementation of right-to-left (RTL) Arabic typography rendering, Salesforce CRM lead bi-directional sync, and WhatsApp Business API instant notification triggers.',
      deliverables: '1. Full RTL layout stylesheet adaptation\n2. Salesforce REST API bi-directional webhook handler\n3. WhatsApp Business API triggers for VIP property leads',
      scheduleImpactDays: 8,
      paymentTerms: '50% advance upon contract signing, 50% upon final acceptance testing in Dubai.'
    }
  };

  let state = Object.assign({}, defaultPresets['web-dev']);

  function init() {
    setupStageTabs();
    populateForm();
    bindEvents();
    recalculate();
  }

  function setupStageTabs() {
    const tabs = document.querySelectorAll('.stage-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-view').forEach(v => v.style.display = 'none');
        tab.classList.add('active');
        const target = document.getElementById(tab.dataset.target);
        if (target) target.style.display = 'block';
      });
    });
  }

  function populateForm() {
    document.getElementById('f_title').value = state.title;
    document.getElementById('f_client').value = state.clientName;
    document.getElementById('f_ref').value = state.contractRef;
    document.getElementById('f_rate').value = state.hourlyRate;
    document.getElementById('f_hours').value = state.estimatedHours;
    document.getElementById('f_rush').value = state.rushMultiplier;
    document.getElementById('f_buffer').value = state.bufferPercentage;
    document.getElementById('f_currency').value = state.currency;
    document.getElementById('f_desc').value = state.scopeDescription;
    document.getElementById('f_deliverables').value = state.deliverables;
    document.getElementById('f_days').value = state.scheduleImpactDays;
    document.getElementById('f_terms').value = state.paymentTerms;
  }

  function bindEvents() {
    // Preset change
    document.getElementById('preset_selector').addEventListener('change', (e) => {
      const val = e.target.value;
      if (defaultPresets[val]) {
        state = Object.assign({}, defaultPresets[val]);
        populateForm();
        recalculate();
      }
    });

    const inputs = ['f_title', 'f_client', 'f_ref', 'f_rate', 'f_hours', 'f_rush', 'f_buffer', 'f_currency', 'f_desc', 'f_deliverables', 'f_days', 'f_terms'];
    inputs.forEach(id => {
      const el = document.getElementById(id);
      el.addEventListener('input', () => {
        readFormData();
        recalculate();
      });
    });

    // Action buttons
    document.getElementById('btn_print_pdf').addEventListener('click', () => {
      window.print();
    });

    document.getElementById('btn_copy_markdown').addEventListener('click', () => {
      const md = generateMarkdownAddendum();
      navigator.clipboard.writeText(md).then(() => alert('Change Order Markdown copied to clipboard!'));
    });

    document.getElementById('btn_save_order').addEventListener('click', () => {
      saveChangeOrderToStorage();
    });

    document.querySelectorAll('.btn-copy-script').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetId = e.target.dataset.scriptId;
        const text = document.getElementById(targetId).textContent;
        navigator.clipboard.writeText(text).then(() => alert('Negotiation script copied to clipboard!'));
      });
    });
  }

  function readFormData() {
    state.title = document.getElementById('f_title').value;
    state.clientName = document.getElementById('f_client').value;
    state.contractRef = document.getElementById('f_ref').value;
    state.hourlyRate = Number(document.getElementById('f_rate').value) || 0;
    state.estimatedHours = Number(document.getElementById('f_hours').value) || 0;
    state.rushMultiplier = Number(document.getElementById('f_rush').value) || 1.0;
    state.bufferPercentage = Number(document.getElementById('f_buffer').value) || 0;
    state.currency = document.getElementById('f_currency').value;
    const symMap = { USD: '$', GBP: '£', AED: 'AED ', EUR: '€' };
    state.currencySymbol = symMap[state.currency] || '$';
    state.scopeDescription = document.getElementById('f_desc').value;
    state.deliverables = document.getElementById('f_deliverables').value;
    state.scheduleImpactDays = Number(document.getElementById('f_days').value) || 0;
    state.paymentTerms = document.getElementById('f_terms').value;
  }

  function recalculate() {
    const baseCost = state.estimatedHours * state.hourlyRate;
    const bufferCost = baseCost * (state.bufferPercentage / 100);
    const subtotal = baseCost + bufferCost;
    const rushAdjustment = subtotal * (state.rushMultiplier - 1);
    const totalCost = subtotal * state.rushMultiplier;

    // Update metrics strip
    const sym = state.currencySymbol;
    document.getElementById('m_total').textContent = sym + totalCost.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    document.getElementById('m_hours').textContent = (state.estimatedHours * (1 + state.bufferPercentage/100)).toFixed(1) + ' hrs';
    document.getElementById('m_delay').textContent = '+' + state.scheduleImpactDays + ' Business Days';

    // Update rendered document sheet
    renderDocumentSheet(baseCost, bufferCost, rushAdjustment, totalCost);

    // Update communication scripts
    renderScripts(totalCost);
  }

  function renderDocumentSheet(baseCost, bufferCost, rushAdjustment, totalCost) {
    const sym = state.currencySymbol;
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    document.getElementById('doc_rendered_title').textContent = state.title;
    document.getElementById('doc_rendered_client').textContent = state.clientName;
    document.getElementById('doc_rendered_ref').textContent = state.contractRef;
    document.getElementById('doc_rendered_date').textContent = today;
    document.getElementById('doc_rendered_desc').textContent = state.scopeDescription;

    const delivList = document.getElementById('doc_rendered_deliv');
    delivList.innerHTML = '';
    state.deliverables.split('\n').filter(Boolean).forEach(d => {
      const li = document.createElement('li');
      li.textContent = d.replace(/^[0-9]+[.)]\s*/, '');
      delivList.appendChild(li);
    });

    document.getElementById('doc_rendered_terms').textContent = state.paymentTerms;
    document.getElementById('doc_rendered_delay').textContent = state.scheduleImpactDays + ' additional business days added to project completion milestone.';

    // Table rows
    document.getElementById('td_base_hours').textContent = state.estimatedHours + ' hrs @ ' + sym + state.hourlyRate + '/hr';
    document.getElementById('td_base_val').textContent = sym + baseCost.toLocaleString();

    document.getElementById('td_buffer_rate').textContent = state.bufferPercentage + '% contingency buffer';
    document.getElementById('td_buffer_val').textContent = sym + bufferCost.toLocaleString();

    document.getElementById('td_rush_multiplier').textContent = state.rushMultiplier > 1 ? (state.rushMultiplier + 'x expedited delivery rate') : 'Standard cadence';
    document.getElementById('td_rush_val').textContent = sym + rushAdjustment.toLocaleString();

    document.getElementById('td_total_val').textContent = sym + totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function renderScripts(totalCost) {
    const sym = state.currencySymbol;
    const formattedTotal = sym + totalCost.toLocaleString();

    // Script 1: Diplomatic
    document.getElementById('script_diplomatic').textContent = 
`Hi ${state.clientName},

Thanks for sending over this update regarding the ${state.title}!

This is a fantastic addition and will definitely elevate the user experience. Because this falls outside our original Statement of Work (${state.contractRef}), I've put together a quick Change Order Addendum to keep our scope clean and deliverables on track.

Summary of Additional Scope:
• Investment: ${formattedTotal}
• Timeline Adjustment: +${state.scheduleImpactDays} business days
• Terms: ${state.paymentTerms}

I've attached the formal Change Order Addendum for your review and sign-off. As soon as you give the green light, we'll schedule this into our upcoming development sprint!

Best regards,`;

    // Script 2: Firm Agency
    document.getElementById('script_firm').textContent = 
`Dear ${state.clientName},

We have completed the technical evaluation for your recent request regarding "${state.title}".

As outlined in Section 4 of our Master Services Agreement (${state.contractRef}), tasks expanding the signed specifications are executed via formal Change Orders to protect milestone commitments and delivery integrity.

Change Order Details:
• Approved Scope: ${state.scopeDescription}
• Total Fixed Fee: ${formattedTotal}
• Delivery Impact: +${state.scheduleImpactDays} business days

Please sign the attached Addendum or reply with "Approved" so our production team can allocate engineering resources accordingly.

Sincerely,`;

    // Script 3: Retainer / Phase 2 Pivot
    document.getElementById('script_retainer').textContent = 
`Hi ${state.clientName},

I love this direction for "${state.title}"!

To ensure we launch our core milestone on our original target date without delays, we have two great options:

Option A (Add to Phase 1 via Change Order):
We execute this immediately as an addendum for ${formattedTotal} and adjust our milestone by +${state.scheduleImpactDays} days.

Option B (Priority Backlog in Phase 2 / Monthly Retainer):
We launch the current scope on schedule, and roll this feature directly into our Month 1 optimization retainer, saving you extra rush fees while keeping launch momentum high.

Let me know which route fits your strategic timeline best!`;
  }

  function generateMarkdownAddendum() {
    const sym = state.currencySymbol;
    const today = new Date().toISOString().split('T')[0];
    return `# CHANGE ORDER ADDENDUM
**Project**: ${state.title}
**Client**: ${state.clientName}
**Contract Reference**: ${state.contractRef}
**Date**: ${today}

---
### 1. Scope Description
${state.scopeDescription}

### 2. Itemized Deliverables
${state.deliverables}

### 3. Financial & Schedule Impact
- **Total Additional Investment**: ${sym}${document.getElementById('m_total').textContent}
- **Timeline Adjustment**: +${state.scheduleImpactDays} Business Days
- **Payment Terms**: ${state.paymentTerms}

### 4. Authorization & Sign-Off
Client Signature: _______________________ Date: ___________
Provider Signature: _____________________ Date: ___________
`;
  }

  function saveChangeOrderToStorage() {
    const orders = JSON.parse(localStorage.getItem('scopeguard_saved_orders') || '[]');
    const total = document.getElementById('m_total').textContent;
    const newOrder = {
      id: 'CO-' + Date.now(),
      date: new Date().toISOString(),
      client: state.clientName,
      title: state.title,
      total: total,
      days: state.scheduleImpactDays
    };
    orders.push(newOrder);
    localStorage.setItem('scopeguard_saved_orders', JSON.stringify(orders));
    alert('Change Order logged to local dashboard! Total saved orders: ' + orders.length);
  }

  window.addEventListener('DOMContentLoaded', init);
})();
