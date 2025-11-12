document.addEventListener('DOMContentLoaded', () => {

    // =================================================================
    // ========== FIREBASE CONFIGURATION ===============================
    // =================================================================
    const firebaseConfig = {
  apiKey: "AIzaSyDO9WZq_pEf8UUoV8YQmXDsb6eths1ZSlY",
  authDomain: "ocxprofile.firebaseapp.com",
  projectId: "ocxprofile",
  storageBucket: "ocxprofile.firebasestorage.app",
  messagingSenderId: "1056463543851",
  appId: "1:1056463543851:web:4b0eef8cfa3c5bcf25546e",
  measurementId: "G-5946FF6TWD"
};
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();

    // =================================================================
    // ========== ELEMENT SELECTIONS ===================================
    // =================================================================
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    const authForm = document.getElementById('auth-form');
    const authEmailInput = document.getElementById('auth-email');
    const passwordGroup = document.getElementById('password-group');
    const authPasswordInput = document.getElementById('auth-password');
    const confirmPasswordGroup = document.getElementById('confirm-password-group');
    const authConfirmPasswordInput = document.getElementById('auth-confirm-password');
    const togglePasswordVisibility = document.getElementById('toggle-password-visibility');
    const authError = document.getElementById('auth-error');
    const authSuccess = document.getElementById('auth-success');
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const resetPasswordBtn = document.getElementById('reset-password-btn');
    const authToggleLink = document.querySelector('.auth-toggle-link');
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    const backToLoginLink = document.querySelector('.back-to-login-link');
    const authTitle = document.getElementById('auth-title');
    const passwordPolicyBox = document.getElementById('password-policy');
    const policyLength = document.getElementById('policy-length');
    const policyLowercase = document.getElementById('policy-lowercase');
    const policyUppercase = document.getElementById('policy-uppercase');
    const policyNumber = document.getElementById('policy-number');
    const sidebarUserEmail = document.getElementById('sidebar-user-email');
    const logoutBtn = document.getElementById('logout-btn');
    const characterContainer = document.getElementById('character-container');
    const addCharBtn = document.getElementById('add-char-btn');
    const toggleEditBtn = document.getElementById('toggle-edit-btn');
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const langSwitchWrapper = document.getElementById('lang-switch-wrapper');
    const langIndicator = document.getElementById('lang-indicator');
    
    const addModal = document.getElementById('add-char-modal');
    const modalTitle = document.getElementById('modal-title');
    const addCharForm = document.getElementById('add-char-form');
    const customFieldsContainer = document.getElementById('custom-fields-container');
    const addFieldBtn = document.getElementById('add-field-btn');
    const tabButtons = addModal.querySelector('.modal-tabs');
    const tabContents = addModal.querySelectorAll('.tab-content');
    const imagePreviewBox = document.getElementById('image-preview-box');
    
    // OC Ship Elements
    const ocshipEnabledCheckbox = document.getElementById('ocship-enabled');
    const ocshipContentWrapper = document.getElementById('ocship-content-wrapper');
    const ocshipTagInput = document.getElementById('ocship-tag');
    const ocshipDetailsInput = document.getElementById('ocship-details');
    const ocshipSongTitleInput = document.getElementById('ocship-song-title');
    
    // YumeShip Elements
    const yumeshipEnabledCheckbox = document.getElementById('yumeship-enabled');
    const yumeshipContentWrapper = document.getElementById('yumeship-content-wrapper');
    const yumeshipTagInput = document.getElementById('yumeship-tag');
    const yumeshipDetailsInput = document.getElementById('yumeship-details');
    const yumeshipSongTitleInput = document.getElementById('yumeship-song-title');
    
    // Gallery Elements
    const galleryEditorContainer = document.getElementById('gallery-editor-container');
    const addFolderBtn = document.getElementById('add-folder-btn');
    const galleryViewModal = document.getElementById('gallery-view-modal');
    const galleryModalTitle = document.getElementById('gallery-modal-title');
    const galleryModalGrid = document.getElementById('gallery-modal-grid');
    
    const deleteModal = document.getElementById('delete-confirm-modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

    const bookModal = document.getElementById('book-view-modal');
    const bookContainer = document.getElementById('book-container');
    const prevPageBtn = document.getElementById('prev-page-btn');
    const nextPageBtn = document.getElementById('next-page-btn');
    const pageIndicator = document.getElementById('page-indicator');

    // Cropper Elements
    const cropModal = document.getElementById('crop-modal');
    const imageToCrop = document.getElementById('image-to-crop');
    const confirmCropBtn = document.getElementById('confirm-crop-btn');

    // =================================================================
    // ========== STATE MANAGEMENT =====================================
    // =================================================================
    let characters = [];
    let currentUser = null;
    let isLoginMode = true;
    let isResetMode = false;
    let isEditMode = false;
    let currentlyEditingId = null;
    let characterIdToDelete = null;
    let passwordIsValid = false;
    let isNewUserSignup = false;
    let characterIdForBookView = null;
    let currentBookSpread = 0;
    let activeBookPages = [];
    let galleryState = [];
    let currentLanguage = localStorage.getItem('preferredLanguage') || 'th';
    let cropper = null;
    let croppingTarget = {};
    let croppedImageData = {};

    // =================================================================
    // ========== TRANSLATION & LANGUAGE ===============================
    // =================================================================
    const translations = {
        th: {
            pageTitle: "OC x Profile",
            authTitleLogin: "เข้าสู่ระบบ", authTitleSignup: "สมัครสมาชิก", authTitleReset: "รีเซ็ตรหัสผ่าน",
            authEmailPlaceholder: "อีเมล", authPasswordPlaceholder: "รหัสผ่าน", authConfirmPasswordPlaceholder: "ยืนยันรหัสผ่าน",
            passwordPolicyTitle: "รหัสผ่านต้องประกอบด้วย:",
            policyLength: "ความยาวอย่างน้อย 8 ตัวอักษร", policyLowercase: "ตัวพิมพ์เล็ก (a-z)", policyUppercase: "ตัวพิมพ์ใหญ่ (A-Z)", policyNumber: "ตัวเลข (0-9)",
            forgotPasswordLink: "ลืมรหัสผ่าน?",
            loginBtn: "เข้าสู่ระบบ", signupBtn: "สมัครสมาชิก", resetPasswordBtn: "ส่งลิงก์รีเซ็ตรหัสผ่าน",
            authToggleToSignup: 'ยังไม่มีบัญชี? <a href="#" id="toggle-to-signup">สมัครสมาชิกที่นี่</a>',
            authToggleToLogin: 'มีบัญชีอยู่แล้ว? <a href="#" id="toggle-to-login">เข้าสู่ระบบที่นี่</a>',
            backToLoginLink: "กลับไปหน้าเข้าสู่ระบบ",
            tooltipLang: "เปลี่ยนภาษา", tooltipEdit: "สลับโหมดแก้ไข", tooltipAdd: "สร้างตัวละครใหม่",
            feedbackLink: "ติชม/ข้อเสนอแนะ", logoutBtn: "ออกจากระบบ",
            mainHeader: "OC x Profile",
            loadingText: "กำลังโหลดข้อมูล...", noCharsText: "ยังไม่มีตัวละคร กดเครื่องหมาย + เพื่อสร้าง", loadingErrorText: "เกิดข้อผิดพลาดในการโหลดข้อมูล",
            modalTitleCreate: "สร้างตัวละครใหม่", modalTitleEdit: "แก้ไขตัวละคร",
            addPhoto: "เพิ่มรูปภาพ", firstNamePlaceholder: "ชื่อจริง", middleNamePlaceholder: "ชื่อกลาง (ถ้ามี)", lastNamePlaceholder: "นามสกุล",
            tabProfile: "โปรไฟล์", tabOCShip: "โอซีชิป", tabYumeShip: "ยูเมะชิป", tabGallery: "แกลเลอรี่", tabRelationship: "ความสัมพันธ์",
            profileDetailsTitle: "รายละเอียดโปรไฟล์", addBtn: "+ เพิ่ม",
            charBgLabel: "ประวัติตัวละคร", charBgPlaceholder: "ใส่ประวัติตัวละครที่นี่...",
            enableOCShip: "เปิดใช้งานหน้าโอซีชิป", shipNameLabel: "ชื่อชิป", shipNamePlaceholder: "ชื่อชิป (เช่น A x B)",
            detailsLabel: "รายละเอียด", describeRelPlaceholder: "อธิบายความสัมพันธ์...",
            enableYumeShip: "เปิดใช้งานหน้ายูเมะชิป", shipTagLabel: "แท็กชิป", shipImagesLabel: "รูปภาพชิป",
            describeYumePlaceholder: "อธิบายความสัมพันธ์, เรื่องราว, โมเมนต์, ฯลฯ...",
            themeSongLabel: "เพลงประจำตัว", songTitlePlaceholder: "ชื่อเพลง",
            galleryImagesTitle: "รูปภาพแกลเลอรี่", uploadImagesLabel: "อัปโหลดรูปภาพ", addFolderBtn: "เพิ่มโฟลเดอร์", folderNamePlaceholder: "ชื่อโฟลเดอร์",
            relationshipDetailsTitle: "รายละเอียดความสัมพันธ์", describeOtherRelsPlaceholder: "อธิบายความสัมพันธ์...",
            saveCharBtn: "บันทึกตัวละคร", savingBtn: "กำลังบันทึก...",
            confirmDeleteTitle: "ยืนยันการลบ", confirmDeleteMsg: "คุณต้องการลบตัวละครนี้ใช่หรือไม่?",
            deleteBtn: "ลบ", cancelBtn: "ยกเลิก",
            bookPageIndicator: (current, total) => `หน้า ${current} จาก ${total}`,
            tooltipBookEdit: "แก้ไขโปรไฟล์ตัวละคร",
            bookHeaderProfile: "รายละเอียดโปรไฟล์", bookHeaderBackground: "ประวัติตัวละคร", bookHeaderOCShip: "โอซีชิป", bookHeaderYumeShip: "ยูเมะชิป", bookHeaderGallery: "แกลเลอรี่", bookHeaderRelationship: "ความสัมพันธ์",
            noDetailsAdded: "ไม่มีรายละเอียด", unnamedChar: "ไม่มีชื่อ", noSongTitle: "(ไม่มีชื่อเพลง)", noBackgroundStory: "ยังไม่ได้เพิ่มประวัติตัวละคร",
            cropImageTitle: "ตัดรูปภาพ", confirmBtn: "ยืนยัน",
        },
        en: {
            pageTitle: "OC x Profile",
            authTitleLogin: "Login", authTitleSignup: "Sign Up", authTitleReset: "Reset Password",
            authEmailPlaceholder: "Email", authPasswordPlaceholder: "Password", authConfirmPasswordPlaceholder: "Confirm Password",
            passwordPolicyTitle: "Password must contain:",
            policyLength: "At least 8 characters", policyLowercase: "Lowercase letter (a-z)", policyUppercase: "Uppercase letter (A-Z)", policyNumber: "Number (0-9)",
            forgotPasswordLink: "Forgot password?",
            loginBtn: "Login", signupBtn: "Sign Up", resetPasswordBtn: "Send Reset Link",
            authToggleToSignup: 'No account? <a href="#" id="toggle-to-signup">Sign up here</a>',
            authToggleToLogin: 'Already have an account? <a href="#" id="toggle-to-login">Login here</a>',
            backToLoginLink: "Back to Login",
            tooltipLang: "Switch Language", tooltipEdit: "Toggle Edit Mode", tooltipAdd: "Create New Character",
            feedbackLink: "Feedback", logoutBtn: "Logout",
            mainHeader: "OC x Profile",
            loadingText: "Loading...", noCharsText: "No characters yet. Press + to create one.", loadingErrorText: "Error loading data.",
            modalTitleCreate: "Create New Character", modalTitleEdit: "Edit Character",
            addPhoto: "Add Photo", firstNamePlaceholder: "First Name", middleNamePlaceholder: "Middle Name (Optional)", lastNamePlaceholder: "Last Name",
            tabProfile: "Profile", tabOCShip: "OC Ship", tabYumeShip: "YumeShip", tabGallery: "Gallery", tabRelationship: "Relationship",
            profileDetailsTitle: "Profile Details", addBtn: "+ Add",
            charBgLabel: "Character Background", charBgPlaceholder: "Enter character background here...",
            enableOCShip: "Enable OC Ship Page", shipNameLabel: "Ship Name", shipNamePlaceholder: "Ship Name (e.g., A x B)",
            detailsLabel: "Details", describeRelPlaceholder: "Describe the relationship...",
            enableYumeShip: "Enable YumeShip Page", shipTagLabel: "Ship Tag", shipImagesLabel: "Ship Images",
            describeYumePlaceholder: "Describe the relationship, story, moments, etc...",
            themeSongLabel: "Theme Song", songTitlePlaceholder: "Song Title",
            galleryImagesTitle: "Gallery Images", uploadImagesLabel: "Upload Images", addFolderBtn: "Add Folder", folderNamePlaceholder: "Folder Name",
            relationshipDetailsTitle: "Relationship Details", describeOtherRelsLabel: "Describe relationships with other characters", describeOtherRelsPlaceholder: "e.g., Best friends with C, Rivals with D...",
            saveCharBtn: "Save Character", savingBtn: "Saving...",
            confirmDeleteTitle: "Confirm Deletion", confirmDeleteMsg: "Are you sure you want to delete this character?",
            deleteBtn: "Delete", cancelBtn: "Cancel",
            bookPageIndicator: (current, total) => `Page ${current} of ${total}`,
            tooltipBookEdit: "Edit Character Profile",
            bookHeaderProfile: "Profile Details", bookHeaderBackground: "Background Story", bookHeaderOCShip: "OC Ship", bookHeaderYumeShip: "YumeShip", bookHeaderGallery: "Gallery", bookHeaderRelationship: "Relationship",
            noDetailsAdded: "No details added.", unnamedChar: "Unnamed", noSongTitle: "(No Title)", noBackgroundStory: "No background story added.",
            cropImageTitle: "Crop Image", confirmBtn: "Confirm",
        }
    };

    const setLanguage = (lang) => {
        const dict = translations[lang];
        document.querySelectorAll('[data-translate-key]').forEach(el => {
            const key = el.dataset.translateKey;
            if (dict[key]) el.innerHTML = dict[key];
        });
        document.querySelectorAll('[data-translate-placeholder-key]').forEach(el => {
            const key = el.dataset.translatePlaceholderKey;
            if (dict[key]) el.placeholder = dict[key];
        });
        document.querySelectorAll('[data-translate-title-key]').forEach(el => {
            const key = el.dataset.translateTitleKey;
            if (dict[key]) el.title = dict[key];
        });

        if (isResetMode) { authTitle.innerHTML = dict.authTitleReset; } 
        else { authTitle.innerHTML = isLoginMode ? dict.authTitleLogin : dict.authTitleSignup; }
        authToggleLink.innerHTML = isLoginMode ? dict.authToggleToSignup : dict.authToggleToLogin;

        if (currentlyEditingId) { modalTitle.innerHTML = dict.modalTitleEdit; } 
        else { modalTitle.innerHTML = dict.modalTitleCreate; }

        langIndicator.textContent = lang.toUpperCase();
    };
    
    langSwitchWrapper.addEventListener('click', () => {
        currentLanguage = currentLanguage === 'th' ? 'en' : 'th';
        localStorage.setItem('preferredLanguage', currentLanguage);
        setLanguage(currentLanguage);
        renderCharacters();
        if (bookModal.style.display === 'flex') {
            renderBookContent();
        }
    });

    // =================================================================
    // ========== AUTHENTICATION LOGIC =================================
    // =================================================================
    const checkPasswordPolicy = (password) => { const hasLength = password.length >= 8; const hasLowercase = /[a-z]/.test(password); const hasUppercase = /[A-Z]/.test(password); const hasNumber = /[0-9]/.test(password); policyLength.classList.toggle('valid', hasLength); policyLowercase.classList.toggle('valid', hasLowercase); policyUppercase.classList.toggle('valid', hasUppercase); policyNumber.classList.toggle('valid', hasNumber); passwordIsValid = hasLength && hasLowercase && hasUppercase && hasNumber; };
    authPasswordInput.addEventListener('focus', () => { if (!isLoginMode && !isResetMode) { passwordPolicyBox.style.display = 'block'; } });
    authPasswordInput.addEventListener('blur', () => { passwordPolicyBox.style.display = 'none'; });
    authPasswordInput.addEventListener('keyup', () => { if (!isLoginMode && !isResetMode) { checkPasswordPolicy(authPasswordInput.value); } });
    togglePasswordVisibility.addEventListener('click', () => { const isPassword = authPasswordInput.type === 'password'; authPasswordInput.type = isPassword ? 'text' : 'password'; authConfirmPasswordInput.type = isPassword ? 'text' : 'password'; togglePasswordVisibility.classList.toggle('fa-eye-slash'); togglePasswordVisibility.classList.toggle('fa-eye'); });
    const updateAuthUI = () => { authError.textContent = ''; authSuccess.textContent = ''; passwordPolicyBox.style.display = 'none'; if (isResetMode) { passwordGroup.style.display = 'none'; confirmPasswordGroup.style.display = 'none'; loginBtn.style.display = 'none'; signupBtn.style.display = 'none'; resetPasswordBtn.style.display = 'block'; forgotPasswordLink.style.display = 'none'; authToggleLink.style.display = 'none'; backToLoginLink.style.display = 'block'; } else { passwordGroup.style.display = 'block'; loginBtn.style.display = isLoginMode ? 'block' : 'none'; signupBtn.style.display = isLoginMode ? 'none' : 'block'; confirmPasswordGroup.style.display = isLoginMode ? 'none' : 'block'; forgotPasswordLink.style.display = isLoginMode ? 'block' : 'none'; resetPasswordBtn.style.display = 'none'; backToLoginLink.style.display = 'none'; authToggleLink.style.display = 'block'; } setLanguage(currentLanguage); };
    document.body.addEventListener('click', (e) => { if (e.target.matches('#toggle-to-signup, #toggle-to-signup *')) { e.preventDefault(); isLoginMode = false; isResetMode = false; updateAuthUI(); } if (e.target.matches('#toggle-to-login, #toggle-to-login *')) { e.preventDefault(); isLoginMode = true; isResetMode = false; updateAuthUI(); } if (e.target.matches('#forgot-password-link, #forgot-password-link *')) { e.preventDefault(); isResetMode = true; updateAuthUI(); } if (e.target.matches('#back-to-login-link, #back-to-login-link *')) { e.preventDefault(); isLoginMode = true; isResetMode = false; updateAuthUI(); } });
    loginBtn.addEventListener('click', () => { const email = authEmailInput.value; const password = authPasswordInput.value; if (!email || !password) { authError.textContent = 'กรุณากรอกอีเมลและรหัสผ่าน'; return; } authError.textContent = ''; auth.signInWithEmailAndPassword(email, password).catch(error => { switch (error.code) { case 'auth/user-not-found': authError.textContent = 'ไม่พบผู้ใช้อีเมลนี้'; break; case 'auth/wrong-password': authError.textContent = 'รหัสผ่านไม่ถูกต้อง'; break; default: authError.textContent = 'เกิดข้อผิดพลาด: ' + error.message; } }); });
    signupBtn.addEventListener('click', () => { const email = authEmailInput.value; const password = authPasswordInput.value; const confirmPassword = authConfirmPasswordInput.value; if (!email || !password || !confirmPassword) { authError.textContent = 'กรุณากรอกข้อมูลให้ครบทุกช่อง'; return; } if (password !== confirmPassword) { authError.textContent = 'รหัสผ่านไม่ตรงกัน'; return; } checkPasswordPolicy(password); if (!passwordIsValid) { authError.textContent = 'รหัสผ่านของคุณไม่ตรงตามเงื่อนไข'; return; } authError.textContent = ''; isNewUserSignup = true; auth.createUserWithEmailAndPassword(email, password).catch(error => { isNewUserSignup = false; switch (error.code) { case 'auth/email-already-in-use': authError.textContent = 'อีเมลนี้ถูกใช้งานแล้ว'; break; case 'auth/weak-password': authError.textContent = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'; break; default: authError.textContent = 'เกิดข้อผิดพลาด: ' + error.message; } }); });
    resetPasswordBtn.addEventListener('click', () => { const email = authEmailInput.value; if (!email) { authError.textContent = 'กรุณากรอกอีเมลของคุณ'; return; } auth.sendPasswordResetEmail(email).then(() => { authError.textContent = ''; authSuccess.textContent = 'ส่งลิงก์สำเร็จ! กรุณาตรวจสอบกล่องจดหมาย (Inbox) ของคุณ'; }).catch(error => { authSuccess.textContent = ''; authError.textContent = error.code === 'auth/user-not-found' ? 'ไม่พบผู้ใช้อีเมลนี้ในระบบ' : 'เกิดข้อผิดพลาด: ' + error.message; }); });
    authForm.addEventListener('submit', (e) => { e.preventDefault(); });
    logoutBtn.addEventListener('click', (e) => { e.preventDefault(); auth.signOut(); });
    auth.onAuthStateChanged(user => { if (user) { currentUser = user; isLoginMode = true; isResetMode = false; updateAuthUI(); authForm.reset(); authContainer.style.display = 'none'; appContainer.style.display = 'block'; sidebarUserEmail.textContent = user.email; loadCharacters(); if (isNewUserSignup) { isNewUserSignup = false; addCharBtn.click(); } } else { currentUser = null; authContainer.style.display = 'flex'; appContainer.style.display = 'none'; characterContainer.innerHTML = ''; characters = []; } });

    // =================================================================
    // ========== CORE APP FUNCTIONS ===================================
    // =================================================================
    const loadCharacters = async () => { if (!currentUser) return; characterContainer.innerHTML = `<p class="loading-text">${translations[currentLanguage].loadingText}</p>`; try { const snapshot = await db.collection('characters').where('ownerUID', '==', currentUser.uid).orderBy('createdAt', 'desc').get(); characters = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); renderCharacters(); } catch (error) { console.error("Error loading characters: ", error); characterContainer.innerHTML = `<p class="loading-text">${translations[currentLanguage].loadingErrorText}</p>`; } };
    const renderCharacters = () => {
        const dict = translations[currentLanguage];
        characterContainer.innerHTML = '';
        if (characters.length === 0) {
            characterContainer.innerHTML = `<p class="loading-text">${dict.noCharsText}</p>`;
            return;
        }
        characters.forEach(char => {
            const card = document.createElement('div');
            card.className = 'character-card';
            card.dataset.id = char.id;
            const fullName = [char.firstName, char.middleName, char.lastName].filter(Boolean).join(' ');
            const imageHtml = char.imageB64 ? `<img src="${char.imageB64}" alt="${fullName}" class="char-image">` : `<div class="char-image-placeholder"></div>`;
            card.innerHTML = `<div class="card-overlay-icons"><i class="fas fa-pencil-alt edit-char-btn"></i><i class="fas fa-trash-alt delete-char-btn"></i></div>${imageHtml}<div class="char-name">${fullName || dict.unnamedChar}</div>`;
            characterContainer.appendChild(card);
        });
    };
    
    const addCustomFieldInput = (label = '', value = '') => { const div = document.createElement('div'); div.className = 'custom-field-pair'; div.innerHTML = `<input type="text" placeholder="${currentLanguage === 'th' ? 'เช่น สีที่ชอบ' : 'e.g., Favorite Color'}" value="${label}"><input type="text" placeholder="${currentLanguage === 'th' ? 'เช่น สีฟ้า' : 'e.g., Blue'}" value="${value}"><button type="button" class="remove-field-btn">-</button>`; customFieldsContainer.appendChild(div); };
    
    const populateModal = (charId, mode) => {
        const char = characters.find(c => c.id === charId);
        if (!char) return;

        currentlyEditingId = charId;
        addCharForm.className = ''; addCharForm.reset();
        document.querySelectorAll('.image-preview, .ship-image-preview, .song-art-preview, .image-preview-square').forEach(el => el.style.backgroundImage = 'none');
        imagePreviewBox.innerHTML = `<i class="fas fa-camera"></i><span data-translate-key="addPhoto">${translations[currentLanguage].addPhoto}</span>`;
        customFieldsContainer.innerHTML = '';
        galleryEditorContainer.innerHTML = '';
        galleryState = [];
        croppedImageData = {};

        if (mode === 'name-only-mode') { addCharForm.classList.add('name-only-mode'); } 
        else if (mode === 'profile-only-mode') { addCharForm.classList.add('profile-only-mode'); }

        document.getElementById('first-name').value = char.firstName || '';
        document.getElementById('middle-name').value = char.middleName || '';
        document.getElementById('last-name').value = char.lastName || '';
        if (char.imageB64) { imagePreviewBox.style.backgroundImage = `url('${char.imageB64}')`; imagePreviewBox.innerHTML = ''; }
        
        if (mode !== 'name-only-mode') {
            document.getElementById('character-background').value = char.backgroundStory || '';
            if (char.customFields && Array.isArray(char.customFields)) {
                char.customFields.forEach(field => addCustomFieldInput(field.label, field.value));
            }

            const os = char.ocship || {};
            ocshipEnabledCheckbox.checked = os.enabled || false;
            ocshipContentWrapper.classList.toggle('disabled', !os.enabled);
            ocshipTagInput.value = os.tag || '';
            ocshipDetailsInput.value = os.details || '';
            ocshipSongTitleInput.value = os.songTitle || '';
            if(os.img1B64) document.getElementById('ocship-img-1-preview').style.backgroundImage = `url('${os.img1B64}')`;
            if(os.img2B64) document.getElementById('ocship-img-2-preview').style.backgroundImage = `url('${os.img2B64}')`;
            if(os.songArtB64) document.getElementById('ocship-song-art-preview').style.backgroundImage = `url('${os.songArtB64}')`;

            const ys = char.yumeship || {};
            yumeshipEnabledCheckbox.checked = ys.enabled || false;
            yumeshipContentWrapper.classList.toggle('disabled', !ys.enabled);
            yumeshipTagInput.value = ys.tag || '';
            yumeshipDetailsInput.value = ys.details || '';
            yumeshipSongTitleInput.value = ys.songTitle || '';
            if(ys.img1B64) document.getElementById('yumeship-img-1-preview').style.backgroundImage = `url('${ys.img1B64}')`;
            if(ys.img2B64) document.getElementById('yumeship-img-2-preview').style.backgroundImage = `url('${ys.img2B64}')`;
            if(ys.songArtB64) document.getElementById('yumeship-song-art-preview').style.backgroundImage = `url('${ys.songArtB64}')`;
            
            if (char.relationships && Array.isArray(char.relationships)) {
                for(let i=0; i<3; i++){
                    if(char.relationships[i]) {
                        document.getElementById(`relationship-details-${i+1}`).value = char.relationships[i].details || '';
                        if(char.relationships[i].imgB64) {
                            document.getElementById(`relationship-img-${i+1}-preview`).style.backgroundImage = `url('${char.relationships[i].imgB64}')`;
                        }
                    }
                }
            }
            
            if (char.gallery && Array.isArray(char.gallery)) {
                char.gallery.forEach(folder => addFolderToEditor(folder));
            }
        }
        
        setLanguage(currentLanguage);
        openModal(addModal);
    };

    const dataURItoBlob = (dataURI) => {
        const byteString = atob(dataURI.split(',')[1]);
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeString });
    };

    const compressImage = async (fileOrDataUrl) => {
        if (!fileOrDataUrl) return null;
        const blob = (typeof fileOrDataUrl === 'string') ? dataURItoBlob(fileOrDataUrl) : fileOrDataUrl;
        const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1024, useWebWorker: false, initialQuality: 0.7 };
        const compressedFile = await imageCompression(blob, options);
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(compressedFile);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    addCharForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUser) return;
        const isCreating = !currentlyEditingId;
        const formMode = addCharForm.className;
        const charId = isCreating ? db.collection('characters').doc().id : currentlyEditingId;
        let charData = {};
        const submitButton = addCharForm.querySelector('button[type="submit"]');

        try {
            submitButton.disabled = true;
            submitButton.textContent = translations[currentLanguage].savingBtn;
            const doc = await db.collection('characters').doc(charId).get();
            if (doc.exists) { charData = doc.data(); }

            if (formMode !== 'profile-only-mode') {
                charData.firstName = document.getElementById('first-name').value.trim();
                charData.middleName = document.getElementById('middle-name').value.trim();
                charData.lastName = document.getElementById('last-name').value.trim();
                charData.imageB64 = croppedImageData.charimageinput ? await compressImage(croppedImageData.charimageinput) : (charData.imageB64 || null);
            }

            if (formMode !== 'name-only-mode') {
                const customFields = [];
                customFieldsContainer.querySelectorAll('.custom-field-pair').forEach(pair => {
                    const label = pair.children[0].value.trim();
                    const value = pair.children[1].value.trim();
                    if (label && value) { customFields.push({ label, value }); }
                });
                charData.customFields = customFields;
                charData.backgroundStory = document.getElementById('character-background').value.trim();
                
                charData.ocship = {
                    enabled: ocshipEnabledCheckbox.checked,
                    tag: ocshipTagInput.value.trim(),
                    details: ocshipDetailsInput.value.trim(),
                    songTitle: ocshipSongTitleInput.value.trim(),
                    img1B64: croppedImageData.ocshipimg1 ? await compressImage(croppedImageData.ocshipimg1) : (charData.ocship?.img1B64 || null),
                    img2B64: croppedImageData.ocshipimg2 ? await compressImage(croppedImageData.ocshipimg2) : (charData.ocship?.img2B64 || null),
                    songArtB64: croppedImageData.ocshipsongart ? await compressImage(croppedImageData.ocshipsongart) : (charData.ocship?.songArtB64 || null),
                };

                charData.yumeship = {
                    enabled: yumeshipEnabledCheckbox.checked,
                    tag: yumeshipTagInput.value.trim(),
                    details: yumeshipDetailsInput.value.trim(),
                    songTitle: yumeshipSongTitleInput.value.trim(),
                    img1B64: croppedImageData.yumeshipimg1 ? await compressImage(croppedImageData.yumeshipimg1) : (charData.yumeship?.img1B64 || null),
                    img2B64: croppedImageData.yumeshipimg2 ? await compressImage(croppedImageData.yumeshipimg2) : (charData.yumeship?.img2B64 || null),
                    songArtB64: croppedImageData.yumeshipsongart ? await compressImage(croppedImageData.yumeshipsongart) : (charData.yumeship?.songArtB64 || null),
                };

                charData.relationships = [];
                for (let i = 0; i < 3; i++) {
                    const details = document.getElementById(`relationship-details-${i+1}`).value.trim();
                    const key = `relationshipimg${i+1}`;
                    const existingImg = charData.relationships && charData.relationships[i] ? charData.relationships[i].imgB64 : null;
                    const imgB64 = croppedImageData[key] ? await compressImage(croppedImageData[key]) : (existingImg || null);
                    if (details || imgB64) {
                        charData.relationships[i] = { details, imgB64 };
                    } else {
                        charData.relationships[i] = null;
                    }
                }
                
                charData.gallery = [];
                for (const folderState of galleryState) {
                    const name = document.querySelector(`[data-folder-id="${folderState.id}"] .gallery-folder-name-input`).value.trim();
                    const existingImages = folderState.images;
                    const newImagePromises = folderState.newFiles.map(file => compressImage(file));
                    const newImages = await Promise.all(newImagePromises);
                    charData.gallery.push({ name, images: existingImages.concat(newImages) });
                }
            }

            charData.ownerUID = currentUser.uid;
            if (isCreating) { charData.createdAt = firebase.firestore.FieldValue.serverTimestamp(); }
            charData.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
            
            await db.collection('characters').doc(charId).set(charData, { merge: true });
            await loadCharacters();
            if (bookModal.style.display === 'flex' && currentlyEditingId === characterIdForBookView) { renderBookContent(); }
            
            closeModal(addModal);
            
        } catch (error) {
            console.error("Error saving character: ", error);
            alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล: " + error.message);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = translations[currentLanguage].saveCharBtn;
        }
    });

    confirmDeleteBtn.addEventListener('click', async () => { if (!characterIdToDelete || !currentUser) return; try { await db.collection('characters').doc(characterIdToDelete).delete(); characterIdToDelete = null; await loadCharacters(); closeModal(deleteModal); } catch (error) { console.error("Error deleting character: ", error); alert("เกิดข้อผิดพลาดในการลบตัวละคร"); } });
    
    const renderBookContent = () => {
        const char = characters.find(c => c.id === characterIdForBookView);
        if (!char) { closeModal(bookModal); return; }
        const dict = translations[currentLanguage];
        
        bookContainer.innerHTML = '';
        activeBookPages = ['profile', 'background'];
        if (char.ocship?.enabled) activeBookPages.push('ocship');
        if (char.yumeship?.enabled) activeBookPages.push('yumeship');
        if (char.gallery?.some(f => f.images.length > 0)) activeBookPages.push('gallery');
        if (char.relationships?.some(r => r && (r.details || r.imgB64))) activeBookPages.push('relationship');
        
        const totalSpreads = Math.ceil(activeBookPages.length / 2);
        const leftPageType = activeBookPages[currentBookSpread * 2];
        const rightPageType = activeBookPages[currentBookSpread * 2 + 1];

        const leftPage = document.createElement('div');
        leftPage.className = 'book-page book-page-left';
        leftPage.innerHTML = `<i class="fas fa-cog book-manage-btn" title="${dict.tooltipBookEdit}"></i>`;

        const rightPage = document.createElement('div');
        rightPage.className = 'book-page book-page-right';

        const generatePageContent = (pageType) => {
            if (!pageType) return '';
            const shipPageTemplate = (ship, type) => {
                const header = type === 'oc' ? dict.bookHeaderOCShip : dict.bookHeaderYumeShip;
                return `<div>
                    <h3>${header}</h3>
                    <div class="yumeship-top-section">
                        <div class="ship-tag-bubble">${ship.tag ? (ship.tag.startsWith('#') ? ship.tag : `#${ship.tag}`) : '#ShipTag'}</div>
                        <div class="ship-image-display">
                            <div class="ship-image-circle" style="background-image: ${ship.img1B64 ? `url('${ship.img1B64}')` : 'none'}"></div>
                            <i class="fas fa-heart"></i>
                            <div class="ship-image-circle" style="background-image: ${ship.img2B64 ? `url('${ship.img2B64}')` : 'none'}"></div>
                        </div>
                    </div>
                    <div class="yumeship-text-box">${ship.details || dict.noDetailsAdded}</div>
                    <div class="music-player">
                        <div class="music-art" style="background-image: ${ship.songArtB64 ? `url('${ship.songArtB64}')` : 'none'}"></div>
                        <div class="music-info">
                            <div class="music-title-wrapper"><span>${ship.songTitle || dict.noSongTitle}</span></div>
                            <div class="music-progress-bar"><div class="music-progress-fill"></div></div>
                            <div class="music-controls"><i class="fas fa-heart"></i><i class="fas fa-backward-step"></i><i class="fas fa-play-circle"></i><i class="fas fa-forward-step"></i><i class="fas fa-clock"></i></div>
                        </div>
                    </div>
                </div>`;
            };

            switch (pageType) {
                case 'profile':
                    const fieldsHtml = (char.customFields?.length ? char.customFields.map(f => `<div class="book-custom-field"><strong>${f.label}:</strong><span>${f.value}</span></div>`).join('') : `<p>${dict.noDetailsAdded}</p>`);
                    return `<div><h2 id="book-character-name">${[char.firstName, char.middleName, char.lastName].filter(Boolean).join(' ') || dict.unnamedChar}</h2><img id="book-character-image" src="${char.imageB64 || ''}" style="display: ${char.imageB64 ? 'block' : 'none'}"><div class="book-custom-fields-container"><h4>${dict.bookHeaderProfile}</h4>${fieldsHtml}</div></div>`;
                case 'background':
                    return `<div><h3>${dict.bookHeaderBackground}</h3><div class="story-text-box">${char.backgroundStory || dict.noBackgroundStory}</div></div>`;
                case 'ocship':
                    return shipPageTemplate(char.ocship, 'oc');
                case 'yumeship':
                    return shipPageTemplate(char.yumeship, 'yume');
                case 'gallery':
                    let galleryHtml = `<div class="book-gallery-container">`;
                    char.gallery.forEach((folder, index) => {
                        if (folder.images.length > 0) {
                            galleryHtml += `
                                <div class="book-gallery-folder-item" data-folder-index="${index}">
                                    <span class="folder-name">${folder.name || dict.unnamedChar}</span>
                                </div>`;
                        }
                    });
                    galleryHtml += `</div>`;
                    return `<div><h3>${dict.bookHeaderGallery}</h3>${galleryHtml}</div>`;
                case 'relationship':
                    let relHtml = `<div class="book-relationship-container">`;
                    char.relationships.forEach((rel, index) => {
                        if (rel && (rel.details || rel.imgB64)) {
                            const layout = index === 1 ? 'layout-right' : 'layout-left';
                            relHtml += `<div class="book-relationship-entry ${layout}">
                                <img src="${rel.imgB64 || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='}" style="display: ${rel.imgB64 ? 'block' : 'none'}">
                                <div class="details">${rel.details || ''}</div>
                            </div>`;
                        }
                    });
                    relHtml += `</div>`;
                    return `<div><h3>${dict.bookHeaderRelationship}</h3>${relHtml}</div>`;
                default: return '';
            }
        };

        leftPage.innerHTML += generatePageContent(leftPageType);
        if (rightPageType) {
            rightPage.innerHTML += generatePageContent(rightPageType);
        } else {
            rightPage.classList.add('empty');
        }

        bookContainer.appendChild(leftPage);
        bookContainer.appendChild(rightPage);
        
        setTimeout(() => {
            const songTitles = bookContainer.querySelectorAll('.music-title-wrapper span');
            songTitles.forEach(titleEl => {
                const wrapperEl = titleEl.parentElement;
                if (titleEl.scrollWidth > wrapperEl.clientWidth) {
                    const speed = 40;
                    const duration = titleEl.scrollWidth / speed;
                    titleEl.style.animationDuration = `${duration}s`;
                    titleEl.classList.add('scrolling');
                } else {
                    titleEl.classList.remove('scrolling');
                    titleEl.style.animationDuration = ''; 
                }
            });
        }, 500);
        
        pageIndicator.textContent = dict.bookPageIndicator(currentBookSpread + 1, totalSpreads);
        prevPageBtn.disabled = (currentBookSpread === 0);
        nextPageBtn.disabled = (currentBookSpread >= totalSpreads - 1);
    };

    const openBookView = (charId) => { const char = characters.find(c => c.id === charId); if (!char) return; characterIdForBookView = charId; currentBookSpread = 0; renderBookContent(); openModal(bookModal); };

    // =================================================================
    // ========== UI & MODAL EVENT LISTENERS ===========================
    // =================================================================
    const openModal = (modal) => modal.style.display = 'flex';
    const closeModal = (modal) => {
        modal.style.display = 'none';
        if (modal === cropModal && cropper) {
            cropper.destroy();
            cropper = null;
        }
    };
    
    const toggleSidebar = () => { sidebar.classList.toggle('open'); sidebarOverlay.classList.toggle('open'); };
    hamburgerBtn.addEventListener('click', toggleSidebar);
    sidebarOverlay.addEventListener('click', toggleSidebar);
    addCharBtn.addEventListener('click', () => { 
        currentlyEditingId = null; 
        addCharForm.reset(); 
        customFieldsContainer.innerHTML = ''; 
        galleryEditorContainer.innerHTML = '';
        galleryState = [];
        croppedImageData = {};
        document.querySelectorAll('.image-preview, .ship-image-preview, .song-art-preview, .image-preview-square').forEach(el => {
            el.style.backgroundImage = 'none';
            if (el.querySelector('i')) el.style.display = 'flex';
        });
        imagePreviewBox.innerHTML = `<i class="fas fa-camera"></i><span data-translate-key="addPhoto">${translations[currentLanguage].addPhoto}</span>`; 
        addCharForm.className = 'create-mode'; 
        yumeshipContentWrapper.classList.remove('disabled'); 
        ocshipContentWrapper.classList.remove('disabled'); 
        setLanguage(currentLanguage); 
        openModal(addModal); 
    });
    
    characterContainer.addEventListener('click', (e) => {
        const card = e.target.closest('.character-card');
        if (!card) return;
        const charId = card.dataset.id;
        if (isEditMode) {
            if (e.target.classList.contains('delete-char-btn')) { characterIdToDelete = charId; openModal(deleteModal); } 
            else if (e.target.classList.contains('edit-char-btn')) { populateModal(charId, 'name-only-mode'); }
        } else {
            openBookView(charId);
        }
    });

    toggleEditBtn.addEventListener('click', () => { isEditMode = !isEditMode; characterContainer.classList.toggle('edit-mode', isEditMode); toggleEditBtn.classList.toggle('active', isEditMode); });
    document.querySelectorAll('.modal-overlay').forEach(modal => { modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(modal); }); });
    document.querySelectorAll('.close-btn, #cancel-delete-btn, #cancel-crop-btn').forEach(btn => { btn.addEventListener('click', () => closeModal(btn.closest('.modal-overlay'))); });
    
    bookContainer.addEventListener('click', (e) => { 
        if(e.target.classList.contains('book-manage-btn')) { 
            if (characterIdForBookView) { populateModal(characterIdForBookView, 'profile-only-mode'); } 
        }
        const folderItem = e.target.closest('.book-gallery-folder-item');
        if (folderItem) {
            const char = characters.find(c => c.id === characterIdForBookView);
            const folderIndex = parseInt(folderItem.dataset.folderIndex, 10);
            const folder = char.gallery[folderIndex];
            if (folder) {
                galleryModalTitle.textContent = folder.name || translations[currentLanguage].unnamedChar;
                galleryModalGrid.innerHTML = folder.images.map(img => `<img src="${img}">`).join('');
                openModal(galleryViewModal);
            }
        }
    });
    prevPageBtn.addEventListener('click', () => { if (currentBookSpread > 0) { currentBookSpread--; renderBookContent(); } });
    nextPageBtn.addEventListener('click', () => { const totalSpreads = Math.ceil(activeBookPages.length / 2); if (currentBookSpread < totalSpreads - 1) { currentBookSpread++; renderBookContent(); } });

    tabButtons.querySelectorAll('.tab-button').forEach(button => { button.addEventListener('click', () => { tabButtons.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active')); tabContents.forEach(content => content.classList.remove('active')); button.classList.add('active'); document.getElementById(button.dataset.tab).classList.add('active'); }); });
    addFieldBtn.addEventListener('click', () => addCustomFieldInput());
    customFieldsContainer.addEventListener('click', (e) => { if (e.target.classList.contains('remove-field-btn')) { e.target.parentElement.remove(); } });
    ocshipEnabledCheckbox.addEventListener('change', () => { ocshipContentWrapper.classList.toggle('disabled', !ocshipEnabledCheckbox.checked); });
    yumeshipEnabledCheckbox.addEventListener('change', () => { yumeshipContentWrapper.classList.toggle('disabled', !yumeshipEnabledCheckbox.checked); });
    
    // CROPPER LOGIC
    const openCropper = (file, targetInfo) => {
        croppingTarget = targetInfo;
        const reader = new FileReader();
        reader.onload = (e) => {
            imageToCrop.src = e.target.result;
            openModal(cropModal);
            if (cropper) cropper.destroy();
            cropper = new Cropper(imageToCrop, {
                aspectRatio: targetInfo.aspectRatio,
                viewMode: 1,
                background: false,
                autoCropArea: 0.9,
            });
        };
        reader.readAsDataURL(file);
    };

    document.querySelectorAll('.crop-image-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const targetInfo = {
                previewEl: document.getElementById(`${input.id}-preview`) || imagePreviewBox,
                dataKey: input.id.replace(/-/g, ''),
                aspectRatio: parseFloat(input.dataset.aspectRatio) || 1,
            };
            openCropper(file, targetInfo);
            e.target.value = '';
        });
    });

    confirmCropBtn.addEventListener('click', () => {
        if (!cropper) return;
        const croppedData = cropper.getCroppedCanvas({
            width: 512,
            height: 512 / cropper.options.aspectRatio,
            imageSmoothingQuality: 'high',
        }).toDataURL('image/jpeg', 0.9);
        
        croppedImageData[croppingTarget.dataKey] = croppedData;
        croppingTarget.previewEl.style.backgroundImage = `url('${croppedData}')`;
        if (croppingTarget.dataKey === 'charimageinput') {
            croppingTarget.previewEl.innerHTML = '';
        }
        
        closeModal(cropModal);
    });

    // DRAGGABLE TABS LOGIC
    let isDown = false;
    let startX;
    let scrollLeft;

    tabButtons.addEventListener('mousedown', (e) => {
        isDown = true;
        tabButtons.classList.add('grabbing');
        startX = e.pageX - tabButtons.offsetLeft;
        scrollLeft = tabButtons.scrollLeft;
    });
    tabButtons.addEventListener('mouseleave', () => {
        isDown = false;
        tabButtons.classList.remove('grabbing');
    });
    tabButtons.addEventListener('mouseup', () => {
        isDown = false;
        tabButtons.classList.remove('grabbing');
    });
    tabButtons.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - tabButtons.offsetLeft;
        const walk = (x - startX) * 2;
        tabButtons.scrollLeft = scrollLeft - walk;
    });

    // GALLERY FOLDER LOGIC
    const addFolderToEditor = (folder = { name: '', images: [] }) => {
        const folderId = `folder-${Date.now()}-${Math.random()}`;
        const newFolderState = { id: folderId, name: folder.name, images: [...folder.images], newFiles: [] };
        galleryState.push(newFolderState);

        const folderDiv = document.createElement('div');
        folderDiv.className = 'gallery-folder-editor';
        folderDiv.dataset.folderId = folderId;

        const imageInputId = `gallery-input-${folderId}`;
        const previewContainerId = `gallery-preview-${folderId}`;

        folderDiv.innerHTML = `
            <div class="gallery-folder-header">
                <input type="text" class="gallery-folder-name-input" placeholder="${translations[currentLanguage].folderNamePlaceholder}" value="${folder.name}">
                <button type="button" class="remove-field-btn remove-folder-btn">-</button>
            </div>
            <label for="${imageInputId}" class="gallery-folder-image-input-label" data-translate-key="uploadImagesLabel">${translations[currentLanguage].uploadImagesLabel}</label>
            <input type="file" id="${imageInputId}" class="gallery-folder-image-input" accept="image/*" multiple hidden>
            <div class="gallery-preview-container" id="${previewContainerId}"></div>
        `;
        
        galleryEditorContainer.appendChild(folderDiv);
        const previewContainer = folderDiv.querySelector('.gallery-preview-container');
        folder.images.forEach((imgB64, index) => {
            const item = document.createElement('div');
            item.className = 'gallery-preview-item';
            item.innerHTML = `<img src="${imgB64}" data-existing-index="${index}"><span class="gallery-delete-btn">&times;</span>`;
            previewContainer.appendChild(item);
        });
    };

    addFolderBtn.addEventListener('click', () => addFolderToEditor());

    galleryEditorContainer.addEventListener('click', (e) => {
        const folderDiv = e.target.closest('.gallery-folder-editor');
        if (!folderDiv) return;
        const folderState = galleryState.find(f => f.id === folderDiv.dataset.folderId);

        if (e.target.classList.contains('remove-folder-btn')) {
            galleryState = galleryState.filter(f => f.id !== folderDiv.dataset.folderId);
            folderDiv.remove();
        }
        if (e.target.classList.contains('gallery-delete-btn')) {
            const item = e.target.closest('.gallery-preview-item');
            const img = item.querySelector('img');

            if (img.dataset.fileIndex !== undefined) {
                folderState.newFiles[parseInt(img.dataset.fileIndex, 10)] = null;
            } else if (img.dataset.existingIndex !== undefined) {
                folderState.images[parseInt(img.dataset.existingIndex, 10)] = null;
            }
            item.remove();
        }
    });

    galleryEditorContainer.addEventListener('change', (e) => {
        if (e.target.classList.contains('gallery-folder-image-input')) {
            const folderDiv = e.target.closest('.gallery-folder-editor');
            const folderState = galleryState.find(f => f.id === folderDiv.dataset.folderId);
            const previewContainer = folderDiv.querySelector('.gallery-preview-container');
            
            const files = Array.from(e.target.files);
            files.forEach(file => {
                const fileIndex = folderState.newFiles.length;
                folderState.newFiles.push(file);

                const reader = new FileReader();
                reader.onload = (event) => {
                    const item = document.createElement('div');
                    item.className = 'gallery-preview-item';
                    item.innerHTML = `<img src="${event.target.result}" data-file-index="${fileIndex}"><span class="gallery-delete-btn">&times;</span>`;
                    previewContainer.appendChild(item);
                };
                reader.readAsDataURL(file);
            });
        }
    });

    // Initial UI setup
    updateAuthUI();
});