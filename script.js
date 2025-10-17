/* --------------
  script.js
  - Uses existing DOM IDs from your pages
  - Handles profile saving (localStorage), role logic, job posting restrictions,
    job seeker listing, products, simple AI placeholder.
  -------------- */

/* helper: safe getElement */
const $ = id => document.getElementById(id);

/* ---------------- PROFILE & ALLPROFILES ---------------- */
const profileForm = $('profileForm');
const profileImage = $('profileImage');
const uploadProfilePic = $('uploadProfilePic');
const profilePreview = $('profilePreview');

function loadSavedProfileUI() {
  const saved = JSON.parse(localStorage.getItem('userProfile'));
  if (!saved) return;
  if ($('profileName')) $('profileName').value = saved.name || '';
  if ($('profileRole')) $('profileRole').value = saved.role || '';
  if ($('profileLocation')) $('profileLocation').value = saved.location || '';
  if ($('profileBio')) $('profileBio').value = saved.bio || '';
  if ($('profileEmail')) $('profileEmail').value = saved.email || '';
  if ($('profileHobby')) $('profileHobby').value = saved.hobby || '';
  if (profileImage) profileImage.src = saved.image || profileImage.src;

  if ($('previewImage')) $('previewImage').src = saved.image || '';
  if ($('previewName')) $('previewName').innerText = saved.name || '';
  if ($('previewRole')) $('previewRole').innerText = saved.role || '';
  if ($('previewLocation')) $('previewLocation').innerText = saved.location || '';
  if ($('previewBio')) $('previewBio').innerText = saved.bio || '';
  if ($('profileEmail')) $('profileEmail').innerText = saved.email || '';
  if (profilePreview) profilePreview.style.display = 'block';
}

// handle upload preview
if (uploadProfilePic) {
  uploadProfilePic.addEventListener('change', (ev) => {
    const f = ev.target.files && ev.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => { if (profileImage) profileImage.src = r.result; };
    r.readAsDataURL(f);
  });
}

// save profile and update allProfiles
if (profileForm) {
  profileForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const profileData = {
      image: profileImage ? profileImage.src : '',
      name: $('profileName') ? $('profileName').value.trim() : '',
      role: $('profileRole') ? $('profileRole').value : '',
      location: $('profileLocation') ? $('profileLocation').value : '',
      bio: $('profileBio') ? $('profileBio').value : '',
      email: $('profileEmail') ? $('profileEmail').value.trim() : '',
      hobby: $('profileHobby') ? $('profileHobby').value.trim() : ''
    };

    localStorage.setItem('userProfile', JSON.stringify(profileData));

    let all = JSON.parse(localStorage.getItem('allProfiles')) || [];
    all = all.filter(p => p.name !== profileData.name);
    all.push(profileData);
    localStorage.setItem('allProfiles', JSON.stringify(all));

    loadSavedProfileUI();
    checkJobFormAccess();
    displayJobSeekers();      // ✅ make sure this exists
    updateSidebar();

    alert('Profile saved.');
  });
}
// 🔄 Live update Suggested Candidates everywhere
window.addEventListener('storage', (e) => {
  if (e.key === 'allProfiles' || e.key === 'userProfile') {
    displayJobSeekers();
  }
});



// edit profile button behavior
if ($('editProfileBtn')) {
  $('editProfileBtn').addEventListener('click', () => {
    if ($('profileSection')) $('profileSection').scrollIntoView({behavior:'smooth'});
    if (profilePreview) profilePreview.style.display = 'none';
  });
}

/* ---------------- JOB SEEKERS (Suggested Candidates) ---------------- */
function displayJobSeekers() {
  const target = $('suggestedCandidates') || $('candidateList') || $('candidateListSidebar');
  if (!target) return;

  target.innerHTML = '';
  const allProfiles = JSON.parse(localStorage.getItem('allProfiles')) || [];

  // only Job Seekers
  const jobSeekers = allProfiles.filter(p => p.role === 'Job Seeker');

  if (jobSeekers.length === 0) {
    target.innerHTML = '<li>No job seekers registered yet.</li>';
    return;
  }

  jobSeekers.forEach(js => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${js.name}</strong> | ${js.location} <br>
      <em>Talent/Hobby:</em> ${js.hobby || '—'}
      <button onclick="messageJobSeeker('${js.email}', '${js.name}')" class="mini">Message</button>
    `;
    target.appendChild(li);
  });
}

function messageCandidate(name) {
  alert(`Open chat / contact flow with ${name} (implement later).`);
}

/* ---------------- JOB POSTING & DISPLAY ---------------- */
let jobsLocal = JSON.parse(localStorage.getItem('jobs')) || [];

// hide/show form based on role
function checkJobFormAccess() {
  const saved = JSON.parse(localStorage.getItem('userProfile'));
  const cont = $('jobFormContainer');
  const msg = $('jobFormMessage');
  if (!cont || !msg) return;
  if (!saved || saved.role !== 'Shop Owner') {
    cont.style.display = 'none';
    msg.style.display = 'block';
  } else {
    cont.style.display = 'block';
    msg.style.display = 'none';
  }
}

// handle job posting with guard
if ($('jobForm')) {
  $('jobForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const current = JSON.parse(localStorage.getItem('userProfile'));
    if (!current || current.role !== 'Shop Owner') {
      alert('Only Shop Owners can post jobs.');
      return;
    }
    const job = {
      id: Date.now(),
      title: $('jobTitle').value.trim(),
      description: $('jobDescription').value.trim(),
      skills: $('jobSkills') ? $('jobSkills').value.split(',').map(s=>s.trim()).filter(Boolean) : [],
      salary: $('salary') ? $('salary').value : '',
      location: $('jobLocation') ? $('jobLocation').value.trim() : '',
      ownerEmail: current.email || '' // <--- store shop owner email
    };
    if (!current.email) {
  alert('Please add your email in profile before posting a job.');
  return;
  }

    jobsLocal.push(job);
    localStorage.setItem('jobs', JSON.stringify(jobsLocal));
    alert('Job posted.');
    if ($('jobForm')) $('jobForm').reset();
    displayJobs(); // refresh job list if on find-jobs page
    updateSidebar();
  });
}

function displayJobs(filter = {}) {
  // if on find-jobs.html jobResults container exists
  const jobsResults = $('jobsResults') || $('jobsContainer');
  if (!jobsResults) return;
  jobsResults.innerHTML = '';

  const saved = JSON.parse(localStorage.getItem('jobs')) || jobsLocal;

  const list = saved.filter(j => {
    if (filter.q && filter.q.length) {
      const q = filter.q.toLowerCase();
      if (!(j.title && j.title.toLowerCase().includes(q)) &&
          !(j.description && j.description.toLowerCase().includes(q)) ) return false;
    }
    if (filter.location && filter.location.length) {
      if (!(j.location && j.location.toLowerCase().includes(filter.location.toLowerCase()))) return false;
    }
    return true;
  });

  if (list.length === 0) {
    jobsResults.innerHTML = '<p style="color:#666">No jobs found.</p>';
    return;
  }

  list.forEach(j => {
    const el = document.createElement('div');
    el.className = 'job-item';
    el.innerHTML = `<strong>${j.title}</strong> — ${j.location} • ₹${j.salary || '—'} <div style="margin-top:6px; color:#444">${j.description}</div>`;
    el.addEventListener('click', ()=> showJobDetail(j));
    jobsResults.appendChild(el);
  });
}

function showJobDetail(job) {
  const panel = $('jobDetailPanel');
  if (!panel) return;
  panel.innerHTML = `
    <h4>${job.title}</h4>
    <p><b>Location:</b> ${job.location} &nbsp; <b>Salary:</b> ₹${job.salary || '—'}</p>
    <p><b>Skills:</b> ${job.skills && job.skills.length ? job.skills.join(', ') : '—'}</p>
    <p>${job.description}</p>
    <button onclick="applyForJob('${job.id}')">Apply / Message</button>
  `;
}

function applyForJob(id) {
  const job = jobsLocal.find(j => j.id == id);
  const seeker = JSON.parse(localStorage.getItem('userProfile'));
  
  if (!seeker || seeker.role !== 'Job Seeker') {
    alert('Only Job Seekers can apply. Set role to Job Seeker.');
    return;
  }
  
  if (!job.ownerEmail) {
    alert('Shop Owner has not provided email.');
    return;
  }

  

  const subject = encodeURIComponent(`Job Application: ${job.title}`);
  const body = encodeURIComponent(`Hello,\n\nI am ${seeker.name}, interested in your job "${job.title}".\nPlease contact me.\n\nRegards,\n${seeker.name}`);
  
  // Opens Gmail / default mail client
  window.location.href = `mailto:${job.ownerEmail}?subject=${subject}&body=${body}`;
}


/* ---------------- PRODUCTS ---------------- */
function renderProducts() {
  const grid = $('productGrid') || $('productList') || $('homeTrendingProducts');
  if (!grid) return;

  // if productGrid exists treat as grid, otherwise lists
  if (grid.id === 'productGrid') {
    grid.innerHTML = '';
    (products || []).forEach((p, i) => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `<strong>${p.name}</strong>
        <div>₹${p.price}</div>
        <div>${p.category} • ${p.location}</div>
        <button onclick="buyProduct(${i})">Buy</button>`;
      grid.appendChild(card);
    });
  } else {
    grid.innerHTML = '';
    (products || []).slice(0,5).forEach(p => {
      const li = document.createElement('li');
      li.textContent = `${p.name} | ₹${p.price} | ${p.category}`;
      grid.appendChild(li);
    });
  }
}

function buyProduct(index) {
  const p = products[index];
  alert(`You want to buy "${p.name}" for ₹${p.price}. Contact seller at ${p.location}.`);
}

/* ---------------- SIDEBAR & HOME TRENDS ---------------- */
function updateSidebar() {
  // trendingProducts lists
  const tNodes = document.querySelectorAll('#trendingProducts, #homeTrendingProducts');
  tNodes.forEach(node => {
    if (!node) return;
    node.innerHTML = '';
    (products || []).slice(0,5).forEach(p => {
      const li = document.createElement('li');
      li.innerHTML = `${p.name} • ₹${p.price} <button onclick="buyProduct(${products.indexOf(p)})" class="mini">Buy</button>`;
      node.appendChild(li);
    });
  });

  // suggestedCandidates on right
  displayJobSeekers();
}

/* ---------------- AI ASSISTANT (placeholder) ---------------- */
if ($('askBtn')) {
  $('askBtn').addEventListener('click', () => {
    const q = $('userQuestion').value || '';
    const out = $('chatResponse');
    if (!out) return;
    if (!q) { out.innerText = 'Ask something about jobs or products.'; return; }
    // simple rule-based answers
    if (q.toLowerCase().includes('salary')) out.innerText = 'Salaries vary by skill and location. Try searching jobs in your city.';
    else if (q.toLowerCase().includes('sell')) out.innerText = 'List product in Products section; add good photos and description.';
    else out.innerText = 'Sahayak: I am learning. Try: "Find delivery jobs in Gangtok"';
  });
}

/* ---------------- INIT on page load ---------------- */
window.addEventListener('DOMContentLoaded', () => {
  loadSavedProfileUI();
  checkJobFormAccess();
  displayJobSeekers();
  renderProducts();
  updateSidebar();
  displayJobs(); // populate jobs results if on jobs page
});

function messageJobSeeker(email, name) {
  if (!email) {
    alert('This job seeker has not provided an email.');
    return;
  }

  const sender = JSON.parse(localStorage.getItem('userProfile'));
  if (!sender || sender.role !== 'Shop Owner') {
    alert('Only Shop Owners can message job seekers.');
    return;
  }

  const subject = encodeURIComponent(`Opportunity for ${name}`);
  const body = encodeURIComponent(`Hello ${name},\n\nI saw your talent/hobby and am interested.\nPlease contact me.\n\nRegards,\n${sender.name}`);

  window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
}
