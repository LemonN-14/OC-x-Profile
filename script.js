document.addEventListener('DOMContentLoaded', () => {
    // ========== ELEMENT SELECTIONS ==========
    const addCharBtn = document.getElementById('add-char-btn'),
          toggleEditBtn = document.getElementById('toggle-edit-btn'),
          characterContainer = document.getElementById('character-container'),
          hamburgerBtn = document.getElementById('hamburger-btn'),
          // ADDED: Sidebar elements
          sidebar = document.getElementById('sidebar'),
          sidebarOverlay = document.getElementById('sidebar-overlay'),
          feedbackBtn = document.getElementById('feedback-btn');

    const addModal = document.getElementById('add-char-modal'),
          addCharForm = document.getElementById('add-char-form'),
          modalTitle = document.getElementById('modal-title'),
          charImageInput = document.getElementById('char-image-input'),
          imagePreviewBox = document.getElementById('image-preview-box'),
          firstNameInput = document.getElementById('first-name'),
          middleNameInput = document.getElementById('middle-name'),
          lastNameInput = document.getElementById('last-name'),
          tabButtons = addModal.querySelectorAll('.tab-button'),
          tabContents = addModal.querySelectorAll('.tab-content'),
          customFieldsContainer = document.getElementById('custom-fields-container'),
          addFieldBtn = document.getElementById('add-field-btn'),
          backgroundStoryInput = document.getElementById('character-background'),
          enableYumeShipCheck = document.getElementById('enable-yumeship'),
          yumeShipDetailsText = document.getElementById('yumeship-details'),
          yumeShipTagInput = document.getElementById('yumeship-tag'),
          yumeShipImg1Input = document.getElementById('yumeship-img-1-input'),
          yumeShipImg1Preview = document.getElementById('yumeship-img-1-preview'),
          yumeShipImg2Input = document.getElementById('yumeship-img-2-input'),
          yumeShipImg2Preview = document.getElementById('yumeship-img-2-preview'),
          yumeShipSongArtInput = document.getElementById('yumeship-song-art-input'),
          yumeShipSongArtPreview = document.getElementById('yumeship-song-art-preview'),
          yumeShipSongTitleInput = document.getElementById('yumeship-song-title');

    const deleteModal = document.getElementById('delete-confirm-modal'),
          confirmDeleteBtn = document.getElementById('confirm-delete-btn'),
          cancelDeleteBtn = document.getElementById('cancel-delete-btn');

    const bookModal = document.getElementById('book-view-modal'),
          bookManageBtn = bookModal.querySelector('.book-manage-btn'),
          bookProfileContent = document.getElementById('book-profile-content'),
          bookBackgroundContent = document.getElementById('book-background-content'),
          bookYumeShipContent = document.getElementById('book-yumeship-content'),
          bookCharName = document.getElementById('book-character-name'),
          bookCharImage = document.getElementById('book-character-image'),
          bookCustomFieldsContainer = document.getElementById('book-custom-fields-container'),
          bookBackgroundDetails = document.getElementById('book-background-details'),
          bookYumeShipTagBubble = document.getElementById('book-yumeship-tag-bubble'),
          bookYumeShipImg1 = document.getElementById('book-yumeship-img-1'),
          bookYumeShipImg2 = document.getElementById('book-yumeship-img-2'),
          bookYumeShipDetails = document.getElementById('book-yumeship-details'),
          bookYumeShipSongArt = document.getElementById('book-yumeship-song-art'),
          bookYumeShipSongTitle = document.getElementById('book-yumeship-song-title'),
          prevPageBtn = document.getElementById('prev-page-btn'),
          nextPageBtn = document.getElementById('next-page-btn'),
          pageIndicator = document.getElementById('page-indicator');

    // ========== STATE MANAGEMENT ==========
    let characters = [], isEditMode = false, currentlyEditingId = null, characterIdToDelete = null, characterIdForBookView = null, currentBookSpread = 0, totalSpreads = 1;

    // ========== LOCAL STORAGE (with Error Handling) ==========
    const saveCharacters = () => {
        try { localStorage.setItem('ocProfileCharacters', JSON.stringify(characters)); } catch (error) { console.error("Error saving to localStorage:", error); alert("ไม่สามารถบันทึกข้อมูลได้ เนื่องจากพื้นที่จัดเก็บอาจเต็ม"); }
    };
    const loadCharacters = () => {
        const saved = localStorage.getItem('ocProfileCharacters');
        if (saved) { try { const parsed = JSON.parse(saved); if (Array.isArray(parsed)) { characters = parsed; } else { characters = []; } } catch (e) { console.error("Error parsing localStorage data:", e); characters = []; } } else { characters = []; }
    };

    // ========== CORE FUNCTIONS ==========
    const renderCharacters = () => {
        characterContainer.innerHTML = '';
        characters.forEach(char => {
            const card = document.createElement('div');
            card.className = 'character-card';
            card.dataset.id = char.id;
            const fullName = [char.firstName, char.middleName, char.lastName].filter(Boolean).join(' ');
            card.innerHTML = `<div class="card-overlay-icons"><i class="fas fa-pencil-alt edit-char-btn"></i><i class="fas fa-trash-alt delete-char-btn"></i></div>${char.imageSrc ? `<img src="${char.imageSrc}" alt="${fullName}" class="char-image">` : `<div class="char-image-placeholder"></div>`}<div class="char-name">${fullName || 'Unnamed'}</div>`;
            characterContainer.appendChild(card);
        });
    };
    const openModal = (modal) => modal.style.display = 'flex';
    const closeModal = (modal) => modal.style.display = 'none';
    const addCustomFieldInput = (label = '', value = '') => {
        const div = document.createElement('div');
        div.className = 'custom-field-pair';
        div.innerHTML = `<input type="text" placeholder="Label" value="${label}"><input type="text" placeholder="Value" value="${value}"><button type="button" class="remove-field-btn">-</button>`;
        customFieldsContainer.appendChild(div);
    };

    const populateModal = (charId, mode = 'full') => {
        const isCreating = !charId;
        const char = isCreating ? {} : characters.find(c => c.id === charId);
        if (!char && !isCreating) return;

        currentlyEditingId = charId;
        addCharForm.dataset.mode = mode;

        addCharForm.reset();
        [imagePreviewBox, yumeShipImg1Preview, yumeShipImg2Preview, yumeShipSongArtPreview].forEach(el => el.style.backgroundImage = 'none');
        imagePreviewBox.innerHTML = '<i class="fas fa-camera"></i><span>Add Photo</span>';
        customFieldsContainer.innerHTML = '';
        
        if (mode === 'simple') {
            modalTitle.textContent = isCreating ? 'Create New Character' : 'Edit Name & Photo';
        } else {
            modalTitle.textContent = 'Edit Character Details';
        }
        
        if (!isCreating) {
            if (char.imageSrc) { imagePreviewBox.style.backgroundImage = `url('${char.imageSrc}')`; imagePreviewBox.innerHTML = ''; }
            firstNameInput.value = char.firstName || '';
            middleNameInput.value = char.middleName || '';
            lastNameInput.value = char.lastName || '';
            if (char.customFields) char.customFields.forEach(f => addCustomFieldInput(f.label, f.value));
            backgroundStoryInput.value = char.backgroundStory || '';
            const ys = char.yumeShip || {};
            enableYumeShipCheck.checked = ys.enabled || false;
            yumeShipTagInput.value = ys.tag || '';
            yumeShipDetailsText.value = ys.details || '';
            yumeShipSongTitleInput.value = ys.songTitle || '';
            if (ys.img1Src) yumeShipImg1Preview.style.backgroundImage = `url('${ys.img1Src}')`;
            if (ys.img2Src) yumeShipImg2Preview.style.backgroundImage = `url('${ys.img2Src}')`;
            if (ys.songArtSrc) yumeShipSongArtPreview.style.backgroundImage = `url('${ys.songArtSrc}')`;
        }
        
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        document.querySelector('.tab-button[data-tab="profile-tab"]').classList.add('active');
        document.getElementById('profile-tab').classList.add('active');

        openModal(addModal);
    };

    const renderBookContent = () => {
        const char = characters.find(c => c.id === characterIdForBookView);
        if (!char) return;
        
        [bookProfileContent, bookBackgroundContent, bookYumeShipContent].forEach(el => el.style.display = 'none');
        bookPageRight.classList.remove('empty');

        if (currentBookSpread === 0) {
            bookProfileContent.style.display = 'block';
            bookBackgroundContent.style.display = 'block';
            bookCharName.textContent = [char.firstName, char.middleName, char.lastName].filter(Boolean).join(' ') || 'Unnamed';
            bookCharImage.src = char.imageSrc || '';
            bookCharImage.style.display = char.imageSrc ? 'block' : 'none';
            bookCustomFieldsContainer.innerHTML = '<h4>Profile Details</h4>';
            if (char.customFields?.length) {
                char.customFields.forEach(f => { if (f.label || f.value) bookCustomFieldsContainer.innerHTML += `<div class="book-custom-field"><strong>${f.label}:</strong><span>${f.value}</span></div>`; });
            } else {
                bookCustomFieldsContainer.innerHTML += '<p>No details added.</p>';
            }
            bookBackgroundDetails.textContent = char.backgroundStory || 'ยังไม่มีการเพิ่มประวัติตัวละคร';
        } else if (currentBookSpread === 1) {
            bookYumeShipContent.style.display = 'block';
            bookPageRight.classList.add('empty');
            const ys = char.yumeShip || {};
            bookYumeShipTagBubble.textContent = ys.tag ? `#${ys.tag}` : '#ชื่อคู่ชิป';
            bookYumeShipImg1.style.backgroundImage = ys.img1Src ? `url('${ys.img1Src}')` : 'none';
            bookYumeShipImg2.style.backgroundImage = ys.img2Src ? `url('${ys.img2Src}')` : 'none';
            bookYumeShipDetails.textContent = ys.details || '';
            bookYumeShipSongArt.style.backgroundImage = ys.songArtSrc ? `url('${ys.songArtSrc}')` : 'none';
            const songTitle = ys.songTitle || '(ชื่อเพลง)';
            bookYumeShipSongTitle.textContent = songTitle;
            const titleWrapper = bookYumeShipSongTitle.parentElement;
            bookYumeShipSongTitle.classList.remove('scrolling');
            setTimeout(() => { if (bookYumeShipSongTitle.scrollWidth > titleWrapper.clientWidth) { bookYumeShipSongTitle.classList.add('scrolling'); } }, 50);
        }
        pageIndicator.textContent = `Page ${currentBookSpread === 0 ? '1-2' : '3'}`;
        prevPageBtn.disabled = (currentBookSpread === 0);
        nextPageBtn.disabled = (currentBookSpread >= totalSpreads - 1);
    };
    const openBookView = (charId) => {
        const char = characters.find(c => c.id === charId);
        if (!char) return;
        characterIdForBookView = charId;
        currentBookSpread = 0;
        totalSpreads = (char.yumeShip?.enabled) ? 2 : 1;
        renderBookContent();
        openModal(bookModal);
    };
    const setupImagePreview = (inputEl, previewEl) => {
        inputEl.addEventListener('change', e => {
            const file = e.target.files[0];
            if (file) { const reader = new FileReader(); reader.onload = (event) => { previewEl.style.backgroundImage = `url('${event.target.result}')`; if(previewEl === imagePreviewBox) { previewEl.innerHTML = ''; } }; reader.readAsDataURL(file); }
        });
    };

    // ========== EVENT LISTENERS ==========
    setupImagePreview(charImageInput, imagePreviewBox);
    setupImagePreview(yumeShipImg1Input, yumeShipImg1Preview);
    setupImagePreview(yumeShipImg2Input, yumeShipImg2Preview);
    setupImagePreview(yumeShipSongArtInput, yumeShipSongArtPreview);

    addCharBtn.addEventListener('click', () => populateModal(null, 'simple'));
    toggleEditBtn.addEventListener('click', () => { isEditMode = !isEditMode; characterContainer.classList.toggle('edit-mode', isEditMode); toggleEditBtn.classList.toggle('active', isEditMode); });
    
    /** MODIFIED: Hamburger menu functionality to open sidebar */
    hamburgerBtn.addEventListener('click', () => {
        sidebar.classList.add('open');
        sidebarOverlay.classList.add('active');
    });

    // ADDED: Listeners to close the sidebar
    sidebarOverlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('active');
    });

    feedbackBtn.addEventListener('click', () => {
        const feedbackUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSdHEcU5PtZLMZz70pVrZKynPZLSX1RHaPRkYVt0Q76t3-c3qQ/viewform?usp=sharing&ouid=104875927931523926271';
        window.open(feedbackUrl, '_blank');
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('active');
    });


    cancelDeleteBtn.addEventListener('click', () => closeModal(deleteModal));
    window.addEventListener('click', e => { if (e.target.classList.contains('modal-overlay')) closeModal(e.target); });

    bookManageBtn.addEventListener('click', () => { if (characterIdForBookView) { closeModal(bookModal); populateModal(characterIdForBookView, 'full'); } });
    
    prevPageBtn.addEventListener('click', () => { if (currentBookSpread > 0) { currentBookSpread--; renderBookContent(); } });
    nextPageBtn.addEventListener('click', () => { if (currentBookSpread < totalSpreads - 1) { currentBookSpread++; renderBookContent(); } });
    tabButtons.forEach(button => button.addEventListener('click', () => { tabButtons.forEach(btn => btn.classList.remove('active')); tabContents.forEach(content => content.classList.remove('active')); button.classList.add('active'); document.getElementById(button.dataset.tab).classList.add('active'); }));
    customFieldsContainer.addEventListener('click', e => { if (e.target.classList.contains('remove-field-btn')) e.target.parentElement.remove(); });
    addFieldBtn.addEventListener('click', () => addCustomFieldInput());

    characterContainer.addEventListener('click', e => {
        const card = e.target.closest('.character-card');
        if (!card) return;
        const charId = card.dataset.id;
        if (isEditMode) {
            if (e.target.classList.contains('delete-char-btn')) { characterIdToDelete = charId; openModal(deleteModal); }
            else if (e.target.classList.contains('edit-char-btn')) { populateModal(charId, 'simple'); }
        } else { openBookView(charId); }
    });
    
    confirmDeleteBtn.addEventListener('click', () => {
        if (characterIdToDelete) {
            characters = characters.filter(char => char.id !== characterIdToDelete);
            saveCharacters(); renderCharacters(); closeModal(deleteModal); characterIdToDelete = null;
        }
    });

    addCharForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const mode = addCharForm.dataset.mode;
        const isCreating = !currentlyEditingId;
        const index = isCreating ? -1 : characters.findIndex(c => c.id === currentlyEditingId);
        let charData = (index !== -1) ? { ...characters[index] } : { id: Date.now().toString() };

        if (mode === 'simple') {
            charData.firstName = firstNameInput.value.trim();
            charData.middleName = middleNameInput.value.trim();
            charData.lastName = lastNameInput.value.trim();
            const newImageSrc = imagePreviewBox.style.backgroundImage.slice(5, -2).replace(/"/g, "");
            if (newImageSrc && newImageSrc.startsWith('data:image')) {
                charData.imageSrc = newImageSrc;
            }
            if (isCreating) {
                charData.customFields = [];
                charData.backgroundStory = '';
                charData.yumeShip = {
                    enabled: false, details: '', tag: '', songTitle: '',
                    img1Src: null, img2Src: null, songArtSrc: null,
                };
            }
        } else {
            const customFields = [];
            customFieldsContainer.querySelectorAll('.custom-field-pair').forEach(p => {
                const l = p.children[0].value.trim(), v = p.children[1].value.trim();
                if (l || v) customFields.push({ label: l, value: v });
            });
            charData.customFields = customFields;
            charData.backgroundStory = backgroundStoryInput.value.trim();
            const getImgSrc = (previewEl, oldSrc) => {
                const bg = previewEl.style.backgroundImage;
                return bg.startsWith('url("data:image') ? bg.slice(5, -2) : oldSrc;
            };
            charData.yumeShip = {
                ...(charData.yumeShip || {}),
                enabled: enableYumeShipCheck.checked,
                details: yumeShipDetailsText.value.trim(),
                tag: yumeShipTagInput.value.trim().replace(/^#/, ''),
                songTitle: yumeShipSongTitleInput.value.trim(),
                img1Src: getImgSrc(yumeShipImg1Preview, charData.yumeShip?.img1Src),
                img2Src: getImgSrc(yumeShipImg2Preview, charData.yumeShip?.img2Src),
                songArtSrc: getImgSrc(yumeShipSongArtPreview, charData.yumeShip?.songArtSrc),
            };
        }

        if (index !== -1) { characters[index] = charData; } else { characters.push(charData); }
        saveCharacters();
        renderCharacters();

        if (bookModal.style.display === 'flex' && currentlyEditingId === characterIdForBookView) {
            totalSpreads = (charData.yumeShip?.enabled) ? 2 : 1;
            if (currentBookSpread >= totalSpreads) currentBookSpread = totalSpreads - 1;
            renderBookContent();
        }
        
        closeModal(addModal);
        currentlyEditingId = null;
    });

    // ========== INITIAL LOAD ==========
    loadCharacters();
    renderCharacters();
});