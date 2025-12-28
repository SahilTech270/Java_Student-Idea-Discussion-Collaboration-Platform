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
                    <a href="idea-details.html?id=${idea.id}">${idea.title}</a>
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
                    <a href="edit-idea.html?id=${idea.id}" class="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition" title="Edit">
                        ✏️
                    </a>
                    <button onclick="deleteIdea(${idea.id})" class="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition" title="Delete">
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

async function deleteIdea(id) {
    if (!confirm('Are you sure you want to delete this idea? This action cannot be undone.')) return;

    try {
        const user = JSON.parse(localStorage.getItem('user'));
        const response = await fetch(`${API_BASE}/ideas/${id}?userId=${user.id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Idea deleted successfully.');
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
