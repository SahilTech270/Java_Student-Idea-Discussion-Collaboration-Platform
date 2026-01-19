const API_BASE = 'http://localhost:8080/api';
const urlParams = new URLSearchParams(window.location.search);
const viewUserId = urlParams.get('userId'); // If null, viewing own profile

let currentUser = null;
let viewedUser = null;
let stompClient = null;
let chatSubscription = null;

async function loadProfile() {
    currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser) {
        window.location.href = '/login';
        return;
    }

    if (viewUserId && viewUserId != currentUser.id) {
        // Fetch other user's details
        try {
            const response = await fetch(`${API_BASE}/users/${viewUserId}`);
            if (response.ok) {
                viewedUser = await response.json();
                renderProfileData(viewedUser);
                renderActions(false); // Not owner
            } else {
                alert("User not found");
                window.location.href = '/dashboard';
            }
        } catch (e) {
            console.error(e);
        }
    } else {
        // Viewing Own Profile
        viewedUser = currentUser;
        renderProfileData(currentUser);
        renderActions(true); // Is Owner
    }

    // Connect WS primarily for receiving messages if we stay on this page
    connectWebSocket();
    await loadMyIdeas(viewedUser.id);
}

function renderProfileData(user) {
    document.getElementById('profile-name').textContent = user.username;
    document.getElementById('profile-email').textContent = user.email;
    document.getElementById('profile-initial').textContent = user.username.charAt(0).toUpperCase();

    if (user.interests) {
        const interestsHtml = user.interests.split(',').map(i =>
            `<span class="px-3 py-1 bg-white/5 rounded-full text-xs border border-white/10 text-gray-300">${i.trim()}</span>`
        ).join('');
        document.getElementById('profile-interests').innerHTML = interestsHtml;
    }
}

function renderActions(isOwner) {
    const actionContainer = document.getElementById('profile-actions');
    if (isOwner) {
        actionContainer.innerHTML = `
            <a href="/settings" class="inline-flex items-center px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition text-white">
                Edit Profile
            </a>
        `;
    } else {
        actionContainer.innerHTML = `
            <button onclick="openChat()" class="inline-flex items-center px-4 py-2 bg-primary hover:bg-indigo-600 border border-transparent rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/30 transition text-white transform hover:scale-105">
                💬 Message
            </button>
        `;
    }
}

async function loadMyIdeas(userId) {
    try {
        const response = await fetch(`${API_BASE}/ideas/user/${userId}`);
        if (response.ok) {
            const ideas = await response.json();

            // Update Stats
            document.getElementById('stat-ideas').textContent = ideas.length;
            const totalUpvotes = ideas.reduce((acc, idea) => acc + (idea.upvotes || 0), 0);
            document.getElementById('stat-upvotes').textContent = totalUpvotes;

            if (ideas.length === 0) {
                document.getElementById('my-ideas-grid').innerHTML = '<p class="text-center col-span-full text-gray-400 py-12">No ideas found.</p>';
            } else {
                renderMyIdeaCards(ideas);
            }
        } else {
            document.getElementById('my-ideas-grid').innerHTML = `<p class="text-center col-span-full text-red-400">Failed to load ideas</p>`;
        }
    } catch (e) {
        console.error("Error loading ideas:", e);
    }
}

function renderMyIdeaCards(ideas) {
    const container = document.getElementById('my-ideas-grid');
    if (ideas.length === 0) {
        container.innerHTML = '<p class="text-center col-span-full text-gray-500 py-12">No ideas found.</p>';
        return;
    }

    container.innerHTML = ideas.map(idea => `
        <div class="glass-panel rounded-xl hover:bg-white/5 transition duration-200 overflow-hidden border border-white/5 group flex flex-col h-full">
            <div class="p-6 flex-1">
                <div class="flex items-center justify-between mb-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary/10 text-secondary border border-secondary/20">
                        ${idea.domain || 'General'}
                    </span>
                    <span class="text-xs text-gray-400">${new Date(idea.createdAt).toLocaleDateString()}</span>
                </div>
                
                <h2 class="text-xl font-bold text-white mb-2 group-hover:text-primary transition">
                    <a href="/idea-details?id=${idea.id}">${idea.title}</a>
                </h2>
                <p class="text-gray-400 text-sm mb-4 line-clamp-3">${idea.problemStatement}</p>
                
                <div class="flex flex-wrap gap-2 mb-4">
                    ${idea.tags ? idea.tags.split(',').slice(0, 3).map(tag =>
        `<span class="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">#${tag.trim()}</span>`
    ).join('') : ''}
                </div>
            </div>
            
            <div class="px-6 py-4 border-t border-white/5 flex items-center justify-between bg-white/5">
                <div class="flex items-center space-x-3 text-sm text-gray-400">
                    <span class="flex items-center">⬆️ ${idea.upvotes || 0}</span>
                    <span class="flex items-center">⬇️ ${idea.downvotes || 0}</span>
                </div>
                <div class="flex space-x-2">
                    <a href="/idea-details?id=${idea.id}" class="p-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-400/10 rounded-lg transition" title="View">
                        👁️
                    </a>
                </div>
            </div>
        </div>
    `).join('');
}


// --- CHAT LOGIC ---

function connectWebSocket() {
    const socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);
    stompClient.debug = null;

    stompClient.connect({}, function (frame) {
        console.log('Connected: ' + frame);

        // Subscribe to private queue
        stompClient.subscribe('/user/queue/private', function (message) {
            const chatMsg = JSON.parse(message.body);
            displayMessage(chatMsg, 'received');
        });

    }, function (error) {
        console.error("WS Error:", error);
    });
}

function openChat() {
    document.getElementById('chat-modal').classList.remove('hidden');
    document.getElementById('chat-modal').classList.add('flex');
    document.getElementById('chat-user-name').textContent = viewedUser.username;
    // Clear previous or load history (History not implemented yet)
    document.getElementById('chat-messages').innerHTML = '<div class="text-center text-xs text-gray-500 mt-4">Start of conversation</div>';
}

function closeChat() {
    document.getElementById('chat-modal').classList.add('hidden');
    document.getElementById('chat-modal').classList.remove('flex');
}

// Send Message
document.getElementById('chat-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('chat-input');
    const content = input.value.trim();

    if (content && stompClient) {
        const chatMessage = {
            sender: currentUser.username,
            recipient: viewedUser.username, // Send to username
            content: content,
            type: 'CHAT'
        };

        // Send to private endpoint
        stompClient.send("/app/chat.private", {}, JSON.stringify(chatMessage));

        // Display my own message
        displayMessage(chatMessage, 'sent');
        input.value = '';
    }
});

function displayMessage(message, type) {
    // Only display if relevant to current chat or general notification
    // If modal is open and we are chatting with this person:
    const chatBox = document.getElementById('chat-messages');

    // For received messages, verify sender is the one we are viewing? 
    // Or if we are just viewing our own profile, maybe we shouldn't open chat automatically?
    // Current simple logic: append to modal if open.

    // Check flow:
    // 1. I am User A. I visit User B. I Open Chat.
    // 2. I send message. 'sent' displayed.
    // 3. User B (online) gets message in background.
    // 4. User B needs to see notification or if chat open, see message.

    const div = document.createElement('div');
    if (type === 'sent') {
        div.className = "flex justify-end";
        div.innerHTML = `
            <div class="bg-primary text-white rounded-l-lg rounded-tr-lg px-4 py-2 max-w-[80%] text-sm shadow-md">
                ${message.content}
            </div>
        `;
    } else {
        // Received
        div.className = "flex justify-start";
        div.innerHTML = `
            <div class="bg-white/10 text-gray-200 rounded-r-lg rounded-tl-lg px-4 py-2 max-w-[80%] text-sm border border-white/5">
                <div class="text-[10px] text-gray-400 mb-1">${message.sender}</div>
                ${message.content}
            </div>
        `;
    }
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}


// Init
window.addEventListener('DOMContentLoaded', loadProfile);
