const API_BASE = 'http://localhost:8080/api';

async function loadProfile() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    // Render User Header
    document.getElementById('profile-name').textContent = user.username;
    document.getElementById('profile-email').textContent = user.email;
    document.getElementById('profile-initial').textContent = user.username.charAt(0).toUpperCase();

    // Render Interests
    if (user.interests) {
        const interestsHtml = user.interests.split(',').map(i =>
            `<span class="px-3 py-1 bg-white/5 rounded-full text-xs border border-white/10 text-gray-300">${i.trim()}</span>`
        ).join('');
        document.getElementById('profile-interests').innerHTML = interestsHtml;
    }

    await loadMyIdeas(user.id);
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
                console.log("No ideas found for user ID:", userId);
                document.getElementById('my-ideas-grid').innerHTML = '<p class="text-center col-span-full text-gray-400 py-12">No ideas found. Try posting one from the Feed page!</p>';
            } else {
                renderMyIdeaCards(ideas);
            }
        } else {
            console.error("Failed to fetch ideas:", response.status);
            document.getElementById('my-ideas-grid').innerHTML = `<p class="text-center col-span-full text-red-400">Failed to load ideas (Status: ${response.status})</p>`;
        }
    } catch (e) {
        console.error("Error loading ideas:", e);
        document.getElementById('my-ideas-grid').innerHTML = `<p class="text-center col-span-full text-red-400">Error loading ideas: ${e.message}</p>`;
    }
}

function renderMyIdeaCards(ideas) {
    const container = document.getElementById('my-ideas-grid');
    if (ideas.length === 0) {
        container.innerHTML = '<p class="text-center col-span-full text-gray-500 py-12">You haven\'t posted any ideas yet.</p>';
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
                    <a href="/edit-idea?id=${idea.id}" class="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition" title="Edit">
                        ✏️
                    </a>
                    <div id="delete-wrapper-${idea.id}">
                        <button onclick="showDeleteConfirm(${idea.id})" class="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition" title="Delete">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function showDeleteConfirm(id) {
    const wrapper = document.getElementById(`delete-wrapper-${id}`);
    if (wrapper) {
        wrapper.innerHTML = `
            <button onclick="deleteIdea(${id})" class="px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-xs font-medium transition flex items-center animate-fade-in">
                Confirm Delete
            </button>
        `;
    }
}

async function deleteIdea(id) {
    // No confirmation dialog needed as the button itself is the confirmation now
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        const response = await fetch(`${API_BASE}/ideas/${id}?userId=${user.id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadProfile(); // Refresh list
        } else {
            alert('Failed to delete idea.');
        }
    } catch (e) {
        console.error(e);
        alert('Error deleting idea.');
    }
}

// Init
window.addEventListener('DOMContentLoaded', loadProfile);
