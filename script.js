document.addEventListener('DOMContentLoaded', () => {
    const addCharacterBtn = document.getElementById('addCharacterBtn');
    const addCharacterModal = document.getElementById('addCharacterModal');
    const closeButtons = document.querySelectorAll('.close-button');
    const characterForm = document.getElementById('characterForm');
    const characterImageInput = document.getElementById('characterImage');
    const characterFirstNameInput = document.getElementById('characterFirstName');
    const characterMiddleNameInput = document.getElementById('characterMiddleName');
    const characterLastNameInput = document.getElementById('characterLastName');
    const saveCharacterBtn = document.getElementById('saveCharacterBtn');
    const characterContainer = document.getElementById('characterContainer');
    const imagePreview = document.getElementById('imagePreview');

    // User Profile Elements
    const userProfileModal = document.getElementById('userProfileModal');
    const closeProfileModalBtn = document.getElementById('closeProfileModal');
    const userProfileForm = document.getElementById('userProfileForm');
    const profileImageInput = document.getElementById('profileImageInput');
    const profileImagePreview = document.getElementById('profileImagePreview');
    const profileNameInput = document.getElementById('profileName');
    const profileNicknameInput = document.getElementById('profileNickname');
    const profileAgeRadios = document.querySelectorAll('input[name="profileAge"]');
    const saveProfileBtn = document.getElementById('saveProfileBtn');

    // Sidebar Elements
    const menuIcon = document.getElementById('menuIcon');
    const sidebar = document.getElementById('sidebar');
    const closeSidebarButton = document.querySelector('.close-sidebar-button');
    const sidebarProfileImage = document.getElementById('sidebarProfileImage');
    const sidebarProfileName = document.getElementById('sidebarProfileName');
    const sidebarProfileNickname = document.getElementById('sidebarProfileNickname');
    const sidebarProfileAge = document.getElementById('sidebarProfileAge');
    const editProfileBtn = document.getElementById('editProfileBtn');
    const feedbackBtn = document.getElementById('feedbackBtn');

    // New: Edit Mode Elements
    const editModeToggle = document.getElementById('editModeToggle');
    let isEditMode = false; // State for edit mode

    let characters = JSON.parse(localStorage.getItem('characters')) || []; // Load characters from local storage
    let userProfile = JSON.parse(localStorage.getItem('userProfile')) || null;
    let isInitialProfileSetup = false;

    // Helper function to capitalize the first letter of each word
    function capitalizeWords(str) {
        if (!str) return '';
        return str.split(' ').map(word => {
            if (word.length === 0) return '';
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }).join(' ');
    }

    // --- User Profile Functions ---

    function openProfileModal(isInitial = false) {
        userProfileModal.style.display = 'flex';
        isInitialProfileSetup = isInitial;

        if (userProfile) {
            if (userProfile.image) {
                profileImagePreview.innerHTML = `<img src="${userProfile.image}" alt="Profile Preview">`;
            } else {
                profileImagePreview.innerHTML = '';
            }
            profileNameInput.value = userProfile.name || '';
            profileNicknameInput.value = userProfile.nickname || '';
            profileAgeRadios.forEach(radio => {
                if (radio.value === userProfile.age) {
                    radio.checked = true;
                }
            });
        } else {
            if (isInitial) {
                userProfileForm.reset();
                profileImagePreview.innerHTML = '';
                profileAgeRadios.forEach(radio => radio.checked = false);
            }
        }
        if (isInitialProfileSetup) {
            closeProfileModalBtn.style.display = 'none';
        } else {
            closeProfileModalBtn.style.display = 'block';
        }
    }

    function closeProfileModal() {
        userProfileModal.style.display = 'none';
    }

    profileImageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                profileImagePreview.innerHTML = `<img src="${e.target.result}" alt="Profile Preview">`;
            };
            reader.readAsDataURL(file);
        } else {
            profileImagePreview.innerHTML = '';
        }
    });

    userProfileForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const name = profileNameInput.value.trim();
        const nickname = profileNicknameInput.value.trim();
        const age = document.querySelector('input[name="profileAge"]:checked')?.value;
        const imageFile = profileImageInput.files[0];

        if (name === '') {
            alert('Please enter your name.');
            return;
        }
        if (!age) {
            alert('Please select your age group.');
            return;
        }

        const saveProfileData = (imageUrl = userProfile ? userProfile.image : null) => {
            userProfile = {
                name: name,
                nickname: nickname,
                age: age,
                image: imageUrl
            };
            localStorage.setItem('userProfile', JSON.stringify(userProfile)); // Save to local storage
            updateSidebarProfile();
            closeProfileModal();
            isInitialProfileSetup = false;
        };

        if (imageFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                saveProfileData(e.target.result);
            };
            reader.readAsDataURL(imageFile);
        } else {
            saveProfileData();
        }
    });

    // --- Sidebar Functions ---
    function openSidebar() {
        sidebar.classList.add('active');
    }

    function closeSidebar() {
        sidebar.classList.remove('active');
    }

    function updateSidebarProfile() {
        if (userProfile) {
            if (userProfile.image) {
                sidebarProfileImage.innerHTML = `<img src="${userProfile.image}" alt="Profile Picture">`;
            } else {
                sidebarProfileImage.innerHTML = '<i class="fas fa-user-circle"></i>';
            }
            sidebarProfileName.textContent = userProfile.name;
            sidebarProfileNickname.textContent = userProfile.nickname ? `(${userProfile.nickname})` : '';
            sidebarProfileAge.textContent = userProfile.age === 'under18' ? 'Under 18' : '18 or Over';
        } else {
            sidebarProfileImage.innerHTML = '<i class="fas fa-user-circle"></i>';
            sidebarProfileName.textContent = 'Guest';
            sidebarProfileNickname.textContent = '';
            sidebarProfileAge.textContent = '';
        }
    }

    // --- Character Management Functions ---

    // Function to render characters on the main screen
    function renderCharacters() {
        characterContainer.innerHTML = '';
        characters.forEach(character => {
            const characterCard = document.createElement('div');
            characterCard.classList.add('character-card');
            characterCard.dataset.id = character.id; // Store character ID

            const capitalizedName = capitalizeWords(character.name);

            characterCard.innerHTML = `
                <img src="${character.image}" alt="${capitalizedName}">
                <p>${capitalizedName}</p>
                <button class="delete-character-btn ${isEditMode ? 'active' : ''}">-</button>
            `;
            characterContainer.appendChild(characterCard);
        });

        // Attach event listeners for delete buttons (after rendering)
        document.querySelectorAll('.delete-character-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const charId = event.target.closest('.character-card').dataset.id;
                deleteCharacter(charId);
            });
        });
    }

    // Function to delete a character
    function deleteCharacter(id) {
        characters = characters.filter(char => char.id != id); // Filter out the deleted character
        localStorage.setItem('characters', JSON.stringify(characters)); // Update local storage
        renderCharacters(); // Re-render characters
    }

    // --- Event Listeners ---

    // Initial check for user profile
    if (!userProfile) {
        openProfileModal(true);
    } else {
        updateSidebarProfile();
    }

    // Open Add Character Modal
    addCharacterBtn.addEventListener('click', () => {
        addCharacterModal.style.display = 'flex';
        characterForm.reset();
        imagePreview.innerHTML = '';
        imagePreview.style.backgroundImage = 'none';
    });

    // Close Modals using the 'X' button
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modalId = button.dataset.modal;
            if (modalId === 'userProfileModal' && isInitialProfileSetup) {
                return;
            }
            document.getElementById(modalId).style.display = 'none';
        });
    });

    // Close modal if clicked outside of it
    window.addEventListener('click', (event) => {
        if (event.target == addCharacterModal) {
            addCharacterModal.style.display = 'none';
        }
        if (event.target == userProfileModal && !isInitialProfileSetup) {
            userProfileModal.style.display = 'none';
        }
        if (sidebar.classList.contains('active') && !sidebar.contains(event.target) && event.target !== menuIcon && event.target !== editModeToggle && event.target !== addCharacterBtn) {
            closeSidebar();
        }
    });

    // Handle character image preview
    characterImageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="Image Preview">`;
            };
            reader.readAsDataURL(file);
        } else {
            imagePreview.innerHTML = '';
        }
    });

    // Handle saving a new character
    characterForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const firstName = characterFirstNameInput.value.trim();
        const middleName = characterMiddleNameInput.value.trim();
        const lastName = characterLastNameInput.value.trim();
        const imageFile = characterImageInput.files[0];

        if (firstName === '') {
            alert('Please enter a first name for the character.');
            return;
        }

        if (!imageFile) {
            alert('Please select a character image.');
            return;
        }

        const fullNameParts = [firstName, middleName, lastName].filter(Boolean);
        const fullName = fullNameParts.join(' ');

        const reader = new FileReader();
        reader.onload = (e) => {
            const imageUrl = e.target.result;
            const newCharacter = {
                id: Date.now(), // Unique ID for each character
                name: fullName,
                image: imageUrl
            };
            characters.push(newCharacter);
            localStorage.setItem('characters', JSON.stringify(characters)); // Save to local storage
            renderCharacters();
            addCharacterModal.style.display = 'none';
            characterForm.reset();
            imagePreview.innerHTML = '';
        };
        reader.readAsDataURL(imageFile);
    });

    // Sidebar event listeners
    menuIcon.addEventListener('click', openSidebar);
    closeSidebarButton.addEventListener('click', closeSidebar);
    editProfileBtn.addEventListener('click', () => {
        closeSidebar();
        openProfileModal(false);
    });
    
    feedbackBtn.addEventListener('click', () => {
        closeSidebar();
        window.open('https://forms.gle/m1WiWmdJSwUxPcLPA', '_blank');
    });

    // New: Edit Mode Toggle
    editModeToggle.addEventListener('click', () => {
        isEditMode = !isEditMode; // Toggle edit mode state
        // Toggle active class on delete buttons for all characters
        document.querySelectorAll('.delete-character-btn').forEach(button => {
            if (isEditMode) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    });

    renderCharacters(); // Initial render for characters
});