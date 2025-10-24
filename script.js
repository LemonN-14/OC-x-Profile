document.addEventListener('DOMContentLoaded', () => {
    const addCharacterBtn = document.getElementById('addCharacterBtn');
    const addCharacterModal = document.getElementById('addCharacterModal');
    const characterModalTitle = document.getElementById('characterModalTitle');
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

    // Edit Mode Elements
    const editModeToggle = document.getElementById('editModeToggle');
    let isEditMode = false; // State for edit mode
    let editingCharacterId = null; // To store the ID of the character being edited

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

    // Function to parse full name back into parts (best effort)
    function parseFullName(fullName) {
        const parts = fullName.split(' ').filter(Boolean);
        let firstName = '';
        let middleName = '';
        let lastName = '';

        if (parts.length === 1) {
            firstName = parts[0];
        } else if (parts.length === 2) {
            firstName = parts[0];
            lastName = parts[1];
        } else if (parts.length >= 3) {
            firstName = parts[0];
            middleName = parts.slice(1, -1).join(' '); // All parts between first and last
            lastName = parts[parts.length - 1];
        }
        return { firstName, middleName, lastName };
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
        // Prevent closing if it's the initial setup
        if (isInitialProfileSetup) {
            return;
        }
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
            closeProfileModal(); // This will now properly close the modal
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
            sidebarProfileAge.textContent = userProfile.age === '18↓' ? 'Under 18' : '18↑';
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
                <button class="edit-character-btn ${isEditMode ? 'active' : ''}"><i class="fas fa-pencil-alt"></i></button>
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

        // Attach event listeners for edit buttons (after rendering)
        document.querySelectorAll('.edit-character-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const charId = event.target.closest('.character-card').dataset.id;
                openEditCharacterModal(charId);
            });
        });
    }

    // Function to delete a character
    function deleteCharacter(id) {
        characters = characters.filter(char => char.id != id); // Filter out the deleted character
        localStorage.setItem('characters', JSON.stringify(characters)); // Update local storage
        renderCharacters(); // Re-render characters
    }

    // Function to open the character modal for editing
    function openEditCharacterModal(id) {
        editingCharacterId = id;
        const character = characters.find(char => char.id == id);

        if (character) {
            characterModalTitle.textContent = 'Edit Character'; // Change modal title
            saveCharacterBtn.textContent = 'Update Character'; // Change button text
            addCharacterModal.style.display = 'flex';

            // Populate form fields
            const { firstName, middleName, lastName } = parseFullName(character.name);
            characterFirstNameInput.value = firstName;
            characterMiddleNameInput.value = middleName;
            characterLastNameInput.value = lastName;
            
            // Display current image
            if (character.image) {
                imagePreview.innerHTML = `<img src="${character.image}" alt="Image Preview">`;
            } else {
                imagePreview.innerHTML = '';
            }
            characterImageInput.value = ''; // Clear file input for new selection
        }
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
        editingCharacterId = null; // Clear editing state
        characterModalTitle.textContent = 'Add New Character'; // Reset modal title
        saveCharacterBtn.textContent = 'Save Character'; // Reset button text
        addCharacterModal.style.display = 'flex';
        characterForm.reset();
        imagePreview.innerHTML = '';
        imagePreview.style.backgroundImage = 'none'; // Ensure no background image
    });

    // Close Modals using the 'X' button
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modalId = button.dataset.modal;
            if (modalId === 'userProfileModal') { // Check if it's the user profile modal
                closeProfileModal(); // Use the closeProfileModal function
            } else {
                document.getElementById(modalId).style.display = 'none';
            }
        });
    });

    // Close modal if clicked outside of it
    window.addEventListener('click', (event) => {
        if (event.target == addCharacterModal) {
            addCharacterModal.style.display = 'none';
        }
        // Use closeProfileModal for consistency
        if (event.target == userProfileModal) {
            closeProfileModal();
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
            // If no file selected, and we are editing, show the old image again
            if (editingCharacterId) {
                const character = characters.find(char => char.id == editingCharacterId);
                if (character && character.image) {
                     imagePreview.innerHTML = `<img src="${character.image}" alt="Image Preview">`;
                }
            }
        }
    });

    // Handle saving a new character or updating an existing one
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

        const fullNameParts = [firstName, middleName, lastName].filter(Boolean);
        const fullName = fullNameParts.join(' ');

        // Function to save/update character data
        const saveCharacterData = (imageUrl) => {
            if (editingCharacterId) {
                // Update existing character
                characters = characters.map(char => {
                    if (char.id == editingCharacterId) {
                        return { ...char, name: fullName, image: imageUrl };
                    }
                    return char;
                });
            } else {
                // Add new character
                if (!imageUrl) { // Only check for image on new character creation
                    alert('Please select a character image.');
                    return;
                }
                const newCharacter = {
                    id: Date.now(),
                    name: fullName,
                    image: imageUrl
                };
                characters.push(newCharacter);
            }
            localStorage.setItem('characters', JSON.stringify(characters));
            renderCharacters();
            addCharacterModal.style.display = 'none';
            characterForm.reset();
            imagePreview.innerHTML = '';
            editingCharacterId = null; // Clear editing state after save
        };

        if (imageFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                saveCharacterData(e.target.result);
            };
            reader.readAsDataURL(imageFile);
        } else {
            // If no new image selected during edit, use the existing image
            if (editingCharacterId) {
                const existingCharacter = characters.find(char => char.id == editingCharacterId);
                saveCharacterData(existingCharacter ? existingCharacter.image : null);
            } else {
                // If adding a new character and no image file, alert
                saveCharacterData(null); // This will potentially trigger the alert inside saveCharacterData for new characters
            }
        }
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

    // Edit Mode Toggle
    editModeToggle.addEventListener('click', () => {
        isEditMode = !isEditMode;
        document.querySelectorAll('.delete-character-btn').forEach(button => {
            if (isEditMode) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        document.querySelectorAll('.edit-character-btn').forEach(button => {
            if (isEditMode) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    });

    // Initial render of characters when the page loads
    renderCharacters();
});