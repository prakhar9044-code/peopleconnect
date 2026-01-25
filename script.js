const db = JSON.parse(localStorage.getItem('pc_database')) || { users: [], surveys: [], journals: [] };
function saveToDB() { localStorage.setItem('pc_database', JSON.stringify(db)); }
const currentUser = { isLoggedIn: false, name: "", email: "", isAdmin: false };
if(localStorage.getItem('pc_isLoggedIn') === 'true') { loginSuccess(localStorage.getItem('active_name'), localStorage.getItem('active_email')); }

function checkAuth(feature) {
    if(!currentUser.isLoggedIn) { openAuth(); return; }
    if(feature === 'geo') { document.getElementById('locator').scrollIntoView({ behavior: 'smooth' }); activateGeo(); }
    if(feature === 'breathe') toggleBreathing();
    if(feature === 'journal') saveEntry();
    if(feature === 'ground') startGrounding();
    if(feature === 'survey') { document.getElementById('survey-welcome').style.display = 'none'; document.getElementById('survey-ui').style.display='block'; renderQuestion(); }
}

function openAuth() { document.getElementById('auth-modal').style.display='flex'; }
function closeAuth() { document.getElementById('auth-modal').style.display='none'; document.getElementById('login-error').style.display='none'; }
function switchAuth(type) { document.getElementById('login-form').classList.toggle('active'); document.getElementById('register-form').classList.toggle('active'); document.getElementById('login-error').style.display='none'; }
function handleRegister(e) { e.preventDefault(); const n=document.getElementById('reg-name').value; const em=document.getElementById('reg-email').value; const p=document.getElementById('reg-pass').value; const userExists = db.users.find(u => u.email === em); if(!userExists) { db.users.push({ name: n, email: em, joined: new Date().toLocaleDateString() }); saveToDB(); } localStorage.setItem('db_email', em); localStorage.setItem('db_pass', p); localStorage.setItem('db_name', n); setTimeout(() => { loginSuccess(n, em); closeAuth(); }, 800); }
function handleLogin(e) { e.preventDefault(); const em=document.getElementById('login-email').value; const p=document.getElementById('login-pass').value; if(em === "admin@pc.com" && p === "admin123") { loginSuccess("Administrator", em, true); closeAuth(); return; } if(em===localStorage.getItem('db_email') && p===localStorage.getItem('db_pass')) { loginSuccess(localStorage.getItem('db_name'), em); closeAuth(); } else { document.getElementById('login-error').style.display='block'; } }
function loginSuccess(n, e, isAdmin = false) { currentUser.isLoggedIn=true; currentUser.name=n; currentUser.email=e; currentUser.isAdmin = isAdmin; localStorage.setItem('pc_isLoggedIn','true'); localStorage.setItem('active_name',n); localStorage.setItem('active_email',e); document.getElementById('nav-login-btn').style.display='none'; if(isAdmin) { document.getElementById('nav-admin-btn').style.display='flex'; document.getElementById('nav-user-profile').style.display='none'; } else { document.getElementById('nav-admin-btn').style.display='none'; document.getElementById('nav-user-profile').style.display='flex'; document.getElementById('nav-name').innerText=n; document.getElementById('nav-avatar').innerText=n.charAt(0).toUpperCase(); updateProfileStats(); } }
function logout() { currentUser.isLoggedIn=false; localStorage.removeItem('pc_isLoggedIn'); location.reload(); }
function openProfile() { document.getElementById('profile-modal').style.display='flex'; document.getElementById('p-name').innerText=currentUser.name; document.getElementById('p-avatar').innerText=currentUser.name.charAt(0).toUpperCase(); updateProfileStats(); backToProfileMain(); }
function closeProfile() { document.getElementById('profile-modal').style.display='none'; }
function updateProfileStats() { const userSurveys = db.surveys.filter(s => s.userEmail === currentUser.email); const userJournals = db.journals.filter(j => j.userEmail === currentUser.email); document.getElementById('p-journal').innerText = userJournals.length + " saved entries"; if(userSurveys.length > 0) { const last = userSurveys[userSurveys.length - 1]; document.getElementById('p-mood').innerText = last.mood; document.getElementById('p-mood').style.color = last.score > 70 ? 'var(--success)' : 'var(--warning)'; } else { document.getElementById('p-mood').innerText = "Not assessed yet"; document.getElementById('p-mood').style.color = "var(--muted)"; } }
function viewUserHistory(type) { document.getElementById('profile-main-view').style.display = 'none'; document.getElementById('profile-history-view').style.display = 'block'; const content = document.getElementById('history-content'); const title = document.getElementById('history-title'); content.innerHTML = ''; if(type === 'journals') { title.innerText = "Reflection Logs"; const logs = db.journals.filter(j => j.userEmail === currentUser.email); if(logs.length === 0) content.innerHTML = '<p style="color:var(--muted); text-align:center;">No entries found.</p>'; logs.reverse().forEach(log => { content.innerHTML += `<div class="history-item"><div class="history-date">${log.date}</div><div class="history-val"><span style="font-size:1.2rem; margin-right:10px;">${log.mood}</span> ${log.text}</div></div>`; }); } else if (type === 'surveys') { title.innerText = "Wellness Assessments"; const surveys = db.surveys.filter(s => s.userEmail === currentUser.email); if(surveys.length === 0) content.innerHTML = '<p style="color:var(--muted); text-align:center;">No assessments found.</p>'; surveys.reverse().forEach(s => { const col = s.score > 70 ? 'var(--success)' : 'var(--danger)'; content.innerHTML += `<div class="history-item" style="border-left: 3px solid ${col}"><div class="history-date">${s.date}</div><div class="history-val" style="display:flex; justify-content:space-between;"><span>Score: ${s.score}/100</span><span style="color:${col}; font-weight:700;">${s.mood}</span></div></div>`; }); } }
function backToProfileMain() { document.getElementById('profile-history-view').style.display = 'none'; document.getElementById('profile-main-view').style.display = 'flex'; }
function openAdmin() { document.getElementById('admin-modal').style.display = 'flex'; switchAdminTab('users'); }
function closeAdmin() { document.getElementById('admin-modal').style.display = 'none'; }
function switchAdminTab(tab) { document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active')); event.target.classList.add('active'); const view = document.getElementById('admin-view'); let html = `<table class="data-table">`; if(tab === 'users') { html += `<thead><tr><th>Name</th><th>Email</th><th>Joined</th><th>Status</th></tr></thead><tbody>`; if(db.users.length === 0) html += `<tr><td colspan="4">No users registered yet.</td></tr>`; db.users.forEach(u => { html += `<tr><td>${u.name}</td><td style="color:var(--primary)">${u.email}</td><td>${u.joined}</td><td><span class="status-pill status-good">Active</span></td></tr>`; }); } else if (tab === 'surveys') { html += `<thead><tr><th>User</th><th>Date</th><th>Score</th><th>Status</th></tr></thead><tbody>`; if(db.surveys.length === 0) html += `<tr><td colspan="4">No survey data collected.</td></tr>`; db.surveys.forEach(s => { const statusClass = s.score > 70 ? 'status-good' : 'status-bad'; html += `<tr><td>${s.userName}</td><td>${s.date}</td><td>${s.score}/100</td><td><span class="status-pill ${statusClass}">${s.mood}</span></td></tr>`; }); } else if (tab === 'journals') { html += `<thead><tr><th>User</th><th>Date</th><th>Mood</th><th>Entry Snippet</th></tr></thead><tbody>`; if(db.journals.length === 0) html += `<tr><td colspan="4">No journal entries found.</td></tr>`; db.journals.forEach(j => { html += `<tr><td>${j.userName}</td><td>${j.date}</td><td style="font-size:1.2rem">${j.mood}</td><td style="color:var(--muted)">${j.text.substring(0, 40)}...</td></tr>`; }); } html += `</tbody></table>`; view.innerHTML = html; }

let timerInterval, timeLeft, isFocusing = false, isBreak = false, workDuration = 25, breakDuration = 5, totalTime = workDuration * 60;
document.getElementById('distract-pad').value = localStorage.getItem('distraction_notes') || "";
function updateDuration() { if(!isFocusing) { workDuration = parseInt(document.getElementById('work-dur').value) || 25; breakDuration = parseInt(document.getElementById('break-dur').value) || 5; resetTimer(); } }
function toggleTimer() { const btn = document.getElementById('start-btn'), inputs = document.querySelectorAll('.time-input'), box = document.getElementById('focus-box'); if(!isFocusing) { document.body.classList.add('deep-focus-mode'); box.classList.add('active'); isFocusing = true; btn.innerText = "Stop Session"; btn.style.background = "var(--danger)"; btn.classList.add('active'); inputs.forEach(i => i.disabled = true); if(timeLeft === undefined) timeLeft = workDuration * 60; totalTime = timeLeft; timerInterval = setInterval(updateTimer, 1000); } else { document.body.classList.remove('deep-focus-mode'); box.classList.remove('active'); isFocusing = false; clearInterval(timerInterval); btn.innerText = "Resume Session"; btn.style.background = "var(--primary)"; btn.classList.remove('active'); inputs.forEach(i => i.disabled = false); } }
function updateTimer() { const display = document.getElementById('timer-display'), status = document.getElementById('timer-status'), bar = document.getElementById('timer-bar'), liquid = document.getElementById('coffee-liquid'); if(timeLeft > 0) { timeLeft--; let m = Math.floor(timeLeft / 60), s = timeLeft % 60; display.innerText = `${m < 10 ? '0'+m : m}:${s < 10 ? '0'+s : s}`; let percentage = ((totalTime - timeLeft) / totalTime) * 100; bar.style.width = percentage + "%"; liquid.style.height = (100 - percentage) + "%"; } else { if(!isBreak) { isBreak = true; timeLeft = breakDuration * 60; totalTime = timeLeft; status.innerText = "Break Time - Refill Coffee"; status.className = "timer-status-badge status-break"; display.style.color = "var(--success)"; bar.style.background = "var(--success)"; liquid.style.height = "100%"; } else { isBreak = false; timeLeft = workDuration * 60; totalTime = timeLeft; status.innerText = "Focus Mode"; status.className = "timer-status-badge status-focus"; display.style.color = "var(--text)"; bar.style.background = "var(--primary)"; liquid.style.height = "100%"; } } }
function resetTimer() { clearInterval(timerInterval); isFocusing = false; isBreak = false; document.body.classList.remove('deep-focus-mode'); document.getElementById('focus-box').classList.remove('active'); workDuration = parseInt(document.getElementById('work-dur').value) || 25; timeLeft = workDuration * 60; totalTime = timeLeft; document.getElementById('timer-display').innerText = `${workDuration < 10 ? '0'+workDuration : workDuration}:00`; const btn = document.getElementById('start-btn'); btn.innerText = "Start Session"; btn.style.background = "var(--primary)"; btn.classList.remove('active'); document.getElementById('timer-status').innerText = "Ready to Focus?"; document.getElementById('timer-status').className = "timer-status-badge"; document.getElementById('timer-bar').style.width = "0%"; document.getElementById('coffee-liquid').style.height = "100%"; document.querySelectorAll('.time-input').forEach(i => i.disabled = false); }
function adjVol(id, val) { const audio = document.getElementById('dw-'+id); if(val > 0 && audio.paused) audio.play(); if(val == 0) audio.pause(); audio.volume = val / 100; }
function saveDistractions() { localStorage.setItem('distraction_notes', document.getElementById('distract-pad').value); }

const surveyQuestions = [ { type: 'single', q: 'How was your sleep quality last night?', opts: ['Restful', 'Okay', 'Poor', 'Insomniac'] }, { type: 'rating', q: 'Rate your energy levels today (1-10)' }, { type: 'single', q: 'How is your mental focus right now?', opts: ['Sharp', 'Distracted', 'Foggy', 'Scattered'] }, { type: 'rating', q: 'Rate your current stress level (1-10)' }, { type: 'multi', q: 'Physical sensations? (Select all that apply)', opts: ['Headache', 'Muscle Tension', 'Fatigue', 'Nausea', 'None'] }, { type: 'single', q: 'Current emotional state?', opts: ['Calm', 'Anxious', 'Sad', 'Irritable', 'Happy'] }, { type: 'rating', q: 'How connected do you feel to others? (1-10)' }, { type: 'text', q: 'One thing you are grateful for today?' } ];
let currQ = 0, answers = new Array(8).fill(null);
function renderQuestion() { const q = surveyQuestions[currQ], wrapper = document.getElementById('question-wrapper'); document.getElementById('survey-fill').style.width = ((currQ+1)/8)*100 + "%"; document.getElementById('prev-btn').disabled = (currQ === 0); document.getElementById('next-btn').innerText = (currQ === 7) ? "Finish" : "Next"; let html = `<div class="question-step active"><h3>${q.q}</h3>`; if(q.type === 'single') { q.opts.forEach(opt => { html += `<button class="option-btn ${answers[currQ]===opt?'selected':''}" onclick="handleSingle('${opt}')">${opt} <i class="fa-solid fa-chevron-right"></i></button>`; }); } else if(q.type === 'rating') { html += `<div class="rating-grid">`; for(let i=1; i<=10; i++) { html += `<div class="rating-num ${answers[currQ]===i?'selected':''}" onclick="handleRating(${i})">${i}</div>`; } html += `</div>`; } else if(q.type === 'multi') { q.opts.forEach(opt => { let isSel = (answers[currQ]||[]).includes(opt); html += `<button class="option-btn ${isSel?'selected':''}" onclick="handleMulti('${opt}', this)"><i class="fa-solid ${isSel?'fa-check-square':'fa-square'}"></i> ${opt}</button>`; }); } else if(q.type === 'text') { html += `<textarea class="survey-input" placeholder="Type here..." oninput="answers[currQ]=this.value">${answers[currQ]||''}</textarea>`; } html += `</div>`; wrapper.innerHTML = html; }
function handleSingle(val) { answers[currQ] = val; setTimeout(nextQuestion, 250); }
function handleRating(val) { answers[currQ] = val; renderQuestion(); }
function handleMulti(val, el) { if(!answers[currQ]) answers[currQ] = []; if(answers[currQ].includes(val)) answers[currQ] = answers[currQ].filter(i=>i!==val); else answers[currQ].push(val); renderQuestion(); }
function nextQuestion() { if(currQ < 7) { currQ++; renderQuestion(); } else calculateResults(); }
function prevQuestion() { if(currQ > 0) { currQ--; renderQuestion(); } }
function calculateResults() { document.getElementById('survey-ui').style.display = 'none'; document.getElementById('survey-results').style.display = 'block'; let score = 100; if(answers[0] === 'Insomniac') score -= 20; if(answers[1] < 4) score -= 10; if(answers[3] > 7) score -= 20; if(answers[5] === 'Anxious') score -= 15; document.getElementById('result-score').innerText = score; const moodTitle = score > 80 ? "Optimal Harmony" : score > 50 ? "Cognitive Strain" : "Acute Burnout"; document.getElementById('res-mood').innerText = "State: " + moodTitle; document.getElementById('res-mood').style.color = score > 80 ? "var(--success)" : score > 50 ? "var(--warning)" : "var(--danger)"; localStorage.setItem('last_mood', moodTitle); document.querySelector('.score-circle').style.background = `conic-gradient(${score > 80 ? "var(--success)" : score > 50 ? "var(--warning)" : "var(--danger)"} ${score}%, rgba(255,255,255,0.05) 0%)`; db.surveys.push({ userName: currentUser.name || "Guest", userEmail: currentUser.email, score: score, mood: moodTitle, date: new Date().toLocaleString() }); saveToDB(); }

function startGrounding() { document.getElementById('ground-welcome').style.display = 'none'; document.getElementById('ground-steps').style.display = 'block'; }
function nextGround(step) { document.querySelectorAll('.ground-step').forEach(s => s.classList.remove('active')); document.getElementById('g-step-'+step).classList.add('active'); }
function finishGround() { document.querySelectorAll('.ground-step').forEach(s => s.classList.remove('active')); document.getElementById('g-step-done').classList.add('active'); }
function resetGround() { document.getElementById('ground-welcome').style.display = 'block'; document.getElementById('ground-steps').style.display = 'none'; nextGround(1); }

let breathInterval;
function toggleBreathing() { const btn = document.getElementById('breath-btn'), circle = document.querySelector('.breath-circle'), txt = document.getElementById('breath-txt'), results = document.getElementById('breath-results'); if(circle.classList.contains('running')) { circle.classList.remove('running'); btn.innerText = "Start Session"; txt.innerText = "Ready?"; results.style.display = 'block'; clearInterval(breathInterval); } else { circle.classList.add('running'); btn.innerText = "End Session"; results.style.display = 'none'; let state = 0; breathInterval = setInterval(() => { const states = ["Inhale...", "Hold...", "Exhale...", "Hold..."]; txt.innerText = states[state]; state = (state + 1) % 4; }, 2000); } }
function toggleChat() { document.getElementById('chat-interface').style.display = (document.getElementById('chat-interface').style.display==='flex')?'none':'flex'; document.querySelector('.notif-badge').style.display='none'; }
function sendMsg(){ const i=document.getElementById('chat-input'), b=document.getElementById('chat-box'); if(!i.value.trim())return; b.innerHTML+=`<div class="chat-bubble user-msg">${i.value}</div>`; i.value=''; b.scrollTop=b.scrollHeight; setTimeout(()=>{ b.innerHTML+=`<div class="chat-bubble bot-msg">I'm here to assist with finding local resources or mental health tools.</div>`; b.scrollTop=b.scrollHeight; },600); }
function toggleTheme(){ document.body.classList.toggle("contrast"); }
function activateGeo() { const l = document.getElementById('geo-loader'), r = document.getElementById('geo-results'); document.querySelector('.geo-btn').style.display='none'; l.style.display='block'; setTimeout(()=>{ l.style.display='none'; r.style.display='grid'; }, 2000); }
let currentAudio = null;
function toggleSound(type, btn) { document.querySelectorAll('.sound-btn').forEach(b => b.classList.remove('active')); if(currentAudio) { currentAudio.pause(); currentAudio.currentTime = 0; } const newAudio = document.getElementById('audio-' + type); if(currentAudio === newAudio) { currentAudio = null; return; } btn.classList.add('active'); currentAudio = newAudio; currentAudio.play(); }

let selectedMood = '😐';
function selectMood(emoji) { document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected')); event.target.classList.add('selected'); selectedMood = emoji; }
function saveEntry() { let count = parseInt(localStorage.getItem('jCount')||0); const txt = document.getElementById('journal-entry').value; if(!txt) return alert("Please write something first."); count++; localStorage.setItem('jCount', count); document.getElementById('entry-count').innerText = count + " entries"; document.getElementById('journal-entry').value = ""; db.journals.push({ userName: currentUser.name || "Guest", userEmail: currentUser.email, mood: selectedMood, text: txt, date: new Date().toLocaleString() }); saveToDB(); alert("Saved."); }

function downloadReport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const score = parseInt(document.getElementById('result-score').innerText) || 0;
    
    // Determine State and Text based on Score
    let stateText = "", descText = "", stateColor = [], barColor = [];
    
    if(score > 80) {
        stateText = "Optimal Harmony";
        descText = "You are in the 'Green Zone.' Your physiological state is balanced and resilient.";
        stateColor = [16, 185, 129]; // Green
        barColor = [16, 185, 129];
    } else if(score > 50) {
        stateText = "Cognitive Strain";
        descText = "You are in the 'Yellow Zone.' Your brain is utilizing excessive energy to maintain focus.";
        stateColor = [124, 58, 237]; // Purple text
        barColor = [245, 158, 11]; // Yellow/Orange bar
    } else {
        stateText = "Acute Burnout";
        descText = "You are in the 'Red Zone.' Immediate rest is recommended to prevent exhaustion.";
        stateColor = [239, 68, 68]; // Red
        barColor = [239, 68, 68];
    }

    // 1. Header
    doc.setFont("helvetica", "normal");
    doc.setFontSize(24);
    doc.text("PeopleConnect | Wellness Report", 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);
    
    // Line Separator
    doc.setDrawColor(220, 220, 220);
    doc.line(20, 35, 190, 35);

    // 2. Clinical Analysis
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Clinical Analysis", 20, 50);

    // State Text
    doc.setFontSize(14);
    doc.setTextColor(stateColor[0], stateColor[1], stateColor[2]);
    doc.text(`State: ${stateText}`, 20, 60);

    // Description Paragraph
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    const splitDesc = doc.splitTextToSize(descText, 170);
    doc.text(splitDesc, 20, 70);

    // 3. Visualization Bar
    // Background (Light Gray)
    doc.setFillColor(240, 240, 240);
    doc.rect(20, 85, 170, 15, 'F');
    
    // Foreground (Colored based on score)
    doc.setFillColor(barColor[0], barColor[1], barColor[2]);
    // Map score 0-100 to width 0-170
    const barWidth = (score / 100) * 170;
    doc.rect(20, 85, barWidth, 15, 'F');

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Stress Level Visualization", 20, 105);

    // 4. Recovery Protocol
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Recovery Protocol", 20, 125);

    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text("Biological Fix:", 20, 135);
    doc.setFontSize(12);
    doc.text("Immediate Fix: 20 minutes of 'Non-Sleep Deep Rest' (NSDR).", 20, 142);

    doc.text("Neural Protocol:", 20, 155);
    doc.text("Decision Fatigue Protocol: Stop making major choices for 4 hours.", 20, 162);

    doc.save("Wellness_Report.pdf");
}

function downloadAdminReport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("PeopleConnect | System Database", 14, 20);
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);

    doc.text("Registered Users", 14, 40);
    const userRows = db.users.map(u => [u.name, u.email, u.joined]);
    doc.autoTable({
        startY: 45,
        head: [['Name', 'Email', 'Joined']],
        body: userRows,
    });

    let finalY = doc.lastAutoTable.finalY + 15;
    doc.text("Survey History", 14, finalY);
    const surveyRows = db.surveys.map(s => [s.userName, s.date, s.score, s.mood]);
    doc.autoTable({
        startY: finalY + 5,
        head: [['User', 'Date', 'Score', 'Mood']],
        body: surveyRows,
    });
    
    finalY = doc.lastAutoTable.finalY + 15;
    doc.text("Journal Entries", 14, finalY);
    const journalRows = db.journals.map(j => [j.userName, j.date, j.mood, j.text]);
    doc.autoTable({
        startY: finalY + 5,
        head: [['User', 'Date', 'Mood', 'Entry']],
        body: journalRows,
    });

    doc.save("PeopleConnect_Database.pdf");
}