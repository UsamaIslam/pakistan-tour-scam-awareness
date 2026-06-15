const API_BASE = window.location.hostname.endsWith('github.io')
    ? 'https://touredgetouravenuescam.owasol.com'
    : '';

let allReports = [];
let allCompanies = [];

// Fetch and render companies list
async function fetchCompanies() {
    try {
        const response = await fetch(API_BASE + '/api/companies');
        if (!response.ok) throw new Error('Failed to fetch companies.');
        allCompanies = await response.json();
        renderCompaniesDropdowns(allCompanies);
    } catch (err) {
        console.error(err);
    }
}

function renderCompaniesDropdowns(companies) {
    const formSelect = document.getElementById('form-operator');
    const filterSelect = document.getElementById('filter-operator');

    if (!formSelect || !filterSelect) return;

    // Populate form select dropdown
    let formOptions = '<option value="" disabled selected>-- Select Tour Operator --</option>';
    companies.forEach(company => {
        formOptions += `<option value="${escapeHTML(company.name)}">${escapeHTML(company.name)}</option>`;
    });
    formOptions += '<option value="Other Operator">Other Operator...</option>';
    formSelect.innerHTML = formOptions;

    // Populate filter dropdown
    let filterOptions = '<option value="ALL">Show All Operators</option>';
    companies.forEach(company => {
        filterOptions += `<option value="${escapeHTML(company.name)}">${escapeHTML(company.name)} Only</option>`;
    });
    filterSelect.innerHTML = filterOptions;
}

// Fetch and render comments
async function fetchReports() {
    const listContainer = document.getElementById('reports-list');
    if (!listContainer) return;
    try {
        const response = await fetch(API_BASE + '/api/comments');
        if (!response.ok) throw new Error('Failed to fetch comments.');
        allReports = await response.json();
        renderReports(allReports);
    } catch (err) {
        console.error(err);
        listContainer.innerHTML = `<p style="text-align: center; color: var(--primary-red);">Error loading reports. Please refresh the page.</p>`;
    }
}

function renderReports(reports) {
    const listContainer = document.getElementById('reports-list');
    if (!listContainer) return;
    if (reports.length === 0) {
        listContainer.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No reports submitted yet. Be the first to share your experience!</p>`;
        return;
    }

    listContainer.innerHTML = reports.map(report => {
        const stars = '★'.repeat(report.rating) + '☆'.repeat(5 - report.rating);
        const dateFormatted = new Date(report.created_at).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        return `
            <div class="link-card" style="margin-bottom: 1.5rem; border-left: 4px solid var(--primary-red);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem;">
                    <div>
                        <strong style="color: var(--text-main); font-size: 1.05rem;">${escapeHTML(report.name)}</strong>
                        <span class="label-red" style="margin-left: 0.5rem; font-size: 0.65rem;">${escapeHTML(report.operator)}</span>
                    </div>
                    <div style="font-size: 0.85rem; color: var(--text-muted);">
                        Trip: ${escapeHTML(report.trip_date)} | ${dateFormatted}
                    </div>
                </div>
                <div style="color: var(--warning-yellow); margin-bottom: 0.75rem; font-size: 0.9rem; letter-spacing: 1px;">
                    ${stars}
                </div>
                <p style="color: var(--text-main); font-size: 0.95rem; margin-bottom: 0; white-space: pre-wrap;">${escapeHTML(report.issue)}</p>
            </div>
        `;
    }).join('');
}

function filterReports() {
    const filterEl = document.getElementById('filter-operator');
    if (!filterEl) return;
    const val = filterEl.value;
    if (val === 'ALL') {
        renderReports(allReports);
    } else {
        const filtered = allReports.filter(r => r.operator === val);
        renderReports(filtered);
    }
}

function escapeHTML(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Conditional field toggle for Other Operator
function toggleOtherOperator(value) {
    const container = document.getElementById('other-operator-container');
    const input = document.getElementById('form-other-operator');
    if (!container || !input) return;
    if (value === 'Other Operator') {
        container.classList.add('visible');
        input.required = true;
        requestAnimationFrame(() => {
            input.focus();
        });
    } else {
        container.classList.remove('visible');
        input.required = false;
        input.value = '';
    }
}

// Initialize star rating widget actions
const starButtons = document.querySelectorAll('#star-widget .star-btn');
const ratingHiddenInput = document.getElementById('form-rating');

if (starButtons && ratingHiddenInput) {
    starButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const val = parseInt(btn.getAttribute('data-value'), 10);
            ratingHiddenInput.value = val;
            updateStarWidget(val);
        });
    });
}

function updateStarWidget(rating) {
    if (!starButtons) return;
    starButtons.forEach(btn => {
        const val = parseInt(btn.getAttribute('data-value'), 10);
        if (val <= rating) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Handle form submit
const reportForm = document.getElementById('report-form');
if (reportForm) {
    reportForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const name = document.getElementById('form-name').value;
        let operator = document.getElementById('form-operator').value;
        if (operator === 'Other Operator') {
            operator = document.getElementById('form-other-operator').value || 'Other Operator';
        }
        const trip_date = document.getElementById('form-date').value;
        const rating = document.getElementById('form-rating').value;
        const issue = document.getElementById('form-issue').value;
        const website_url = document.getElementById('form-website-url').value;

        const btn = e.target.querySelector('button[type="submit"]');
        const originalText = btn ? btn.innerText : 'Submit';
        if (btn) {
            btn.disabled = true;
            btn.innerText = 'Submitting Report...';
        }

        try {
            const response = await fetch(API_BASE + '/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, operator, trip_date, rating, issue, website_url })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to submit report.');
            }

            // Reset form, ratings widget, and conditional fields
            reportForm.reset();
            if (ratingHiddenInput) ratingHiddenInput.value = 1;
            updateStarWidget(1);
            toggleOtherOperator('');
            
            await fetchCompanies(); // reload companies dropdown in case of custom entry
            await fetchReports();
            alert('Thank you. Your warning report has been submitted to the community database.');
        } catch (err) {
            alert('Error: ' + err.message);
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerText = originalText;
            }
        }
    });
}

// Initialize on load
async function init() {
    if (document.getElementById('form-operator') || document.getElementById('filter-operator')) {
        await fetchCompanies();
    }
    if (document.getElementById('reports-list')) {
        await fetchReports();
    }
}
init();

// Theme toggling logic
const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

if (themeToggleBtn && themeIcon) {
    // Toggle event
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.classList.contains('light-theme') ? 'light' : 'dark';
        let newTheme = 'dark';
        if (currentTheme === 'dark') {
            newTheme = 'light';
            document.documentElement.classList.add('light-theme');
            themeIcon.innerText = '🌙';
        } else {
            newTheme = 'dark';
            document.documentElement.classList.remove('light-theme');
            themeIcon.innerText = '☀️';
        }
        localStorage.setItem('theme', newTheme);
    });

    // Initialize theme icon on load
    const activeTheme = localStorage.getItem('theme') || 'dark';
    if (activeTheme === 'light') {
        themeIcon.innerText = '🌙';
    } else {
        themeIcon.innerText = '☀️';
    }
}
