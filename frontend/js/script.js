// API Configuration
const API_BASE = "http://localhost:8080/api/auth";

// Common Toast Notification Helper
function showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = "premium-toast";
    if (type === "error") {
        toast.style.borderColor = "var(--accent)";
    } else if (type === "success") {
        toast.style.borderColor = "var(--secondary)";
    }

    // Dynamic icon selection
    const icon = type === "success" ? "✓" : type === "error" ? "⚠" : "ℹ";
    toast.innerHTML = `<span style="font-weight: 800; font-size: 1.1rem; color: ${type === 'success' ? 'var(--secondary)' : type === 'error' ? 'var(--accent)' : 'var(--primary)'}">${icon}</span> <span>${message}</span>`;
    
    container.appendChild(toast);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        toast.style.animation = "slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) reverse forwards";
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// -------------------------------------------------------------
// Auth Logic (Login / Register)
// -------------------------------------------------------------

// Form Submission: Register
const registerForm = document.getElementById("registerForm");
if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("registerName").value.trim();
        const email = document.getElementById("registerEmail").value.trim();
        const password = document.getElementById("registerPassword").value;
        const submitBtn = document.getElementById("registerBtn");

        submitBtn.disabled = true;
        submitBtn.innerHTML = "Creating account...";

        try {
            const response = await fetch(`${API_BASE}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                showToast("Account created successfully! Redirecting to login...", "success");
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 1500);
            } else {
                showToast(data.message || "Registration failed. Try again.", "error");
                submitBtn.disabled = false;
                submitBtn.innerHTML = "Create Account";
            }
        } catch (error) {
            console.error("Registration error:", error);
            showToast("Cannot connect to authorization server.", "error");
            submitBtn.disabled = false;
            submitBtn.innerHTML = "Create Account";
        }
    });
}

// Form Submission: Login
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;
        const submitBtn = document.getElementById("loginBtn");

        submitBtn.disabled = true;
        submitBtn.innerHTML = "Signing in...";

        try {
            const response = await fetch(`${API_BASE}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                showToast(`Welcome back, ${data.name}!`, "success");
                localStorage.setItem("user", JSON.stringify(data));
                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 1500);
            } else {
                showToast(data.message || "Invalid email or password.", "error");
                submitBtn.disabled = false;
                submitBtn.innerHTML = "Sign In";
            }
        } catch (error) {
            console.error("Login error:", error);
            showToast("Cannot connect to authorization server.", "error");
            submitBtn.disabled = false;
            submitBtn.innerHTML = "Sign In";
        }
    });
}

// -------------------------------------------------------------
// Dashboard logic
// -------------------------------------------------------------
const isDashboard = window.location.pathname.includes("dashboard.html");

if (isDashboard) {
    // Auth Guard
    const userStr = localStorage.getItem("user");
    if (!userStr) {
        window.location.href = "login.html";
    }

    const currentUser = JSON.parse(userStr);
    document.getElementById("userBadge").textContent = currentUser.name;

    // Logout Action
    document.getElementById("logoutBtn").addEventListener("click", () => {
        localStorage.removeItem("user");
        showToast("Signed out successfully", "success");
        setTimeout(() => {
            window.location.href = "login.html";
        }, 1000);
    });

    // -------------------------------------------------------------
    // Mock Data Management
    // -------------------------------------------------------------
    let notes = JSON.parse(localStorage.getItem("mock_notes")) || [
        { id: 1, title: "Database Systems", content: "ACID principles ensure database transactions are processed reliably: Atomicity, Consistency, Isolation, Durability." },
        { id: 2, title: "Operating Systems", content: "A process is a program in execution. Threads are light-weight sub-processes managed by scheduling algorithms." },
        { id: 3, title: "Computer Networks", content: "TCP is a connection-oriented reliable protocol, while UDP is connectionless and faster." }
    ];

    let quizzes = JSON.parse(localStorage.getItem("mock_quizzes")) || [
        { id: 1, title: "Java OOP Core Basics", questions: 5, difficulty: "Easy" },
        { id: 2, title: "Data Structures & Trees", questions: 10, difficulty: "Medium" }
    ];

    let flashcards = JSON.parse(localStorage.getItem("mock_flashcards")) || [
        { id: 1, front: "What is polymorphism?", back: "Providing multiple implementations for a single interface or abstract call." },
        { id: 2, front: "What is encapsulation?", back: "Wrapping code and data together in a single unit using private variables and public getters/setters." }
    ];

    // Update Counts
    function updateCounts() {
        document.getElementById("notesCount").textContent = notes.length;
        document.getElementById("quizzesCount").textContent = quizzes.length;
        document.getElementById("flashcardsCount").textContent = flashcards.length;
    }

    // Render Lists
    function renderNotes() {
        const container = document.getElementById("notesContainer");
        container.innerHTML = "";
        notes.forEach(note => {
            container.innerHTML += `
                <div class="study-item-row">
                    <div>
                        <h6 class="m-0 fw-bold">${note.title}</h6>
                        <p class="text-secondary m-0 mt-1" style="font-size: 0.85rem; max-width: 500px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${note.content}</p>
                    </div>
                    <button class="btn btn-sm btn-outline-danger border-0" onclick="deleteNote(${note.id})">Delete</button>
                </div>
            `;
        });
    }

    window.deleteNote = function(id) {
        notes = notes.filter(n => n.id !== id);
        localStorage.setItem("mock_notes", JSON.stringify(notes));
        renderNotes();
        updateCounts();
        showToast("Note deleted");
    };

    function renderQuizzes() {
        const container = document.getElementById("quizzesContainer");
        container.innerHTML = "";
        quizzes.forEach(quiz => {
            container.innerHTML += `
                <div class="study-item-row">
                    <div>
                        <h6 class="m-0 fw-bold">${quiz.title}</h6>
                        <p class="text-secondary m-0 mt-1" style="font-size: 0.85rem;">${quiz.questions} Questions • Difficulty: <span class="text-info fw-semibold">${quiz.difficulty}</span></p>
                    </div>
                    <button class="btn btn-sm btn-premium py-1 px-3 fs-6" onclick="takeQuiz('${quiz.title}')">Start</button>
                </div>
            `;
        });
    }

    window.takeQuiz = function(title) {
        showToast(`Starting Quiz: ${title}. Get ready!`, "success");
        // Simulated quiz dialog
        setTimeout(() => {
            alert(`Interactive Quiz: "${title}" starts now! (Features simulated)`);
        }, 500);
    };

    function renderFlashcards() {
        const container = document.getElementById("flashcardsContainer");
        container.innerHTML = "";
        flashcards.forEach(card => {
            container.innerHTML += `
                <div class="study-item-row">
                    <div style="flex-grow: 1;">
                        <h6 class="m-0 fw-bold">Q: ${card.front}</h6>
                        <p class="text-secondary m-0 mt-1" id="ans-${card.id}" style="font-size: 0.85rem; display: none;">A: ${card.back}</p>
                    </div>
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-outline-info py-1" onclick="toggleAnswer(${card.id})">Flip</button>
                        <button class="btn btn-sm btn-outline-danger border-0" onclick="deleteFlashcard(${card.id})">×</button>
                    </div>
                </div>
            `;
        });
    }

    window.toggleAnswer = function(id) {
        const ans = document.getElementById(`ans-${id}`);
        if (ans) {
            ans.style.display = ans.style.display === "none" ? "block" : "none";
        }
    };

    window.deleteFlashcard = function(id) {
        flashcards = flashcards.filter(c => c.id !== id);
        localStorage.setItem("mock_flashcards", JSON.stringify(flashcards));
        renderFlashcards();
        updateCounts();
        showToast("Flashcard removed");
    };

    // -------------------------------------------------------------
    // Tab switching
    // -------------------------------------------------------------
    document.querySelectorAll(".study-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            document.querySelectorAll(".study-tab").forEach(t => t.classList.remove("active"));
            document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));

            tab.classList.add("active");
            const targetId = `tab-${tab.getAttribute("data-tab")}`;
            document.getElementById(targetId).classList.add("active");
        });
    });

    // -------------------------------------------------------------
    // Add Item Modals
    // -------------------------------------------------------------
    const itemModalEl = document.getElementById("itemModal");
    let itemModal;
    if (itemModalEl) {
        itemModal = new bootstrap.Modal(itemModalEl);
    }
    let modalMode = "note"; // 'note' or 'flashcard' or 'quiz'

    document.getElementById("addNoteBtn").addEventListener("click", () => {
        modalMode = "note";
        document.getElementById("modalTitle").textContent = "Create New Note";
        document.getElementById("modalFieldLabel").textContent = "Note Title";
        document.getElementById("modalContentLabel").textContent = "Note Content";
        document.getElementById("modalInputTitle").value = "";
        document.getElementById("modalInputContent").value = "";
        itemModal.show();
    });

    document.getElementById("addCardBtn").addEventListener("click", () => {
        modalMode = "flashcard";
        document.getElementById("modalTitle").textContent = "Create Flashcard";
        document.getElementById("modalFieldLabel").textContent = "Question (Front)";
        document.getElementById("modalContentLabel").textContent = "Answer (Back)";
        document.getElementById("modalInputTitle").value = "";
        document.getElementById("modalInputContent").value = "";
        itemModal.show();
    });

    document.getElementById("startQuizBtn").addEventListener("click", () => {
        modalMode = "quiz";
        document.getElementById("modalTitle").textContent = "Generate Custom Quiz";
        document.getElementById("modalFieldLabel").textContent = "Quiz Topic";
        document.getElementById("modalContentLabel").textContent = "Difficulty Level (Easy/Medium/Hard)";
        document.getElementById("modalInputTitle").value = "";
        document.getElementById("modalInputContent").value = "";
        itemModal.show();
    });

    document.getElementById("modalSaveBtn").addEventListener("click", () => {
        const title = document.getElementById("modalInputTitle").value.trim();
        const content = document.getElementById("modalInputContent").value.trim();

        if (!title || !content) {
            showToast("Please fill in all inputs", "error");
            return;
        }

        if (modalMode === "note") {
            const newNote = {
                id: Date.now(),
                title: title,
                content: content
            };
            notes.push(newNote);
            localStorage.setItem("mock_notes", JSON.stringify(notes));
            renderNotes();
            showToast("Note created successfully!", "success");
        } else if (modalMode === "flashcard") {
            const newCard = {
                id: Date.now(),
                front: title,
                back: content
            };
            flashcards.push(newCard);
            localStorage.setItem("mock_flashcards", JSON.stringify(flashcards));
            renderFlashcards();
            showToast("Flashcard added!", "success");
        } else if (modalMode === "quiz") {
            const newQuiz = {
                id: Date.now(),
                title: title,
                questions: Math.floor(Math.random() * 5) + 5,
                difficulty: content
            };
            quizzes.push(newQuiz);
            localStorage.setItem("mock_quizzes", JSON.stringify(quizzes));
            renderQuizzes();
            showToast("Custom quiz generated!", "success");
        }

        updateCounts();
        itemModal.hide();
    });

    // -------------------------------------------------------------
    // AI Chat Buddy Logic
    // -------------------------------------------------------------
    const sendAiBtn = document.getElementById("sendAiBtn");
    const aiChatInput = document.getElementById("aiChatInput");
    const aiChatWindow = document.getElementById("aiChatWindow");

    function sendAiMessage() {
        const query = aiChatInput.value.trim();
        if (!query) return;

        // Append User message
        aiChatWindow.innerHTML += `
            <div class="mb-3 text-end">
                <span class="badge bg-primary mb-1">You</span>
                <div class="p-3 rounded-4 text-start d-inline-block" style="background: rgba(139,92,246,0.15); border: 1px solid rgba(139,92,246,0.3); font-size: 0.9rem; max-width: 85%;">
                    ${query}
                </div>
            </div>
        `;
        aiChatInput.value = "";
        aiChatWindow.scrollTop = aiChatWindow.scrollHeight;

        // Simulated processing response
        setTimeout(() => {
            let reply = "";
            const lowerQuery = query.toLowerCase();

            if (lowerQuery.includes("acid") || lowerQuery.includes("database")) {
                reply = "Great database question! **ACID** properties are key for reliability:\n• **Atomicity**: 'All or nothing' execution.\n• **Consistency**: Database schema rules are strictly enforced.\n• **Isolation**: Parallel transactions run independently.\n• **Durability**: Completed updates persist even during power/system crashes.";
            } else if (lowerQuery.includes("polymorphism") || lowerQuery.includes("oop")) {
                reply = "**Polymorphism** is an object-oriented programming concept that allows method overriding (runtime) and method overloading (compile-time) to let objects act differently under the same interface.";
            } else if (lowerQuery.includes("summarize") || lowerQuery.includes("note")) {
                reply = `Currently, you have **${notes.length} note files** in your repository. The most active topic is **"${notes[0]?.title || 'none'}"**. I recommend creating a new flashcard deck for active recall testing!`;
            } else {
                reply = `I've analyzed your question: *"${query}"*. Here is a quick study summary:\n1. **Core Concept**: Break down this topic into fundamental primitives.\n2. **Active Recall**: Ask yourself what the central constraints are.\n3. **Practical Practice**: Build a mock diagram or code snippet to verify. Let me know if you want me to write a quiz on this!`;
            }

            aiChatWindow.innerHTML += `
                <div class="mb-3">
                    <span class="badge bg-secondary mb-1">AI Buddy</span>
                    <div class="p-3 rounded-4" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); font-size: 0.9rem;">
                        ${reply.replace(/\n/g, "<br>")}
                    </div>
                </div>
            `;
            aiChatWindow.scrollTop = aiChatWindow.scrollHeight;
        }, 1000);
    }

    sendAiBtn.addEventListener("click", sendAiMessage);
    aiChatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") sendAiMessage();
    });

    // Initial Render
    updateCounts();
    renderNotes();
    renderQuizzes();
    renderFlashcards();
}