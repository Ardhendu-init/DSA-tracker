// ── Firebase Init ──
firebase.initializeApp(firebaseConfig);
const db   = firebase.firestore();
const auth = firebase.auth();

// ── State ──
let currentUser = null;
let qs = [];

const DAYS = { 1: 2, 2: 3, 3: 5, 4: 7, 5: 10 };

function uid()  { return Date.now().toString(36) + Math.random().toString(36).slice(2); }
function today(){ return new Date().toISOString().split('T')[0]; }

function nextRev(lastRevised, conf) {
    if (!lastRevised) return null;
    const d = new Date(lastRevised + 'T00:00:00');
    d.setDate(d.getDate() + DAYS[conf]);
    return d.toISOString().split('T')[0];
}

function fmtDate(s) {
    if (!s) return '—';
    return new Date(s + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Auth ──
auth.onAuthStateChanged(async user => {
    if (user) {
        currentUser = user;
        const avatar = document.getElementById('userAvatar');
        if (user.photoURL) {
            avatar.src = user.photoURL;
            avatar.style.display = 'block';
        } else {
            avatar.style.display = 'none';
        }
        document.getElementById('userDisplayName').textContent = user.displayName || user.email;
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainApp').style.display = '';
        await loadQuestions();
    } else {
        currentUser = null;
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('mainApp').style.display = 'none';
    }
});

function signIn() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch(err => toast(err.message, 'error'));
}

function signOutUser() {
    auth.signOut();
}

// ── Firestore helpers ──
function qsRef() {
    return db.collection('users').doc(currentUser.uid).collection('questions');
}

async function loadQuestions() {
    try {
        const snap = await qsRef().get();
        qs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        refreshTagFilter();
        render();
    } catch (e) {
        toast('Failed to load data. Check your connection.', 'error');
    }
}

async function persistQ(q) {
    try {
        await qsRef().doc(q.id).set(q);
    } catch (e) {
        toast('Save failed. Check your connection.', 'error');
    }
}

async function removeQ(id) {
    try {
        await qsRef().doc(id).delete();
    } catch (e) {
        toast('Delete failed. Check your connection.', 'error');
    }
}

// ── Dark mode (theme stays in localStorage — no auth needed) ──
(function () {
    const t = localStorage.getItem('dsa_theme') || 'light';
    if (t === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.getElementById('darkBtn').innerHTML = '<i class="fas fa-sun"></i>';
    }
})();

function toggleDark() {
    const cur = document.documentElement.getAttribute('data-theme');
    const nxt = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nxt);
    localStorage.setItem('dsa_theme', nxt);
    document.getElementById('darkBtn').innerHTML = nxt === 'dark'
        ? '<i class="fas fa-sun"></i>'
        : '<i class="fas fa-moon"></i>';
}

// ── Toast ──
function toast(msg, type = 'success') {
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<i class="fas ${icons[type]}"></i> ${msg}`;
    document.getElementById('toasts').appendChild(el);
    setTimeout(() => el.remove(), 3000);
}

// ── Add / Edit modal ──
function openAddModal() {
    document.getElementById('formTitle').innerHTML =
        '<i class="fas fa-plus-circle" style="margin-right:.4rem;color:var(--accent)"></i>Add Question';
    document.getElementById('fName').value = '';
    document.getElementById('fLink').value = '';
    document.getElementById('fqPlatform').value = 'LeetCode';
    document.getElementById('fConfLevel').value = '3';
    document.getElementById('fTags').value = '';
    document.getElementById('fTime').value = '';
    document.getElementById('fDate').value = today();
    document.getElementById('fApproach').value = '';
    document.getElementById('fMistakes').value = '';
    document.getElementById('fId').value = '';
    document.getElementById('formModal').classList.add('active');
    document.getElementById('fName').focus();
}

function openEditModal(id) {
    const q = qs.find(x => x.id === id);
    if (!q) return;
    document.getElementById('formTitle').innerHTML =
        '<i class="fas fa-edit" style="margin-right:.4rem;color:var(--accent)"></i>Edit Question';
    document.getElementById('fId').value        = q.id;
    document.getElementById('fName').value      = q.name;
    document.getElementById('fLink').value      = q.link || '';
    document.getElementById('fqPlatform').value = q.platform;
    document.getElementById('fConfLevel').value = q.confidence;
    document.getElementById('fTags').value      = (q.tags || []).join(', ');
    document.getElementById('fTime').value      = q.timeComplexity || '';
    document.getElementById('fDate').value      = q.lastRevised || today();
    document.getElementById('fApproach').value  = q.approach || '';
    document.getElementById('fMistakes').value  = q.mistakes || '';
    document.getElementById('formModal').classList.add('active');
}

function closeForm() { document.getElementById('formModal').classList.remove('active'); }

async function saveQ() {
    const name = document.getElementById('fName').value.trim();
    if (!name) { toast('Question name is required.', 'error'); return; }
    const id = document.getElementById('fId').value;

    const q = {
        id: id || uid(),
        name,
        link: document.getElementById('fLink').value.trim(),
        platform: document.getElementById('fqPlatform').value,
        confidence: parseInt(document.getElementById('fConfLevel').value),
        tags: document.getElementById('fTags').value.split(',').map(t => t.trim()).filter(Boolean),
        timeComplexity: document.getElementById('fTime').value.trim(),
        lastRevised: document.getElementById('fDate').value || today(),
        approach: document.getElementById('fApproach').value.trim(),
        mistakes: document.getElementById('fMistakes').value.trim(),
        createdAt: id ? (qs.find(x => x.id === id)?.createdAt || Date.now()) : Date.now(),
    };

    if (id) {
        qs[qs.findIndex(x => x.id === id)] = q;
        toast('Question updated!');
    } else {
        qs.unshift(q);
        toast('Question added!');
    }

    closeForm();
    refreshTagFilter();
    render();

    await persistQ(q);
}

// ── Delete / Mark revised ──
async function deleteQ(id) {
    if (!confirm('Delete this question? This cannot be undone.')) return;
    qs = qs.filter(x => x.id !== id);
    refreshTagFilter();
    render();
    toast('Deleted.', 'info');
    await removeQ(id);
}

async function markRevised(id) {
    const i = qs.findIndex(x => x.id === id);
    if (i === -1) return;
    qs[i].lastRevised = today();
    render();
    toast('Marked as revised today!');
    await persistQ(qs[i]);
}

// ── Detail modal ──
function openDetail(id) {
    const q = qs.find(x => x.id === id);
    if (!q) return;

    const nr       = nextRev(q.lastRevised, q.confidence);
    const over     = nr && nr <= today();
    const cLabels  = { 1: 'Very Weak', 2: 'Weak', 3: 'Medium', 4: 'Strong', 5: 'Very Strong' };
    const cBadge   = { 1: 'badge-red', 2: 'badge-red', 3: 'badge-yellow', 4: 'badge-green', 5: 'badge-green' };

    document.getElementById('detailTitle').innerHTML =
        `<i class="fas fa-eye" style="margin-right:.4rem;color:var(--accent)"></i>${q.name}`;

    let html = '';

    if (q.approach) {
        html += `<div class="detail-section">
            <h3><i class="fas fa-lightbulb" style="margin-right:.3rem"></i>Approach</h3>
            <p>${q.approach.replace(/\n/g, '<br>')}</p>
        </div>`;
    }

    if (q.timeComplexity) {
        html += `<div class="detail-section">
            <h3><i class="fas fa-clock" style="margin-right:.3rem"></i>Time Complexity</h3>
            <p><code style="background:var(--bg-primary);padding:.2rem .5rem;border-radius:.25rem">${q.timeComplexity}</code></p>
        </div>`;
    }

    html += `<div class="detail-section">
        <h3><i class="fas fa-chart-bar" style="margin-right:.3rem"></i>Status</h3>
        <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.25rem">
            <span class="badge ${cBadge[q.confidence]}">${q.confidence}/5 — ${cLabels[q.confidence]}</span>
            <span class="badge badge-blue">Last: ${fmtDate(q.lastRevised)}</span>
            <span class="badge ${over ? 'badge-red revise-now' : 'badge-green'}">
                ${over ? '<i class="fas fa-bell"></i> Revise Now' : 'Next: ' + fmtDate(nr)}
            </span>
        </div>
    </div>`;

    if ((q.tags || []).length) {
        html += `<div class="detail-section">
            <h3><i class="fas fa-tags" style="margin-right:.3rem"></i>Topics</h3>
            <div class="tag-list" style="margin-top:.25rem">${q.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
        </div>`;
    }

    html += `<div class="detail-section">
        <h3><i class="fas fa-exclamation-triangle" style="margin-right:.3rem;color:var(--red-text)"></i>Mistake Notes</h3>
        ${q.mistakes
            ? `<div class="mistake-box">${q.mistakes.replace(/\n/g, '<br>')}</div>`
            : `<p style="color:var(--text-secondary);font-style:italic">No mistake notes recorded.</p>`
        }
    </div>`;

    if (q.link) {
        html += `<div style="margin-top:.5rem">
            <a href="${q.link}" target="_blank" rel="noopener"
               class="btn btn-primary" style="text-decoration:none">
                <i class="fas fa-external-link-alt"></i> Open Problem
            </a>
        </div>`;
    }

    document.getElementById('detailBody').innerHTML = html;
    document.getElementById('detailModal').classList.add('active');
}

function closeDetail() { document.getElementById('detailModal').classList.remove('active'); }

// Close modals on backdrop click / Escape
['formModal', 'detailModal'].forEach(id => {
    document.getElementById(id).addEventListener('click', function (e) {
        if (e.target === this) this.classList.remove('active');
    });
});
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeForm(); closeDetail(); }
});

// ── Dashboard ──
function updateDashboard() {
    document.getElementById('statTotal').textContent  = qs.length;
    document.getElementById('statWeak').textContent   = qs.filter(q => q.confidence <= 2).length;
    document.getElementById('statStrong').textContent = qs.filter(q => q.confidence >= 4).length;

    const weakQs = qs.filter(q => q.confidence <= 2);
    const tc = {};
    weakQs.forEach(q => (q.tags || []).forEach(t => { const k = t.trim(); if (k) tc[k] = (tc[k] || 0) + 1; }));
    const top = Object.entries(tc).sort((a, b) => b[1] - a[1])[0];
    document.getElementById('statTopic').textContent = top ? `${top[0]} (${top[1]})` : '—';
}

// ── Tag filter ──
function refreshTagFilter() {
    const all = new Set();
    qs.forEach(q => (q.tags || []).forEach(t => t.trim() && all.add(t.trim())));
    const sel = document.getElementById('fTag');
    const cur = sel.value;
    sel.innerHTML = '<option value="">All Tags</option>';
    [...all].sort().forEach(t => {
        const o = document.createElement('option');
        o.value = t; o.textContent = t;
        if (t === cur) o.selected = true;
        sel.appendChild(o);
    });
}

// ── Sort tabs ──
function setSortTab(btn) {
    document.querySelectorAll('.sort-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('fSort').value = btn.dataset.value;
    render();
}

// ── Render ──
function render() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const conf   = document.getElementById('fConfidence').value;
    const tag    = document.getElementById('fTag').value;
    const sort   = document.getElementById('fSort').value;

    let data = qs.filter(q => {
        if (search && !q.name.toLowerCase().includes(search)) return false;
        if (conf   && q.confidence !== parseInt(conf)) return false;
        if (tag    && !(q.tags || []).some(t => t.toLowerCase() === tag.toLowerCase())) return false;
        return true;
    });

    if (sort === 'revision') {
        data.sort((a, b) =>
            (nextRev(a.lastRevised, a.confidence) || '9999').localeCompare(nextRev(b.lastRevised, b.confidence) || '9999'));
    } else if (sort === 'conf-asc') {
        data.sort((a, b) => a.confidence - b.confidence);
    } else if (sort === 'conf-desc') {
        data.sort((a, b) => b.confidence - a.confidence);
    } else {
        data.sort((a, b) => b.createdAt - a.createdAt);
    }

    const tbody   = document.getElementById('tbody');
    const empty   = document.getElementById('emptyState');
    const countEl = document.getElementById('qCount');

    countEl.textContent = `${data.length} question${data.length !== 1 ? 's' : ''}`;

    if (!data.length) {
        tbody.innerHTML = '';
        empty.style.display = 'block';
        updateDashboard();
        return;
    }
    empty.style.display = 'none';

    const rowClass  = { 1: 'conf-weak', 2: 'conf-weak', 3: 'conf-medium', 4: 'conf-strong', 5: 'conf-strong' };
    const platClass = { LeetCode: 'platform-leetcode', GFG: 'platform-gfg', Codeforces: 'platform-codeforces', Other: 'platform-other' };
    const platIcon  = { LeetCode: 'fa-code', GFG: 'fa-leaf', Codeforces: 'fa-trophy', Other: 'fa-question' };

    tbody.innerHTML = data.map(q => {
        const nr    = nextRev(q.lastRevised, q.confidence);
        const over  = nr && nr <= today();
        const tags  = (q.tags || []).slice(0, 2);
        const extra = (q.tags || []).length - 2;
        const dots  = Array.from({ length: 5 }, (_, i) => {
            const cls = i < q.confidence ? `filled lv-${q.confidence}` : '';
            return `<div class="conf-dot ${cls}"></div>`;
        }).join('');

        return `<tr class="${rowClass[q.confidence]}">
            <td class="question-name">
                ${q.link
                    ? `<a href="${q.link}" target="_blank" rel="noopener">${q.name}</a>`
                    : `<span>${q.name}</span>`}
            </td>
            <td>
                <span class="${platClass[q.platform] || 'platform-other'}">
                    <i class="fas ${platIcon[q.platform] || 'fa-question'}" style="margin-right:.25rem;font-size:.7rem"></i>${q.platform}
                </span>
            </td>
            <td>
                <div class="tag-list">
                    ${tags.map(t => `<span class="tag">${t}</span>`).join('')}
                    ${extra > 0 ? `<button class="tag tag-more" onclick="openDetail('${q.id}')" title="View all tags">+${extra} more</button>` : ''}
                </div>
            </td>
            <td>
                <div class="conf-dots">${dots}</div>
                <div style="font-size:.7rem;color:var(--text-secondary);margin-top:.2rem">${q.confidence}/5</div>
            </td>
            <td style="font-size:.8rem;color:var(--text-secondary)">${fmtDate(q.lastRevised)}</td>
            <td>
                ${nr
                    ? over
                        ? `<span class="badge badge-red revise-now"><i class="fas fa-bell"></i> Revise Now</span>`
                        : `<span style="font-size:.8rem;color:var(--text-secondary)">${fmtDate(nr)}</span>`
                    : '<span style="color:var(--text-secondary)">—</span>'
                }
            </td>
            <td>
                <div class="actions">
                    <button class="btn-action btn-view"   onclick="openDetail('${q.id}')"    title="View details"><i class="fas fa-eye"></i></button>
                    <button class="btn-action btn-revise" onclick="markRevised('${q.id}')"   title="Mark revised today"><i class="fas fa-check"></i></button>
                    <button class="btn-action btn-edit"   onclick="openEditModal('${q.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="btn-action btn-delete" onclick="deleteQ('${q.id}')"       title="Delete"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>`;
    }).join('');

    updateDashboard();
}
