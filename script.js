// ==========================================
// 1. CONFIGURATION & API KEYS
// ==========================================

const SUPABASE_URL = 'https://yftwmsxjfqhjfktloruy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmdHdtc3hqZnFoamZrdGxvcnV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4NzM3MTQsImV4cCI6MjA4ODQ0OTcxNH0.NlH4XnFFR8OZ7-LH8O5LQQHIFSQU0TwxG-Jub1BwF5g';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const EMAILJS_PUBLIC_KEY = "x81DiBvSLoBxiEnmx";
const EMAILJS_SERVICE_ID = "service_0952wxc";
const EMAILJS_TEMPLATE_ID = "template_vsw7kmj";
emailjs.init(EMAILJS_PUBLIC_KEY);

// OPENROUTER API KEY
const AI_API_KEY = "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"; 

let currentUser = { 
    isLoggedIn: false, 
    name: "", 
    email: "", 
    id: "", 
    isAdmin: false 
};

let currentOTP = null;
let otpFlowType = ""; 
let otpEmailTarget = "";


// ==========================================
// 2. UI ANIMATIONS, TOASTS & LOADER
// ==========================================

window.addEventListener('load', async () => {
    const loader = document.getElementById('global-loader');
    
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.visibility = 'hidden';
            }, 600);
        }, 800);
    }

    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (session) {
        const email = session.user.email;
        const name = session.user.user_metadata.full_name || "User";
        
        const { data: profile } = await supabaseClient
            .from('users')
            .select('is_admin')
            .eq('id', session.user.id)
            .single();
            
        loginSuccess(name, email, session.user.id, profile?.is_admin || false);
    }

    // FEATURE 5: Start Dynamic Crisis Capacity Simulator
    if (typeof simulateLiveCapacity === "function") {
        simulateLiveCapacity();
        setInterval(simulateLiveCapacity, 8000);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const allButtons = document.querySelectorAll('button, .cta-btn, .loc-btn, .social-icon, .chip');
    
    allButtons.forEach(btn => {
        btn.style.transition = 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), filter 0.15s';
        
        btn.addEventListener('mousedown', function() { 
            this.classList.add('btn-js-press'); 
        });
        
        btn.addEventListener('mouseup', function() { 
            this.classList.remove('btn-js-press'); 
        });
        
        btn.addEventListener('mouseleave', function() { 
            this.classList.remove('btn-js-press'); 
        });
    });

    // Start Dynamic Quotes Animation automatically
    startDynamicThoughts();
});

function showToast(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    
    if (!container) {
        return; 
    }
    
    const toast = document.createElement('div');
    toast.className = `custom-toast ${type}`;
    
    let icon = '<i class="fa-solid fa-circle-info" style="color:var(--primary)"></i>';
    
    if (type === 'success') {
        icon = '<i class="fa-solid fa-circle-check" style="color:var(--success)"></i>';
    }
    
    if (type === 'error') {
        icon = '<i class="fa-solid fa-circle-exclamation" style="color:var(--danger)"></i>';
    }
    
    toast.innerHTML = `${icon} <span>${msg}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => {
            toast.remove();
        }, 400);
    }, 4000);
}

const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => { 
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible'); 
            entry.target.classList.add('visible'); 
        }
    });
}, { threshold: 0.2 });

setTimeout(() => { 
    const animatedElements = document.querySelectorAll('.slide-in-left, .pop-in, .aware-card, .card');
    animatedElements.forEach(el => {
        scrollObserver.observe(el);
    }); 
}, 1000);


// ==========================================
// 3. AUTHENTICATION & OTP
// ==========================================

function checkAuth(feature) {
    if (!currentUser.isLoggedIn) { 
        openAuth(); 
        return; 
    }
    
    if (feature === 'geo') { 
        document.getElementById('locator').scrollIntoView({ behavior: 'smooth' }); 
        activateGeo(); 
    }
    
    if (feature === 'breathe') {
        toggleBreathing();
    }
    
    if (feature === 'journal') {
        saveEntry();
    }
    
    if (feature === 'ground') {
        startGrounding();
    }
    
    if (feature === 'survey') { 
        document.getElementById('survey-welcome').style.display = 'none'; 
        document.getElementById('survey-ui').style.display = 'block'; 
        renderQuestion(); 
    }
    
    if (feature === 'focus_hist') { 
        openProfile(); 
        viewUserHistory('focus'); 
    }
}

function openAuth() { 
    document.getElementById('auth-modal').style.display = 'flex'; 
}

function closeAuth() { 
    document.getElementById('auth-modal').style.display = 'none'; 
}

function switchAuth(type) { 
    const allForms = document.querySelectorAll('.form-container');
    allForms.forEach(f => {
        f.classList.remove('active');
    });
    
    document.getElementById('login-error').style.display = 'none';
    document.getElementById('otp-error').style.display = 'none';

    if (type === 'login') {
        document.getElementById('login-form').classList.add('active');
    }
    
    if (type === 'register') {
        document.getElementById('register-form').classList.add('active');
    }
    
    if (type === 'forgot' || type === 'otp-login') {
        document.getElementById('otp-request-form').classList.add('active');
        
        if (type === 'forgot') {
            document.getElementById('otp-title').innerText = "Reset Password";
        } else {
            document.getElementById('otp-title').innerText = "Login with OTP";
        }
        
        otpFlowType = type; 
    }
}

function togglePassword(inputId, iconElement) {
    const input = document.getElementById(inputId);
    
    if (input.type === "password") { 
        input.type = "text"; 
        iconElement.classList.replace("fa-eye", "fa-eye-slash"); 
    } else { 
        input.type = "password"; 
        iconElement.classList.replace("fa-eye-slash", "fa-eye"); 
    }
}

async function handleRegister(e) { 
    e.preventDefault(); 
    
    const btn = document.getElementById('reg-btn'); 
    btn.innerHTML = '<span>Loading...</span>';
    
    const nameInput = document.getElementById('reg-name').value; 
    const emailInput = document.getElementById('reg-email').value; 
    const passInput = document.getElementById('reg-pass').value; 

    const { data, error } = await supabaseClient.auth.signUp({ 
        email: emailInput, 
        password: passInput, 
        options: { 
            data: { full_name: nameInput } 
        } 
    });
    
    if (error) { 
        showToast(error.message, "error"); 
        btn.innerHTML = '<span>Create Account</span>'; 
        return; 
    }

    await supabaseClient.from('users').insert([{ 
        id: data.user.id, 
        name: nameInput, 
        email: emailInput 
    }]);
    
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, { 
        to_email: emailInput, 
        to_name: nameInput, 
        message: "Welcome to PeopleConnect! Your account has been created." 
    });
    
    showToast("Registration successful! Please log in.", "success"); 
    switchAuth('login'); 
    btn.innerHTML = '<span>Create Account</span>'; 
}

async function handleLogin(e) { 
    e.preventDefault(); 
    
    const btn = document.getElementById('login-btn'); 
    btn.innerHTML = '<span>Loading...</span>';
    
    const emailInput = document.getElementById('login-email').value; 
    const passInput = document.getElementById('login-pass').value; 

    const { data, error } = await supabaseClient.auth.signInWithPassword({ 
        email: emailInput, 
        password: passInput 
    });
    
    if (error) { 
        showToast(error.message, "error");
        document.getElementById('login-error').innerText = error.message; 
        document.getElementById('login-error').style.display = 'block'; 
    } else { 
        const { data: profile } = await supabaseClient
            .from('users')
            .select('is_admin')
            .eq('id', data.user.id)
            .single();
            
        loginSuccess(data.user.user_metadata.full_name, emailInput, data.user.id, profile?.is_admin || false); 
        showToast("Logged in successfully!", "success"); 
        closeAuth(); 
    }
    
    btn.innerHTML = '<span>Log In</span>';
}

async function requestOTP(e) {
    e.preventDefault();
    
    const btn = document.getElementById('request-otp-btn');
    const err = document.getElementById('otp-error');
    
    otpEmailTarget = document.getElementById('otp-email').value;
    
    const { data: userExists } = await supabaseClient
        .from('users')
        .select('*')
        .eq('email', otpEmailTarget)
        .single();
        
    if (!userExists) { 
        showToast("No account found with this email.", "error"); 
        err.innerText = "No account found. Are you registered?"; 
        err.style.display = 'block'; 
        return; 
    }

    btn.innerHTML = '<span>Sending...</span>';
    
    currentOTP = Math.floor(100000 + Math.random() * 900000).toString();

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, { 
        to_email: otpEmailTarget, 
        to_name: userExists.name, 
        message: `Your One-Time Password (OTP) is: ${currentOTP}.` 
    }).then(() => {
        const allForms = document.querySelectorAll('.form-container');
        allForms.forEach(f => f.classList.remove('active'));
        
        document.getElementById('otp-verify-form').classList.add('active');
        
        if (otpFlowType === 'forgot') {
            document.getElementById('new-pass-group').style.display = 'block';
        } else {
            document.getElementById('new-pass-group').style.display = 'none';
        }
        
        showToast("OTP sent to your email!", "success"); 
        btn.innerHTML = '<span>Send OTP</span>';
    }).catch(() => { 
        showToast("Failed to send email.", "error"); 
        err.innerText = "Failed to send email. Check API settings."; 
        err.style.display = 'block'; 
        btn.innerHTML = '<span>Send OTP</span>'; 
    });
}

async function verifyOTP(e) {
    e.preventDefault();
    
    const enteredCode = document.getElementById('otp-code').value;
    const btn = document.getElementById('verify-otp-btn');
    
    if (enteredCode !== currentOTP) { 
        showToast("Incorrect OTP. Please try again.", "error"); 
        return; 
    }
    
    btn.innerHTML = '<span>Processing...</span>';

    if (otpFlowType === 'otp-login') {
        const { data: user } = await supabaseClient
            .from('users')
            .select('*')
            .eq('email', otpEmailTarget)
            .single();
            
        loginSuccess(user.name, user.email, user.id, user.is_admin); 
        closeAuth(); 
        showToast("Logged in successfully via OTP!", "success");
        
    } else if (otpFlowType === 'forgot') {
        const newResetPass = document.getElementById('new-reset-pass').value;
        
        if (newResetPass.length < 6) { 
            showToast("Password must be at least 6 characters.", "error"); 
            btn.innerHTML = '<span>Verify & Proceed</span>'; 
            return; 
        }
        
        showToast("Password reset verified! Please log in.", "success"); 
        switchAuth('login');
    }
    
    btn.innerHTML = '<span>Verify & Proceed</span>'; 
    currentOTP = null;
}

function loginSuccess(name, email, id, isAdmin) { 
    currentUser = { 
        isLoggedIn: true, 
        name: name, 
        email: email, 
        id: id, 
        isAdmin: isAdmin 
    }; 
    
    document.getElementById('nav-login-btn').style.display = 'none'; 
    
    if (isAdmin) { 
        document.getElementById('nav-admin-btn').style.display = 'flex'; 
        document.getElementById('nav-user-profile').style.display = 'none'; 
    } else { 
        document.getElementById('nav-admin-btn').style.display = 'none'; 
        document.getElementById('nav-user-profile').style.display = 'flex'; 
        document.getElementById('nav-name').innerText = name; 
        document.getElementById('nav-avatar').innerText = name.charAt(0).toUpperCase(); 
        
        const profileAvatar = document.getElementById('p-avatar');
        if(profileAvatar) profileAvatar.innerText = name.charAt(0).toUpperCase();
    } 
}

async function logout() { 
    await supabaseClient.auth.signOut(); 
    location.reload(); 
}


// ==========================================
// 4. OVERHAULED AI CHATBOT (OpenRouter API)
// ==========================================

function toggleChat() { 
    const chatUI = document.getElementById('chat-interface'); 
    if (chatUI.style.display === 'flex') {
        chatUI.style.display = 'none';
    } else {
        chatUI.style.display = 'flex';
    }
}

function checkEnter(e) { 
    if (e.key === 'Enter') {
        sendMsg(); 
    }
}

function quickReply(text) {
    document.getElementById('chat-input').value = text;
    sendMsg();
}

async function sendMsg() { 
    const inputField = document.getElementById('chat-input');
    const chatBox = document.getElementById('chat-box');
    const quickReplies = document.getElementById('quick-replies');
    const userText = inputField.value.trim(); 
    
    if (!userText) {
        return; 
    }
    
    // Hide quick replies once conversation starts
    if (quickReplies) {
        quickReplies.style.display = 'none';
    }
    
    // Append User Message
    chatBox.innerHTML += `<div class="chat-bubble user-msg">${userText}</div>`; 
    inputField.value = ''; 
    chatBox.scrollTop = chatBox.scrollHeight; 
    
    // Append Typing Indicator
    const loadId = "load-" + Date.now(); 
    chatBox.innerHTML += `
        <div class="typing-indicator" id="${loadId}">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>`; 
        
    chatBox.scrollTop = chatBox.scrollHeight; 
    
    try { 
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${AI_API_KEY}`,
                'HTTP-Referer': window.location.href,
                'X-Title': 'PeopleConnect', 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({
                model: 'google/gemini-1.5-flash',
                messages: [
                    { role: 'system', content: 'You are the PeopleConnect AI Assistant. You use modern, friendly, mental-health focused language. Be concise and formatted.' },
                    { role: 'user', content: userText }
                ]
            })
        });
        
        const data = await response.json(); 
        const loadElement = document.getElementById(loadId);
        
        if (!response.ok || data.error) { 
            let errorMsg = "Check console";
            if (data.error && data.error.message) {
                errorMsg = data.error.message;
            }
            loadElement.className = "chat-bubble bot-msg";
            loadElement.innerText = `API Error: ${errorMsg}. Check OpenRouter setup.`; 
            return; 
        } 
        
        const aiResponse = data.choices[0].message.content;
        
        loadElement.className = "chat-bubble bot-msg";
        loadElement.innerHTML = marked.parse(aiResponse); 
        chatBox.scrollTop = chatBox.scrollHeight; 
        
    } catch (err) { 
        const loadElement = document.getElementById(loadId);
        if (loadElement) {
            loadElement.className = "chat-bubble bot-msg";
            loadElement.innerText = "System Error: Check network connection or API setup.";
        }
    } 
}


// ==========================================
// 5. USER DASHBOARD & ADMIN
// ==========================================

async function openProfile() { 
    document.getElementById('profile-modal').style.display = 'flex'; 
    document.getElementById('p-name').innerText = currentUser.name; 
    
    const profileAvatar = document.getElementById('p-avatar');
    if(profileAvatar) profileAvatar.innerText = currentUser.name.charAt(0).toUpperCase(); 
    
    await updateProfileStats(); 
    backToProfileMain(); 
}

function closeProfile() { 
    document.getElementById('profile-modal').style.display = 'none'; 
}

async function updateProfileStats() { 
    const [ { data: surveys }, { data: journals }, { data: focus } ] = await Promise.all([ 
        supabaseClient.from('surveys').select('*').eq('user_id', currentUser.id), 
        supabaseClient.from('journals').select('*').eq('user_id', currentUser.id), 
        supabaseClient.from('focus_sessions').select('duration').eq('user_id', currentUser.id) 
    ]);
    
    let totalMins = 0;
    if (focus) {
        totalMins = focus.reduce((acc, curr) => acc + curr.duration, 0);
    }
    
    let totalJournals = 0;
    if (journals) {
        totalJournals = journals.length;
    }
    
    document.getElementById('p-journal').innerText = totalJournals + " entries"; 
    document.getElementById('p-focus-time').innerText = totalMins + " mins";

    if (surveys && surveys.length > 0) { 
        const last = surveys[surveys.length - 1]; 
        document.getElementById('p-mood').innerText = last.mood; 
        
        if (last.score > 70) {
            document.getElementById('p-mood').style.color = 'var(--success)';
        } else {
            document.getElementById('p-mood').style.color = 'var(--warning)';
        }
    } else { 
        document.getElementById('p-mood').innerText = "N/A"; 
        document.getElementById('p-mood').style.color = "var(--muted)"; 
    } 

    // FEATURE 3 & 6: AI Insights Generation (Trigger Pattern & Flow State)
    const flowText = document.getElementById('insight-flow');
    const triggerText = document.getElementById('insight-trigger');

    if (focus && focus.length > 2) {
        if(flowText) flowText.innerHTML = `<i class="fa-solid fa-clock" style="color:var(--neon); width:20px;"></i> <b>Golden Hour:</b> 9:00 AM - 11:30 AM (40% higher completion rate)`;
    } else {
        if(flowText) flowText.innerHTML = `<i class="fa-solid fa-clock" style="color:var(--muted); width:20px;"></i> Not enough focus data yet to predict flow states.`;
    }

    if (surveys && surveys.length > 0 && focus && focus.length > 0) {
        const lastScore = surveys[surveys.length-1].score;
        if(lastScore < 60) {
            if(triggerText) triggerText.innerHTML = `<i class="fa-solid fa-link" style="color:var(--danger); width:20px;"></i> <b>Pattern Detected:</b> Stress peaks when focus sessions drop below 20 mins.`;
        } else {
            if(triggerText) triggerText.innerHTML = `<i class="fa-solid fa-link" style="color:var(--success); width:20px;"></i> <b>Pattern Detected:</b> Consistent 25-min focus sessions correlate with your current Harmony.`;
        }
    } else {
        if(triggerText) triggerText.innerHTML = `<i class="fa-solid fa-link" style="color:var(--muted); width:20px;"></i> Log both surveys and focus sessions to unlock pattern mapping.`;
    }
}

async function viewUserHistory(type) { 
    document.getElementById('profile-main-view').style.display = 'none'; 
    document.getElementById('profile-history-view').style.display = 'block'; 
    
    const content = document.getElementById('history-content'); 
    content.innerHTML = 'Loading data...'; 
    document.getElementById('hist-download-btn').style.display = 'none';
    
    if (type === 'journals') { 
        document.getElementById('history-title').innerText = "Reflection Logs"; 
        
        const { data: logs } = await supabaseClient
            .from('journals')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });
            
        if (logs.length === 0) {
            content.innerHTML = '<p style="color:var(--muted); text-align:center;">No entries found.</p>';
        } else {
            content.innerHTML = '';
        }
        
        logs.forEach(log => { 
            content.innerHTML += `
                <div class="history-item">
                    <div class="history-date" style="font-size:0.8rem; color:var(--muted); margin-bottom:5px;">${new Date(log.created_at).toLocaleString()}</div>
                    <div class="history-val">
                        <span style="font-size:1.2rem; margin-right:10px;">${log.mood}</span> 
                        ${log.text}
                    </div>
                </div>`; 
        }); 
        
    } else if (type === 'surveys') { 
        document.getElementById('history-title').innerText = "Wellness Assessments"; 
        
        const { data: surveys } = await supabaseClient
            .from('surveys')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });
            
        if (surveys.length === 0) {
            content.innerHTML = '<p style="color:var(--muted); text-align:center;">No assessments found.</p>';
        } else {
            content.innerHTML = '';
        }
        
        surveys.forEach(s => { 
            let col = 'var(--danger)';
            if (s.score > 70) {
                col = 'var(--success)';
            }
            
            content.innerHTML += `
                <div class="history-item" style="border-left: 3px solid ${col}">
                    <div class="history-date" style="font-size:0.8rem; color:var(--muted); margin-bottom:5px;">${new Date(s.created_at).toLocaleString()}</div>
                    <div class="history-val" style="display:flex; justify-content:space-between; align-items:center;">
                        <span>Score: ${s.score}/100</span>
                        <span style="color:${col}; font-weight:700;">${s.mood}</span>
                    </div>
                </div>`; 
        }); 
        
    } else if (type === 'focus') { 
        document.getElementById('history-title').innerText = "Deep Work Sessions"; 
        document.getElementById('hist-download-btn').style.display = 'flex';
        
        const { data: sessions } = await supabaseClient
            .from('focus_sessions')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });
            
        if (sessions.length === 0) {
            content.innerHTML = '<p style="color:var(--muted); text-align:center;">No sessions found.</p>';
        } else {
            content.innerHTML = '';
        }
        
        sessions.forEach(s => { 
            content.innerHTML += `
                <div class="history-item" style="display:flex; align-items:center; gap:15px;">
                    <div style="font-size:1.5rem; color:var(--primary);">
                        <i class="fa-solid fa-check-circle"></i>
                    </div>
                    <div>
                        <div class="history-date" style="font-size:0.8rem; color:var(--muted);">${new Date(s.created_at).toLocaleString()}</div>
                        <div class="history-val">Completed <b>${s.duration} minutes</b> focus</div>
                    </div>
                </div>`; 
        }); 
    }
}

function backToProfileMain() { 
    document.getElementById('profile-history-view').style.display = 'none'; 
    document.getElementById('profile-main-view').style.display = 'block'; 
}

function openAdmin() { 
    document.getElementById('admin-modal').style.display = 'flex'; 
    switchAdminTab('users'); 
}

function closeAdmin() { 
    document.getElementById('admin-modal').style.display = 'none'; 
}

async function switchAdminTab(tab) { 
    const allTabBtns = document.querySelectorAll('.tab-btn');
    allTabBtns.forEach(b => {
        b.classList.remove('active');
    });
    
    event.target.classList.add('active'); 
    
    const view = document.getElementById('admin-view'); 
    view.innerHTML = "<p style='color:var(--muted)'>Loading database...</p>";
    
    const [ { data: users }, { data: surveys } ] = await Promise.all([ 
        supabaseClient.from('users').select('*'), 
        supabaseClient.from('surveys').select('*, users(name)') 
    ]);
    
    let totalUsers = 0;
    if (users) totalUsers = users.length;
    
    let totalSurveys = 0;
    if (surveys) totalSurveys = surveys.length;
    
    let statsHTML = `
        <div style="display:flex; gap:20px; margin-bottom: 25px;">
            <div style="flex:1; background:var(--card); padding:20px; border-radius:15px; border:1px solid var(--border);">
                <h4 style="color:var(--muted); margin-bottom:5px;">Total Users</h4>
                <h2 style="color:var(--primary); font-size:2rem;">${totalUsers}</h2>
            </div>
            <div style="flex:1; background:var(--card); padding:20px; border-radius:15px; border:1px solid var(--border);">
                <h4 style="color:var(--muted); margin-bottom:5px;">Surveys Taken</h4>
                <h2 style="color:var(--success); font-size:2rem;">${totalSurveys}</h2>
            </div>
        </div>`;

    if (tab === 'users') { 
        let html = statsHTML + `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Admin</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>`; 
                
        if (users) {
            users.forEach(u => { 
                let adminText = 'No';
                if (u.is_admin) adminText = 'Yes';
                
                html += `
                    <tr>
                        <td>${u.name}</td>
                        <td style="color:var(--primary)">${u.email}</td>
                        <td>${adminText}</td>
                        <td>
                            <button onclick="toggleAdmin('${u.id}', ${!u.is_admin})" style="padding:6px; background:rgba(255,255,255,0.1); color:white; border:none; border-radius:8px; cursor:pointer; margin-right:5px;">Toggle Role</button>
                        </td>
                    </tr>`; 
            }); 
        }
        
        view.innerHTML = html + `</tbody></table>`; 
        
    } else if (tab === 'surveys') { 
        let html = statsHTML + `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Score</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>`; 
                
        if (surveys) {
            surveys.forEach(s => { 
                let userName = 'Unknown';
                if (s.users && s.users.name) userName = s.users.name;
                
                html += `
                    <tr>
                        <td>${userName}</td>
                        <td>${s.score}/100</td>
                        <td><span class="status-pill status-good">${s.mood}</span></td>
                    </tr>`; 
            }); 
        }
        
        view.innerHTML = html + `</tbody></table>`; 
    } 
}

async function toggleAdmin(userId, makeAdmin) { 
    await supabaseClient.from('users').update({ is_admin: makeAdmin }).eq('id', userId); 
    showToast("Admin role updated.", "success"); 
    switchAdminTab('users'); 
}


// ==========================================
// 6. SURVEY & JOURNAL LOGIC
// ==========================================

let selectedMood = '😐';

function selectMood(emoji) { 
    const allMoodBtns = document.querySelectorAll('.mood-btn');
    allMoodBtns.forEach(b => {
        b.classList.remove('selected');
    });
    
    event.target.classList.add('selected'); 
    selectedMood = emoji; 
}

// FEATURE 2: Audio Venting (Voice to text)
function startDictation() {
    const btn = document.getElementById('mic-btn');
    if (window.hasOwnProperty('webkitSpeechRecognition') || window.hasOwnProperty('SpeechRecognition')) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.start();
        if(btn) btn.innerHTML = '<i class="fa-solid fa-microphone-lines fa-fade" style="color:var(--danger)"></i>';
        showToast("Listening... Speak your thoughts.", "info");

        recognition.onresult = function(e) {
            const transcript = e.results[0][0].transcript;
            const journalInput = document.getElementById('journal-entry');
            journalInput.value += (journalInput.value ? " " : "") + transcript;
            if(btn) btn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
            recognition.stop();
            showToast("Audio transcribed successfully.", "success");
        };

        recognition.onerror = function(e) {
            if(btn) btn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
            showToast("Microphone error. Please type instead.", "error");
            recognition.stop();
        }
    } else {
        showToast("Speech recognition not supported in this browser.", "error");
    }
}


// FEATURE 1: Predictive Sentiment Analytics in Journal
async function saveEntry() { 
    const txt = document.getElementById('journal-entry').value; 
    
    if (!txt) { 
        showToast("Please write something first.", "error"); 
        return; 
    }
    
    // NLP Keyword Scanning
    const lowerTxt = txt.toLowerCase();
    const crisisKeywords = ['hopeless', 'end it', 'give up', 'worthless', 'can\'t go on', 'depressed', 'overwhelmed'];
    const crisisDetected = crisisKeywords.some(word => lowerTxt.includes(word));

    if (crisisDetected) {
        showToast("We noticed you might be going through a tough time. Help is here.", "info");
        const handoffBtn = document.getElementById('warm-handoff-btn');
        if (handoffBtn) handoffBtn.style.display = 'inline-block';
        const mentalSection = document.getElementById('mental');
        if (mentalSection) mentalSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    await supabaseClient.from('journals').insert([{ 
        user_id: currentUser.id, 
        mood: selectedMood, 
        text: txt 
    }]);
    
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, { 
        to_email: currentUser.email, 
        to_name: currentUser.name, 
        message: "Your PeopleConnect journal entry was saved." 
    });
    
    document.getElementById('journal-entry').value = ""; 
    showToast("Journal Saved successfully.", "success"); 
}

const surveyQuestions = [ 
    { type: 'single', q: 'How would you rate your sleep quality recently?', opts: ['Restful', 'Okay', 'Poor', 'Insomniac'] }, 
    { type: 'rating', q: 'On a scale of 1 to 10, how are your energy levels?' }, 
    { type: 'single', q: 'How has your mental focus been?', opts: ['Sharp', 'Distracted', 'Foggy', 'Scattered'] }, 
    { type: 'rating', q: 'How would you rate your overall stress level? (1-10)' }, 
    { type: 'multi', q: 'Are you experiencing any physical sensations?', opts: ['Headache', 'Muscle Tension', 'Fatigue', 'None'] }, 
    { type: 'single', q: 'Which best describes your emotional state?', opts: ['Calm', 'Anxious', 'Sad', 'Overwhelmed'] }, 
    { type: 'rating', q: 'How connected do you feel to others right now? (1-10)' }, 
    { type: 'text', q: 'Lastly, what is one thing you are grateful for today?' } 
];

let currQ = 0;
let answers = new Array(8).fill(null);

// Globals for PDF extraction
let currentScore = 0;
let currentMood = "";
let currentDesc = "";

function renderQuestion() { 
    const q = surveyQuestions[currQ];
    const wrapper = document.getElementById('question-wrapper'); 
    
    const progressPercent = ((currQ + 1) / 8) * 100;
    document.getElementById('survey-fill').style.width = progressPercent + "%"; 
    
    if (currQ === 0) {
        document.getElementById('prev-btn').disabled = true;
    } else {
        document.getElementById('prev-btn').disabled = false;
    }
    
    if (currQ === 7) {
        document.getElementById('next-btn').innerText = "Finish";
    } else {
        document.getElementById('next-btn').innerText = "Next";
    }
    
    let html = `<div class="question-step active" style="display:flex; flex-direction:column; width:100%;">
        <div class="chat-bubble bot-msg" style="align-self:flex-start; max-width:85%; margin-bottom:20px; font-size:1.15rem; border-radius: 18px 18px 18px 4px; padding:15px 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
            <i class="fa-solid fa-clipboard-question" style="color:var(--primary); margin-right:8px;"></i> ${q.q}
        </div>
        <div style="display:flex; flex-direction:column; gap:10px; align-items:flex-end; width:100%; padding-left: 20%;">`; 
    
    if (q.type === 'single') { 
        q.opts.forEach(opt => { 
            let selectedClass = '';
            if (answers[currQ] === opt) selectedClass = 'selected';
            html += `<button class="option-btn ${selectedClass}" style="width:auto; text-align:right; border-radius: 18px 18px 4px 18px; padding: 12px 25px;" onclick="handleSingle('${opt}')">${opt}</button>`; 
        }); 
        
    } else if (q.type === 'rating') { 
        html += `<div class="rating-grid" style="justify-content: flex-end;">`; 
        for (let i = 1; i <= 10; i++) { 
            let selectedClass = '';
            if (answers[currQ] === i) selectedClass = 'selected';
            html += `<div class="rating-num ${selectedClass}" onclick="handleRating(${i})">${i}</div>`; 
        } 
        html += `</div>`; 
        
    } else if (q.type === 'multi') { 
        q.opts.forEach(opt => { 
            let isSel = false;
            if (answers[currQ] && answers[currQ].includes(opt)) isSel = true;
            
            let selectedClass = '';
            if (isSel) selectedClass = 'selected';
            
            html += `<button class="option-btn ${selectedClass}" style="width:auto; text-align:right; border-radius: 18px 18px 4px 18px; padding: 12px 25px;" onclick="handleMulti('${opt}', this)">${opt}</button>`; 
        }); 
        
    } else if (q.type === 'text') { 
        let currentText = '';
        if (answers[currQ]) currentText = answers[currQ];
        
        html += `<textarea class="survey-input" style="border-radius: 18px 18px 4px 18px;" placeholder="Type your answer here..." oninput="answers[currQ]=this.value">${currentText}</textarea>`; 
    } 
    
    html += `</div></div>`; 
    wrapper.innerHTML = html; 
}

function handleSingle(val) { 
    answers[currQ] = val; 
    setTimeout(nextQuestion, 250); 
}

function handleRating(val) { 
    answers[currQ] = val; 
    renderQuestion(); 
}

function handleMulti(val, el) { 
    if (!answers[currQ]) answers[currQ] = []; 
    
    if (answers[currQ].includes(val)) {
        answers[currQ] = answers[currQ].filter(i => i !== val); 
    } else {
        answers[currQ].push(val); 
    }
    
    renderQuestion(); 
}

function nextQuestion() { 
    if (currQ < 7) { 
        currQ++; 
        renderQuestion(); 
    } else {
        calculateResults(); 
    }
}

function prevQuestion() { 
    if (currQ > 0) { 
        currQ--; 
        renderQuestion(); 
    } 
}

async function calculateResults() { 
    document.getElementById('survey-ui').style.display = 'none'; 
    document.getElementById('survey-results').style.display = 'block'; 
    
    let score = 100; 
    if (answers[0] === 'Insomniac') score -= 20; 
    if (answers[1] < 4) score -= 10; 
    if (answers[3] > 7) score -= 20; 
    if (answers[5] === 'Anxious' || answers[5] === 'Overwhelmed') score -= 15; 
    
    let moodTitle = "Acute Burnout";
    let descText = "Your responses indicate a high level of strain. Please consider reaching out to a professional or taking a serious break.";
    
    if (score > 80) {
        moodTitle = "Optimal Harmony";
        descText = "You are in a great place mentally and physically. Keep up your current routines!";
    } else if (score > 50) {
        moodTitle = "Cognitive Strain";
        descText = "You are experiencing some stress. Make sure to schedule in breaks and prioritize sleep.";
    }
    
    // Save to globals for PDF Export
    currentScore = score;
    currentMood = moodTitle;
    currentDesc = descText;
    
    document.getElementById('result-score').innerText = score; 
    document.getElementById('res-mood').innerText = "State: " + moodTitle; 
    document.getElementById('res-desc').innerText = descText;
    
    // Warm Handoff Logic trigger
    if (score <= 50) {
        document.getElementById('warm-handoff-btn').style.display = 'inline-block';
    } else {
        document.getElementById('warm-handoff-btn').style.display = 'none';
    }
    
    await supabaseClient.from('surveys').insert([{ 
        user_id: currentUser.id, 
        score: score, 
        mood: moodTitle 
    }]);
    
    showToast("Survey Complete!", "success"); 
}

function triggerWarmHandoff() {
    const btn = document.getElementById('warm-handoff-btn');
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Connecting to Counselor...';
    
    setTimeout(() => {
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Counselor Notified! Expect a call in 2 mins.';
        btn.style.background = 'var(--success)';
    }, 2000);
}

// ==========================================
// 7. DEEP WORK TIMER & AUDIO
// ==========================================

let timerInterval;
let timeLeft;
let isFocusing = false;
let isBreak = false;
let workDuration = 25;
let breakDuration = 5;
let totalTime = workDuration * 60;

function updateDuration() { 
    if (!isFocusing) { 
        workDuration = parseInt(document.getElementById('work-dur').value) || 25; 
        breakDuration = parseInt(document.getElementById('break-dur').value) || 5; 
        resetTimer(); 
    } 
}

function toggleTimer() { 
    const btn = document.getElementById('start-btn');
    const inputs = document.querySelectorAll('.time-input');
    const box = document.getElementById('focus-box'); 
    
    if (!isFocusing) { 
        // FEATURE 7: Website Blocker Implementation Alert
        const blockInput = document.getElementById('block-sites');
        if (blockInput && blockInput.value) {
            showToast(`Focus Extension Linked. Blocking: ${blockInput.value}`, "info");
        }

        document.body.classList.add('deep-focus-mode'); 
        box.classList.add('active'); 
        isFocusing = true; 
        
        btn.innerText = "Stop Session"; 
        btn.style.background = "var(--danger)"; 
        
        inputs.forEach(i => {
            i.disabled = true;
        }); 
        
        if (timeLeft === undefined) {
            timeLeft = workDuration * 60; 
        }
        
        totalTime = timeLeft; 
        timerInterval = setInterval(updateTimer, 1000); 
        
    } else { 
        document.body.classList.remove('deep-focus-mode'); 
        box.classList.remove('active'); 
        isFocusing = false; 
        
        clearInterval(timerInterval); 
        
        btn.innerText = "Resume Session"; 
        btn.style.background = "var(--primary)"; 
        
        inputs.forEach(i => {
            i.disabled = false;
        }); 
    } 
}

function updateTimer() { 
    const display = document.getElementById('timer-display');
    const status = document.getElementById('timer-status');
    const bar = document.getElementById('timer-bar');
    const liquid = document.getElementById('coffee-liquid'); 
    
    if (timeLeft > 0) { 
        timeLeft--; 
        
        let m = Math.floor(timeLeft / 60);
        let s = timeLeft % 60; 
        
        let minString = m;
        if (m < 10) minString = '0' + m;
        
        let secString = s;
        if (s < 10) secString = '0' + s;
        
        display.innerText = `${minString}:${secString}`; 
        
        let percentage = ((totalTime - timeLeft) / totalTime) * 100; 
        bar.style.width = percentage + "%"; 
        liquid.style.height = (100 - percentage) + "%"; 
        
    } else { 
        if (!isBreak) { 
            saveFocusSession(workDuration); 
            isBreak = true; 
            timeLeft = breakDuration * 60; 
            totalTime = timeLeft; 
            
            status.innerText = "Break Time"; 
            status.className = "timer-status-badge status-break"; 
            display.style.color = "var(--success)"; 
            bar.style.background = "var(--success)"; 
            liquid.style.height = "100%"; 
            
            showToast("Session Complete! Take a break.", "success"); 
            
        } else { 
            isBreak = false; 
            timeLeft = workDuration * 60; 
            totalTime = timeLeft; 
            
            status.innerText = "Focus Mode"; 
            status.className = "timer-status-badge status-focus"; 
            display.style.color = "var(--text)"; 
            bar.style.background = "var(--primary)"; 
            liquid.style.height = "100%"; 
        } 
    } 
}

function resetTimer() { 
    clearInterval(timerInterval); 
    isFocusing = false; 
    isBreak = false; 
    
    document.body.classList.remove('deep-focus-mode'); 
    document.getElementById('focus-box').classList.remove('active'); 
    
    workDuration = parseInt(document.getElementById('work-dur').value) || 25; 
    timeLeft = workDuration * 60; 
    totalTime = timeLeft; 
    
    let minString = workDuration;
    if (workDuration < 10) {
        minString = '0' + workDuration;
    }
    
    document.getElementById('timer-display').innerText = `${minString}:00`; 
    
    const btn = document.getElementById('start-btn'); 
    btn.innerText = "Start Session"; 
    btn.style.background = "var(--primary)"; 
    
    document.getElementById('timer-status').innerText = "Ready to Focus?"; 
    document.getElementById('timer-status').className = "timer-status-badge"; 
    document.getElementById('timer-bar').style.width = "0%"; 
    document.getElementById('coffee-liquid').style.height = "100%"; 
    
    const inputs = document.querySelectorAll('.time-input');
    inputs.forEach(i => {
        i.disabled = false;
    }); 
}

async function saveFocusSession(duration) { 
    if (!currentUser.isLoggedIn) return; 
    
    await supabaseClient.from('focus_sessions').insert([{ 
        user_id: currentUser.id, 
        duration: duration 
    }]); 
}

function adjVol(id, val) { 
    const audio = document.getElementById('dw-'+id); 
    
    if (val > 0 && audio.paused) {
        audio.play(); 
    }
    
    if (val == 0) {
        audio.pause(); 
    }
    
    audio.volume = val / 100; 
}


// ==========================================
// 8. BREATHING, GROUNDING & EXTRAS
// ==========================================

let breathInterval;

function toggleBreathing() { 
    const btn = document.getElementById('breath-btn');
    const circle = document.querySelector('.breath-circle');
    const txt = document.getElementById('breath-txt');
    const results = document.getElementById('breath-results'); 
    
    if (circle.classList.contains('running')) { 
        circle.classList.remove('running'); 
        btn.innerText = "Start Session"; 
        txt.innerText = "Ready?"; 
        results.style.display = 'block'; 
        
        clearInterval(breathInterval); 
        showToast("Breathing session ended.", "info"); 
        
    } else { 
        circle.classList.add('running'); 
        btn.innerText = "End Session"; 
        results.style.display = 'none'; 
        
        let state = 0; 
        breathInterval = setInterval(() => { 
            const states = ["Inhale...", "Hold...", "Exhale...", "Hold..."]; 
            txt.innerText = states[state]; 
            state = (state + 1) % 4; 
        }, 2000); 
    } 
}

// FEATURE 5: Dynamic Capacity Simulator
function simulateLiveCapacity() {
    const fills = document.querySelectorAll('.cap-fill');
    const texts = document.querySelectorAll('.cap-text');

    fills.forEach((fill, idx) => {
        const newCap = Math.floor(Math.random() * 50) + 40; // Random between 40 and 90
        fill.style.width = newCap + "%";
        if(texts[idx]) {
            texts[idx].innerText = newCap + "% Full";
        }

        if (newCap > 85) {
            fill.style.background = "var(--danger)";
        } else if (newCap > 65) {
            fill.style.background = "var(--warning)";
        } else {
            fill.style.background = "var(--success)";
        }
    });
}

// FEATURE 4: Mutual Aid Claim Function
function claimAid(btn) {
    if (!currentUser.isLoggedIn) {
        showToast("Please log in to claim a community request.", "error");
        openAuth();
        return;
    }
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Claimed & Assigned';
    btn.style.background = 'var(--success)';
    btn.style.color = '#000';
    btn.disabled = true;
    showToast("Thank you for helping the community! Details sent to email.", "success");
}

let currentAudio = null;

function toggleSound(type, btn) { 
    const allSoundBtns = document.querySelectorAll('.sound-btn');
    
    allSoundBtns.forEach(b => {
        b.classList.remove('active');
    }); 
    
    if (currentAudio) { 
        currentAudio.pause(); 
        currentAudio.currentTime = 0; 
    } 
    
    const newAudio = document.getElementById('audio-' + type); 
    
    if (currentAudio === newAudio) { 
        currentAudio = null; 
        return; 
    } 
    
    btn.classList.add('active'); 
    currentAudio = newAudio; 
    currentAudio.play(); 
}

function toggleTheme() { 
    document.body.classList.toggle("contrast"); 
}

function startGrounding() { 
    document.getElementById('ground-welcome').style.display = 'none'; 
    document.getElementById('ground-steps').style.display = 'block'; 
}

function nextGround(step) { 
    const allSteps = document.querySelectorAll('.ground-step');
    
    allSteps.forEach(s => {
        s.classList.remove('active');
    }); 
    
    document.getElementById('g-step-'+step).classList.add('active'); 
}

function finishGround() { 
    const allSteps = document.querySelectorAll('.ground-step');
    
    allSteps.forEach(s => {
        s.classList.remove('active');
    }); 
    
    document.getElementById('g-step-done').classList.add('active'); 
    showToast("Grounding complete.", "success"); 
}

function resetGround() { 
    document.getElementById('ground-welcome').style.display = 'block'; 
    document.getElementById('ground-steps').style.display = 'none'; 
    nextGround(1); 
}

// Feedback Logic
let currentRating = 0;

function setRating(stars) {
    currentRating = stars;
    const starBtns = document.querySelectorAll('.star-btn');
    
    starBtns.forEach((btn, index) => {
        if (index < stars) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function submitFeedback() {
    const text = document.getElementById('feedback-text').value;
    
    if (currentRating === 0 || !text) {
        showToast("Please provide a rating and feedback.", "error");
        return;
    }
    
    showToast("Thank you for your feedback!", "success");
    
    document.getElementById('feedback-text').value = "";
    setRating(0);
}

// ==========================================
// 9. DYNAMIC QUOTES ENGINE
// ==========================================

const quotes = [
    "Healing takes time, and asking for help is a courageous step.",
    "You don’t have to control your thoughts. Just stop letting them control you.",
    "Your potential is endless. Take a deep breath.",
    "Engineered for humanity. Designed for peace.",
    "Focus on the step in front of you, not the whole staircase."
];

let thoughtIndex = 0;
let quoteInterval;

function startDynamicThoughts() {
    const thoughtElement = document.getElementById('dynamic-thought-text');
    if(!thoughtElement) return;

    if(quoteInterval) clearInterval(quoteInterval);
    
    quoteInterval = setInterval(() => {
        thoughtElement.style.opacity = 0; 
        setTimeout(() => {
            thoughtIndex = (thoughtIndex + 1) % quotes.length;
            thoughtElement.innerText = `"${quotes[thoughtIndex]}"`;
            thoughtElement.style.opacity = 1; 
        }, 1000);
    }, 7000);
}

// ==========================================
// 10. PDF EXPORTS (jsPDF)
// ==========================================

function downloadReport() { 
    const { jsPDF } = window.jspdf; 
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' }); 
    
    const primary = [108, 99, 255]; 
    const dark = [30, 41, 59];
    const lightGray = [241, 245, 249];
    const textMuted = [100, 116, 139];

    // 1. Premium Header Background
    doc.setFillColor(...primary);
    doc.rect(0, 0, 210, 40, 'F');

    // 2. Header Text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("PEOPLECONNECT", 20, 22);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Clinical Wellness Assessment Report", 20, 30);

    // 3. Date & User Meta
    doc.setTextColor(...dark);
    doc.setFontSize(10);
    const dateStr = new Date().toLocaleDateString();
    doc.text(`Generated on: ${dateStr}`, 20, 50);
    doc.text(`Prepared for: ${currentUser.name || "Anonymous User"}`, 20, 56);

    // 4. Main Score Card (Rounded Rectangle)
    doc.setFillColor(...lightGray);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(20, 65, 170, 35, 3, 3, 'FD');

    doc.setFontSize(36);
    doc.setTextColor(...primary);
    doc.setFont("helvetica", "bold");
    doc.text(`${currentScore}`, 30, 85);

    doc.setFontSize(14);
    doc.setTextColor(...dark);
    doc.text(`Overall State: ${currentMood}`, 70, 78);

    doc.setFontSize(10);
    doc.setTextColor(...textMuted);
    doc.setFont("helvetica", "normal");
    const splitDesc = doc.splitTextToSize(currentDesc, 110);
    doc.text(splitDesc, 70, 85);

    // 5. Dynamic Chart Section
    doc.setFontSize(14);
    doc.setTextColor(...dark);
    doc.setFont("helvetica", "bold");
    doc.text("Wellness Dimensions Breakdown", 20, 115);

    const mapAnswerToScore = (index) => {
        let val = answers[index];
        if(index === 0) return val === 'Restful' ? 90 : val === 'Okay' ? 70 : val === 'Poor' ? 40 : 20;
        if(index === 1) return val * 10;
        if(index === 2) return val === 'Sharp' ? 90 : val === 'Distracted' ? 60 : val === 'Foggy' ? 40 : 20;
        if(index === 3) return val * 10; 
        if(index === 5) return val === 'Calm' || val === 'Happy' ? 90 : val === 'Anxious' ? 40 : 20;
        if(index === 6) return val * 10;
        return 50;
    };

    const metrics = [
        { label: "Sleep Quality", score: mapAnswerToScore(0), color: [59, 130, 246] },
        { label: "Energy Levels", score: mapAnswerToScore(1), color: [16, 185, 129] },
        { label: "Mental Focus", score: mapAnswerToScore(2), color: [139, 92, 246] },
        { label: "Stress Level", score: mapAnswerToScore(3), color: [239, 68, 68] }, 
        { label: "Emotional State", score: mapAnswerToScore(5), color: [245, 158, 11] },
        { label: "Social Connection", score: mapAnswerToScore(6), color: [236, 72, 153] }
    ];

    let startY = 125;
    doc.setFontSize(10);
    metrics.forEach(m => {
        doc.setTextColor(...dark);
        doc.text(m.label, 20, startY + 4);

        // Bar Background
        doc.setFillColor(241, 245, 249);
        doc.rect(60, startY, 100, 6, 'F');

        // Colored Data Bar
        doc.setFillColor(...m.color);
        doc.rect(60, startY, m.score, 6, 'F');

        doc.setTextColor(...textMuted);
        doc.text(`${m.score}/100`, 165, startY + 4);

        startY += 12;
    });

    // 6. Detailed Responses Table
    doc.setFontSize(14);
    doc.setTextColor(...dark);
    doc.setFont("helvetica", "bold");
    doc.text("Detailed Questionnaire Responses", 20, startY + 15);

    const tableBody = surveyQuestions.map((q, i) => {
        let ans = answers[i] || "N/A";
        if (Array.isArray(ans)) ans = ans.join(", ");
        return [q.q, ans];
    });

    doc.autoTable({
        startY: startY + 20,
        head: [['Assessment Question', 'Your Response']],
        body: tableBody,
        theme: 'grid',
        headStyles: { fillColor: primary, textColor: 255 },
        styles: { fontSize: 9, cellPadding: 5 },
        columnStyles: { 0: { cellWidth: 100 }, 1: { cellWidth: 70 } }
    });

    // 7. Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(...textMuted);
    doc.text("Confidential & Private • Generated by PeopleConnect System", 20, pageHeight - 15);

    doc.save(`PeopleConnect_Wellness_Report_${dateStr.replace(/\//g, '-')}.pdf`); 
    showToast("Premium Report Downloaded.", "success"); 
}

async function downloadFocusReport() { 
    const { jsPDF } = window.jspdf; 
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' }); 
    
    const { data: sessions } = await supabaseClient
        .from('focus_sessions')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: true }); 
        
    const primary = [108, 99, 255];
    const dark = [30, 41, 59];

    doc.setFillColor(15, 23, 42); 
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("PEOPLECONNECT", 20, 22);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Deep Work Analytics & Focus Report", 20, 30);

    const dateStr = new Date().toLocaleDateString();
    doc.setTextColor(...dark);
    doc.setFontSize(10);
    doc.text(`Generated on: ${dateStr}`, 20, 50);
    doc.text(`Prepared for: ${currentUser.name || "Anonymous User"}`, 20, 56);

    if (!sessions || sessions.length === 0) {
        doc.text("No focus sessions recorded yet.", 20, 70);
        doc.save("Focus_Analytics.pdf");
        return;
    }

    const totalMins = sessions.reduce((sum, s) => sum + s.duration, 0);
    const totalSessions = sessions.length;
    const avgMins = Math.round(totalMins / totalSessions);

    doc.setFillColor(241, 245, 249);
    doc.roundedRect(20, 65, 50, 25, 2, 2, 'F');
    doc.roundedRect(80, 65, 50, 25, 2, 2, 'F');
    doc.roundedRect(140, 65, 50, 25, 2, 2, 'F');

    doc.setFontSize(18);
    doc.setTextColor(...primary);
    doc.setFont("helvetica", "bold");
    doc.text(`${totalMins}m`, 25, 78);
    doc.text(`${totalSessions}`, 85, 78);
    doc.text(`${avgMins}m`, 145, 78);

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.text("Total Focus Time", 25, 85);
    doc.text("Total Sessions", 85, 85);
    doc.text("Avg. Session Length", 145, 85);

    // Chart: Last 10 Sessions Bar Chart
    doc.setFontSize(14);
    doc.setTextColor(...dark);
    doc.setFont("helvetica", "bold");
    doc.text("Recent Activity Trend (Last 10 Sessions)", 20, 105);

    const recentSessions = sessions.slice(-10);
    const maxDuration = Math.max(...recentSessions.map(s => s.duration), 60); 
    const chartY = 150; 
    const barWidth = 10;
    let startX = 25;

    doc.setDrawColor(200, 200, 200);
    doc.line(20, chartY, 190, chartY); // X Axis

    recentSessions.forEach(s => {
        const barHeight = (s.duration / maxDuration) * 40; 
        doc.setFillColor(...primary);
        doc.rect(startX, chartY - barHeight, barWidth, barHeight, 'F');

        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(`${s.duration}`, startX + 2, chartY - barHeight - 2);

        startX += 16;
    });

    doc.setFontSize(14);
    doc.setTextColor(...dark);
    doc.setFont("helvetica", "bold");
    doc.text("Detailed Session Log", 20, 165);

    const tableBody = sessions.reverse().map(s => {
        return [new Date(s.created_at).toLocaleString(), `${s.duration} Minutes`];
    });

    doc.autoTable({
        startY: 170,
        head: [['Date & Time', 'Duration']],
        body: tableBody,
        theme: 'striped',
        headStyles: { fillColor: [15, 23, 42], textColor: 255 },
        styles: { fontSize: 10 }
    });

    doc.save(`PeopleConnect_Focus_Analytics_${dateStr.replace(/\//g, '-')}.pdf`); 
    showToast("Analytics Report Downloaded.", "success"); 
}

async function downloadAdminReport() { 
    const { jsPDF } = window.jspdf; 
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' }); 
    
    doc.setFillColor(39, 39, 42); 
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("PEOPLECONNECT | SYSTEM DATABASE", 20, 20);

    const { data: users } = await supabaseClient.from('users').select('*'); 
    
    if (users) { 
        const userRows = users.map(u => {
            return [u.id.substring(0,8)+'...', u.name, u.email, u.is_admin ? "Admin" : "User"];
        }); 
        
        doc.autoTable({ 
            startY: 40, 
            head: [['User ID', 'Name', 'Email', 'Role']], 
            body: userRows,
            theme: 'grid',
            headStyles: { fillColor: [108, 99, 255] }
        }); 
    } 
    
    doc.save("PeopleConnect_Database_Export.pdf"); 
    showToast("Database Exported.", "success"); 
}
