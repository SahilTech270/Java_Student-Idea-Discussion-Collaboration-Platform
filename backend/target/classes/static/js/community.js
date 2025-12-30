const API_BASE_COMMUNITY = 'http://localhost:8080/api/communities';
const API_BASE_IDEA = 'http://localhost:8080/api/ideas';

const user = JSON.parse(localStorage.getItem('user'));
if (!user) window.location.href = '/login';

// --- Communities List ---
async function loadCommunities() {
    const container = document.getElementById('communities-grid');
    if (!container) return;

    try {
        // Fetch my communities
        const response = await fetch(`${API_BASE_COMMUNITY}/my?userId=${user.id}`);
        if (response.ok) {
            const communities = await response.json();
            if (communities.length === 0) {
                container.innerHTML = `
                    <div class="col-span-full text-center py-12 glass-panel rounded-xl border-dashed border-2 border-white/10">
                        <p class="text-gray-400 mb-4">You are not part of any communities yet.</p>
                        <a href="/create-community" class="text-primary hover:text-indigo-400 font-medium">Create one now &rarr;</a>
                    </div>
                `;
            } else {
                container.innerHTML = communities.map(c => `
                    <div class="glass-panel p-6 rounded-xl hover:bg-white/5 transition border border-white/5 flex flex-col h-full group">
                        <div class="flex-1">
                            <h3 class="text-xl font-bold text-white mb-2 group-hover:text-primary transition">
                                <a href="/community-details?id=${c.id}">${c.name}</a>
                            </h3>
                            <p class="text-gray-400 text-sm line-clamp-3 mb-4">${c.description || 'No description'}</p>
                        </div>
                        <div class="flex items-center justify-between pt-4 border-t border-white/5 text-sm text-gray-500">
                             <span>👥 ${c.members ? c.members.length : 0} Members</span>
                             <span class="text-xs">Created ${new Date(c.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                `).join('');
            }
        }
    } catch (e) {
        console.error(e);
        container.innerHTML = '<p class="text-red-400">Error loading communities.</p>';
    }
}

// --- Create Community ---
async function createCommunity(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const description = document.getElementById('description').value;

    try {
        const response = await fetch(`${API_BASE_COMMUNITY}?userId=${user.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description })
        });

        if (response.ok) {
            alert('Community created successfully! 🎉');
            window.location.href = '/communities';
        } else {
            alert('Failed to create community. Name might be taken.');
        }
    } catch (e) {
        console.error(e);
        alert('Error creating community.');
    }
}

// --- Community Details ---
async function loadCommunityDetails(id) {
    try {
        const response = await fetch(`${API_BASE_COMMUNITY}/${id}`);
        if (response.ok) {
            const community = await response.json();

            // Header
            document.getElementById('community-name').textContent = community.name;
            document.getElementById('community-desc').textContent = community.description;

            // Members
            const membersList = document.getElementById('community-members');
            membersList.innerHTML = community.members.map(m => `
                <li class="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 transition">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold text-white">
                        ${m.username.charAt(0).toUpperCase()}
                    </div>
                    <span class="text-gray-300 text-sm">${m.username}</span>
                    ${m.id === community.owner.id ? '<span class="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded ml-auto">Owner</span>' : ''}
                </li>
            `).join('');

            // Load Projects (Ideas linked to this community)
            // Note: We need a backend endpoint for this. For now, we can filter or update backend.
            // Let's assume we can fetch ideas and filter client side or add endpoint later. 
            // For now, I'll fetch ALL and filter (inefficient but works for prototype) or better, add endpoint.
            // Actually, let's implement a quick client-side filter if Backend supports it, or just show placeholder.
            // I'll update backend controller to return ideas or separate endpoint. 
            // WAIT - I need to fetch ideas for this community. 
            // I'll add `findByCommunityId` to IdeaRepository and endpoint.

            // Temporary: Fetch "my ideas" and see if any match (this won't work well). 
            // Optimization: I'll assume we add `GET /api/ideas/community/{id}`.

            loadCommunityProjects(id);
        }
    } catch (e) {
        console.error(e);
    }
}

async function loadCommunityProjects(communityId) {
    const container = document.getElementById('community-projects');
    try {
        // I need to ensure this endpoint exists. I will add it to IdeaController in next step.
        const response = await fetch(`${API_BASE_IDEA}/community/${communityId}`);
        if (response.ok) {
            const ideas = await response.json();
            if (ideas.length === 0) {
                container.innerHTML = '<p class="text-gray-500 italic">No projects started yet. Be the first! 🚀</p>';
                return;
            }
            // Reuse Idea Card HTML? Or Simple list. Simple list for now.
            container.innerHTML = ideas.map(idea => `
                <div class="glass-panel p-4 rounded-xl hover:bg-white/5 transition border border-white/5">
                    <div class="flex justify-between items-start">
                        <div>
                            <h4 class="font-bold text-lg text-white mb-1">
                                <a href="/idea-details?id=${idea.id}">${idea.title}</a>
                            </h4>
                            <p class="text-sm text-gray-400 line-clamp-2">${idea.problemStatement}</p>
                        </div>
                        <span class="text-xs bg-white/10 px-2 py-1 rounded text-gray-300">
                            ${new Date(idea.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p class="text-gray-500">No projects found (or API not ready).</p>';
        }
    } catch (e) {
        console.warn("Project load failed", e);
        container.innerHTML = '<p class="text-gray-500">Failed to load projects.</p>';
    }
}

// --- Add Member ---
function openAddMemberModal() {
    document.getElementById('addMemberModal').classList.remove('hidden');
    document.getElementById('addMemberModal').classList.add('flex');
}
function closeAddMemberModal() {
    document.getElementById('addMemberModal').classList.add('hidden');
    document.getElementById('addMemberModal').classList.remove('flex');
}
async function addMember() {
    const username = document.getElementById('newMemberUsername').value;
    const urlParams = new URLSearchParams(window.location.search);
    const communityId = urlParams.get('id');

    if (!username) return alert('Enter a username');

    try {
        const response = await fetch(`${API_BASE_COMMUNITY}/${communityId}/add-member?username=${username}`, {
            method: 'POST'
        });

        if (response.ok) {
            alert('Member added successfully!');
            location.reload();
        } else {
            alert('User not found or error adding member.');
        }
    } catch (e) {
        console.error(e);
        alert('Error adding member.');
    }
}
