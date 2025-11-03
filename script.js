document.addEventListener('DOMContentLoaded', () => {

    // =================================================================
    // ========== STEP 1: FIREBASE CONFIGURATION =======================
    // =================================================================
    // **** วาง `firebaseConfig` ที่คุณคัดลอกจากเว็บไซต์ Firebase ที่นี่ ****
    const firebaseConfig = {
  apiKey: "AIzaSyDO9WZq_pEf8UUoV8YQmXDsb6eths1ZSlY",
  authDomain: "ocxprofile.firebaseapp.com",
  projectId: "ocxprofile",
  storageBucket: "ocxprofile.firebasestorage.app",
  messagingSenderId: "1056463543851",
  appId: "1:1056463543851:web:4b0eef8cfa3c5bcf25546e",
  measurementId: "G-5946FF6TWD"
};

    // Initialize Firebase
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
    const authError = document.getElementById('auth-error');
    const authSuccess = document.getElementById('auth-success');
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const resetPasswordBtn = document.getElementById('reset-password-btn');
    const authToggleLink = document.querySelector('.auth-toggle-link');
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    const backToLoginLink = document.querySelector('.back-to-login-link');
    const authTitle = document.getElementById('auth-title');

    const sidebarUserEmail = document.getElementById('sidebar-user-email');
    const logoutBtn = document.getElementById('logout-btn');
    const characterContainer = document.getElementById('character-container');
    const addCharBtn = document.getElementById('add-char-btn');
    const toggleEditBtn = document.getElementById('toggle-edit-btn');
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    
    const addModal = document.getElementById('add-char-modal');
    const addCharForm = document.getElementById('add-char-form');
    const deleteModal = document.getElementById('delete-confirm-modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const imagePreviewBox = document.getElementById('image-preview-box');

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

    // =================================================================
    // ========== AUTHENTICATION LOGIC =================================
    // =================================================================
    const updateAuthUI = () => {
        authError.textContent = '';
        authSuccess.textContent = '';
        
        if (isResetMode) {
            authTitle.textContent = 'รีเซ็ตรหัสผ่าน';
            passwordGroup.style.display = 'none';
            loginBtn.style.display = 'none';
            signupBtn.style.display = 'none';
            resetPasswordBtn.style.display = 'block';
            forgotPasswordLink.style.display = 'none';
            authToggleLink.style.display = 'none';
            backToLoginLink.style.display = 'block';
        } else {
            authTitle.textContent = isLoginMode ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก';
            passwordGroup.style.display = 'block';
            loginBtn.style.display = isLoginMode ? 'block' : 'none';
            signupBtn.style.display = isLoginMode ? 'none' : 'block';
            resetPasswordBtn.style.display = 'none';
            forgotPasswordLink.style.display = 'block';

            authToggleLink.innerHTML = isLoginMode 
                ? 'ยังไม่มีบัญชี? <a href="#" id="toggle-to-signup">สมัครสมาชิกที่นี่</a>' 
                : 'มีบัญชีอยู่แล้ว? <a href="#" id="toggle-to-login">เข้าสู่ระบบที่นี่</a>';
            authToggleLink.style.display = 'block';
            backToLoginLink.style.display = 'none';
        }
    };

    document.body.addEventListener('click', (e) => {
        if (e.target.matches('#toggle-to-signup, #toggle-to-signup *')) {
            e.preventDefault(); isLoginMode = false; isResetMode = false; updateAuthUI();
        }
        if (e.target.matches('#toggle-to-login, #toggle-to-login *')) {
            e.preventDefault(); isLoginMode = true; isResetMode = false; updateAuthUI();
        }
        if (e.target.matches('#forgot-password-link, #forgot-password-link *')) {
            e.preventDefault(); isResetMode = true; updateAuthUI();
        }
        if (e.target.matches('#back-to-login-link, #back-to-login-link *')) {
            e.preventDefault(); isLoginMode = true; isResetMode = false; updateAuthUI();
        }
    });

    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (isResetMode) return;
        
        const email = authEmailInput.value;
        const password = authPasswordInput.value;

        const action = isLoginMode 
            ? auth.signInWithEmailAndPassword(email, password)
            : auth.createUserWithEmailAndPassword(email, password);
        
        action.catch(error => {
            switch (error.code) {
                case 'auth/user-not-found': authError.textContent = 'ไม่พบผู้ใช้อีเมลนี้'; break;
                case 'auth/wrong-password': authError.textContent = 'รหัสผ่านไม่ถูกต้อง'; break;
                case 'auth/email-already-in-use': authError.textContent = 'อีเมลนี้ถูกใช้งานแล้ว'; break;
                case 'auth/weak-password': authError.textContent = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'; break;
                default: authError.textContent = 'เกิดข้อผิดพลาด: ' + error.message;
            }
        });
    });
    
    resetPasswordBtn.addEventListener('click', () => {
        const email = authEmailInput.value;
        if (!email) {
            authError.textContent = 'กรุณากรอกอีเมลของคุณ';
            return;
        }

        auth.sendPasswordResetEmail(email)
            .then(() => {
                authError.textContent = '';
                authSuccess.textContent = 'ส่งลิงก์สำเร็จ! กรุณาตรวจสอบกล่องจดหมาย (Inbox) ของคุณ';
            })
            .catch(error => {
                authSuccess.textContent = '';
                authError.textContent = error.code === 'auth/user-not-found' 
                    ? 'ไม่พบผู้ใช้อีเมลนี้ในระบบ' 
                    : 'เกิดข้อผิดพลาด: ' + error.message;
            });
    });

    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        auth.signOut();
    });

    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            isLoginMode = true;
            isResetMode = false;
            updateAuthUI();
            authContainer.style.display = 'none';
            appContainer.style.display = 'block';
            sidebarUserEmail.textContent = user.email;
            loadCharacters();
        } else {
            currentUser = null;
            authContainer.style.display = 'flex';
            appContainer.style.display = 'none';
            characterContainer.innerHTML = '';
            characters = [];
        }
    });

    // =================================================================
    // ========== CORE APP FUNCTIONS (WITH IMAGE COMPRESSION) ==========
    // =================================================================
    const loadCharacters = async () => {
        if (!currentUser) return;
        characterContainer.innerHTML = '<p class="loading-text">กำลังโหลดข้อมูล...</p>';
        try {
            const snapshot = await db.collection('characters')
                                     .where('ownerUID', '==', currentUser.uid)
                                     .orderBy('createdAt', 'desc')
                                     .get();
            characters = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderCharacters();
        } catch (error) {
            console.error("Error loading characters: ", error);
            characterContainer.innerHTML = '<p class="loading-text">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>';
        }
    };

    const renderCharacters = () => {
        characterContainer.innerHTML = '';
        if (characters.length === 0) {
            characterContainer.innerHTML = '<p class="loading-text">ยังไม่มีตัวละคร กดเครื่องหมาย + เพื่อสร้าง</p>';
            return;
        }
        characters.forEach(char => {
            const card = document.createElement('div');
            card.className = 'character-card';
            card.dataset.id = char.id;
            const fullName = [char.firstName, char.middleName, char.lastName].filter(Boolean).join(' ');
            const imageHtml = char.imageB64 
                ? `<img src="${char.imageB64}" alt="${fullName}" class="char-image">` 
                : `<div class="char-image-placeholder"></div>`;
            card.innerHTML = `<div class="card-overlay-icons"><i class="fas fa-pencil-alt edit-char-btn"></i><i class="fas fa-trash-alt delete-char-btn"></i></div>${imageHtml}<div class="char-name">${fullName || 'Unnamed'}</div>`;
            characterContainer.appendChild(card);
        });
    };

    addCharForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUser) return;

        const isCreating = !currentlyEditingId;
        const charId = isCreating ? db.collection('characters').doc().id : currentlyEditingId;
        
        let charData = {};
        const submitButton = addCharForm.querySelector('button[type="submit"]');

        try {
            submitButton.disabled = true;
            submitButton.textContent = 'กำลังบันทึก...';
            
            if (!isCreating) {
                const doc = await db.collection('characters').doc(charId).get();
                if (doc.exists) charData = doc.data();
            }

            const imageInput = document.getElementById('char-image-input');
            if (imageInput.files[0]) {
                const file = imageInput.files[0];
                
                const options = {
                    maxSizeMB: 0.5,
                    maxWidthOrHeight: 1024,
                    useWebWorker: true
                };
                const compressedFile = await imageCompression(file, options);
                
                const base64String = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(compressedFile);
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = error => reject(error);
                });
                charData.imageB64 = base64String;
            } else if (isCreating) {
                charData.imageB64 = null;
            }

            charData.ownerUID = currentUser.uid;
            charData.firstName = document.getElementById('first-name').value.trim();
            charData.middleName = document.getElementById('middle-name').value.trim();
            charData.lastName = document.getElementById('last-name').value.trim();
            
            if (isCreating) {
                charData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            }
            charData.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
            
            await db.collection('characters').doc(charId).set(charData, { merge: true });

            currentlyEditingId = null;
            addCharForm.reset();
            imagePreviewBox.style.backgroundImage = 'none';
            imagePreviewBox.innerHTML = '<i class="fas fa-camera"></i><span>Add Photo</span>';
            await loadCharacters();
            closeModal(addModal);

        } catch (error) {
            console.error("Error saving character: ", error);
            if (error.toString().includes("is larger than 1048576 bytes")) {
                 alert("เกิดข้อผิดพลาด: รูปภาพมีขนาดใหญ่เกินไปแม้จะบีบอัดแล้ว กรุณาใช้รูปภาพอื่น");
            } else {
                 alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล: " + error.message);
            }
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Save Character';
        }
    });

    confirmDeleteBtn.addEventListener('click', async () => {
        if (!characterIdToDelete || !currentUser) return;
        try {
            await db.collection('characters').doc(characterIdToDelete).delete();
            characterIdToDelete = null;
            await loadCharacters();
            closeModal(deleteModal);
        } catch (error) {
            console.error("Error deleting character: ", error);
            alert("เกิดข้อผิดพลาดในการลบตัวละคร");
        }
    });

    // =================================================================
    // ========== UI & MODAL EVENT LISTENERS ===========================
    // =================================================================
    const openModal = (modal) => modal.style.display = 'flex';
    const closeModal = (modal) => modal.style.display = 'none';

    const toggleSidebar = () => {
        sidebar.classList.toggle('open');
        sidebarOverlay.classList.toggle('open');
    };
    hamburgerBtn.addEventListener('click', toggleSidebar);
    sidebarOverlay.addEventListener('click', toggleSidebar);

    addCharBtn.addEventListener('click', () => {
        currentlyEditingId = null;
        addCharForm.reset();
        imagePreviewBox.style.backgroundImage = 'none';
        imagePreviewBox.innerHTML = '<i class="fas fa-camera"></i><span>Add Photo</span>';
        document.getElementById('modal-title').textContent = 'Create New Character';
        addCharForm.className = 'create-mode';
        openModal(addModal);
    });

    characterContainer.addEventListener('click', (e) => {
        const card = e.target.closest('.character-card');
        if (!card) return;
        const charId = card.dataset.id;
        
        if (isEditMode) {
            if (e.target.classList.contains('delete-char-btn')) {
                characterIdToDelete = charId;
                openModal(deleteModal);
            }
            // Add your quick-edit logic here (e.g., open a simplified modal)
        } else {
            // Add your book-view logic here
            console.log("Open book view for:", charId);
        }
    });

    toggleEditBtn.addEventListener('click', () => {
        isEditMode = !isEditMode;
        characterContainer.classList.toggle('edit-mode', isEditMode);
        toggleEditBtn.classList.toggle('active', isEditMode);
    });

    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(modal);
        });
        const closeBtn = modal.querySelector('.close-btn, #cancel-delete-btn');
        if (closeBtn) closeBtn.addEventListener('click', () => closeModal(modal));
    });

    // Initial UI setup
    updateAuthUI();
});