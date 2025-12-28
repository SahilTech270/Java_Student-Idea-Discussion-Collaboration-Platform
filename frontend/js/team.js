const API_BASE = 'http://localhost:8080/api';
const user = JSON.parse(localStorage.getItem('user'));

if (!user) window.location.href = 'login.html';

async function loadRequests() {
    const container = document.getElementById('ideas-requests-container');
    container.innerHTML = '<p class="text-gray-500 text-center py-12">Loading...</p>';

    try {
        const ideasResponse = await fetch(`${API_BASE}/ideas`); // Assuming this returns all ideas sorted
        if (!ideasResponse.ok) throw new Error('Failed to load ideas');

        const allIdeas = await ideasResponse.json();
        const myIdeas = allIdeas.filter(idea => idea.postedBy.username === user.username);

        if (myIdeas.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-12">You haven\'t posted any ideas yet. Start by posting one! 🚀</p>';
            return;
        }

        container.innerHTML = '';
        let hasRequests = false;

        for (const idea of myIdeas) {
            const requestsResponse = await fetch(`${API_BASE}/team/idea/${idea.id}`);
            if (requestsResponse.ok) {
                const requests = await requestsResponse.json();
                if (requests.length > 0) {
                    hasRequests = true;
                    renderIdeaRequests(idea, requests);
                }
            }
        }

        if (!hasRequests) {
            container.innerHTML = '<p class="text-gray-500 text-center py-12">No pending team requests for your ideas. Yet! 🌱</p>';
        }

    } catch (e) {
        console.error(e);
        container.innerHTML = '<p class="text-red-400 text-center py-12">Error loading requests.</p>';
    }
}

function renderIdeaRequests(idea, requests) {
    const container = document.getElementById('ideas-requests-container');

    const requestsHtml = requests.map(req => `
        <div class="flex items-center justify-between bg-white/5 p-4 rounded-xl mb-3 border border-white/5 hover:bg-white/10 transition group">
            <div>
                <p class="font-bold text-gray-200 group-hover:text-white transition">${req.requester.username} <span class="text-gray-500 text-sm font-normal">(${req.requester.email})</span></p>
                ${req.message ? `<p class="text-gray-400 text-sm italic mt-1">"${req.message}"</p>` : ''}
                <p class="text-xs text-gray-500 mt-2 flex items-center">Status: <span class="uppercase font-bold ml-2 px-2 py-0.5 rounded text-[10px] ${getStatusColor(req.status)}">${req.status}</span></p>
            </div>
            
            ${req.status === 'PENDING' ? `
            <div class="flex space-x-3">
                <button onclick="updateStatus(${req.id}, 'ACCEPTED')" class="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-lg text-sm font-medium transition border border-green-500/30">Accept</button>
                <button onclick="updateStatus(${req.id}, 'REJECTED')" class="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm font-medium transition border border-red-500/30">Reject</button>
            </div>
            ` : ''}
        </div>
    `).join('');

    const html = `
        <div class="glass-panel shadow-lg rounded-2xl p-6 border border-white/10">
            <h2 class="text-xl font-bold text-white mb-6 border-b border-white/5 pb-4 flex items-center">
                <span class="mr-2">📂</span>
                <a href="idea-details.html?id=${idea.id}" class="hover:text-primary transition">${idea.title}</a>
            </h2>
            <div class="space-y-2">
                ${requestsHtml}
            </div>
        </div>
    `;

    container.innerHTML += html;
}

function getStatusColor(status) {
    if (status === 'ACCEPTED') return 'bg-green-500/20 text-green-400 border border-green-500/30';
    if (status === 'REJECTED') return 'bg-red-500/20 text-red-400 border border-red-500/30';
    return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
}

async function updateStatus(requestId, status) {
    if (!confirm(`Are you sure you want to ${status} this request?`)) return;

    try {
        const response = await fetch(`${API_BASE}/team/request/${requestId}/${status}`, {
            method: 'POST'
        });

        if (response.ok) {
            // alert('Updated!'); 
            // Removed alert for smoother UX
            loadRequests();
        } else {
            alert('Failed to update.');
        }
    } catch (e) {
        console.error(e);
        alert('Error.');
    }
}

window.addEventListener('DOMContentLoaded', loadRequests);
