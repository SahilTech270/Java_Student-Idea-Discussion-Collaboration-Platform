const API_BASE = 'http://localhost:8080/api';
const urlParams = new URLSearchParams(window.location.search);
const ideaId = urlParams.get('id');

if (!ideaId) {
    alert('Invalid Idea ID');
    window.location.href = '/dashboard';
}

async function loadIdea() {
    try {
        const response = await fetch(`${API_BASE}/ideas/${ideaId}`);
        if (response.ok) {
            const idea = await response.json();
            renderIdea(idea);
        } else {
            document.getElementById('idea-content').innerHTML = '<p class="text-center p-8 text-gray-400">Idea not found.</p>';
        }
    } catch (e) {
        console.error(e);
    }
}

function renderIdea(idea) {
    const tagsHtml = idea.tags ? idea.tags.split(',').map(tag =>
        `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary border border-primary/20 mr-2">#${tag.trim()}</span>`
    ).join('') : '';

    const html = `
        <div class="p-8">
            <div class="flex items-center justify-between mb-6">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary/10 text-secondary border border-secondary/20 cursor-default">
                    ${idea.domain}
                </span>
                <span class="text-sm text-gray-400">${new Date(idea.createdAt).toLocaleDateString()}</span>
            </div>

            <div class="flex justify-between items-start mb-6">
                 <h1 class="text-3xl font-extrabold text-white tracking-tight">${idea.title}</h1>
                 <button onclick="analyzeIdea()" class="bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white px-6 py-2 rounded-full font-bold shadow-lg shadow-pink-500/20 transition transform hover:scale-105 flex items-center">
                    ✨ AI Analyze
                 </button>
            </div>
            
            <!-- AI Analysis Result Container -->
            <div id="ai-analysis-container" class="hidden mb-8"></div>

            <div class="prose max-w-none text-gray-300 mb-8">
                <h3 class="text-lg font-bold text-gray-200 mb-2">Problem Statement</h3>
                <p class="mb-4 leading-relaxed">${idea.problemStatement}</p>
                
                <h3 class="text-lg font-bold text-gray-200 mb-2">Proposed Solution</h3>
                <p class="mb-4 leading-relaxed">${idea.proposedSolution}</p>
                
                <h3 class="text-lg font-bold text-gray-200 mb-2">Unique Touch</h3>
                <p class="mb-4 italic border-l-4 border-indigo-500 pl-4 py-2 bg-indigo-500/10 text-indigo-200 rounded-r">${idea.uniqueTouch || 'N/A'}</p>
            </div>

            <div class="flex items-center justify-between border-t border-white/10 pt-6">
                 <div class="flex items-center space-x-3">
                    <span class="h-10 w-10 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        ${idea.postedBy ? idea.postedBy.username.charAt(0).toUpperCase() : 'U'}
                    </span>
                    <div>
                        <p class="text-sm font-medium text-white">${idea.postedBy ? idea.postedBy.username : 'Unknown'}</p>
                        <p class="text-xs text-gray-500">Author</p>
                    </div>
                </div>

                <div class="flex space-x-4">
                    <button id="joinTeamBtn" onclick="requestToJoin()" class="hidden bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-1 rounded-full text-sm font-medium transition shadow-lg shadow-indigo-500/30">
                        🤝 Request to Join Team
                    </button>
                    <button onclick="upvote()" class="flex items-center space-x-1 text-gray-400 hover:text-green-400 transition bg-white/5 hover:bg-white/10 px-3 py-1 rounded-full border border-white/5">
                        <span class="text-lg">⬆️</span>
                        <span id="upvote-count" class="font-bold">${idea.upvotes}</span>
                    </button>
                    <button onclick="downvote()" class="flex items-center space-x-1 text-gray-400 hover:text-red-400 transition bg-white/5 hover:bg-white/10 px-3 py-1 rounded-full border border-white/5">
                        <span class="text-lg">⬇️</span>
                        <span id="downvote-count" class="font-bold">${idea.downvotes}</span>
                    </button>
                </div>
            </div>
            
            <div class="mt-4 flex justify-end">
                <button onclick="reportIdea()" class="text-xs text-red-400 hover:text-red-300 underline transition">Report Idea</button>
            </div>

            <div class="mt-6 pt-4 border-t border-white/5">
                ${tagsHtml}
            </div>
        </div>
    `;
    document.getElementById('idea-content').innerHTML = html;

    // Show Join Button if not owner
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && idea.postedBy && user.username !== idea.postedBy.username) {
        document.getElementById('joinTeamBtn').classList.remove('hidden');
    }
}

async function analyzeIdea() {
    const container = document.getElementById('ai-analysis-container');
    container.classList.remove('hidden');
    container.innerHTML = '<div class="text-center py-8 text-primary animate-pulse">✨ AI is analyzing your idea...</div>';

    try {
        const response = await fetch(`${API_BASE}/ideas/${ideaId}/analyze`, { method: 'POST' });
        if (response.ok) {
            const swot = await response.json();
            renderSWOT(swot);
        } else {
            container.innerHTML = '<div class="text-center py-4 text-red-400">Analysis failed. Please try again.</div>';
        }
    } catch (e) {
        console.error(e);
        container.innerHTML = '<div class="text-center py-4 text-red-400">Analysis error.</div>';
    }
}

function renderSWOT(swot) {
    const container = document.getElementById('ai-analysis-container');

    // Helper to render list
    const renderList = (items) => items.map(i => `<li class="text-sm mb-1">• ${i}</li>`).join('');

    container.innerHTML = `
        <div class="glass p-6 rounded-xl border border-white/10 relative overflow-hidden">
            <div class="absolute top-0 right-0 p-2 opacity-10 text-6xl">🤖</div>
            <h3 class="text-xl font-bold text-white mb-4">AI SWOT Analysis</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
                    <h4 class="font-bold text-green-400 mb-2 uppercase text-xs tracking-wider">Strengths</h4>
                    <ul class="text-green-200 list-none pl-1 space-y-1">
                        ${renderList(swot.strengths)}
                    </ul>
                </div>
                <div class="bg-red-500/10 border border-red-500/20 p-4 rounded-lg">
                     <h4 class="font-bold text-red-400 mb-2 uppercase text-xs tracking-wider">Weaknesses</h4>
                     <ul class="text-red-200 list-none pl-1 space-y-1">
                        ${renderList(swot.weaknesses)}
                    </ul>
                </div>
                <div class="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
                     <h4 class="font-bold text-blue-400 mb-2 uppercase text-xs tracking-wider">Opportunities</h4>
                     <ul class="text-blue-200 list-none pl-1 space-y-1">
                        ${renderList(swot.opportunities)}
                    </ul>
                </div>
                <div class="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg">
                     <h4 class="font-bold text-yellow-400 mb-2 uppercase text-xs tracking-wider">Threats</h4>
                     <ul class="text-yellow-200 list-none pl-1 space-y-1">
                        ${renderList(swot.threats)}
                    </ul>
                </div>
            </div>
            <p class="text-xs text-gray-500 mt-4 text-center">Generated by IdeaHub AI • Insight Quality: High</p>
        </div>
    `;
}

async function requestToJoin() {
    const user = JSON.parse(localStorage.getItem('user'));
    const message = prompt("Why do you want to join? (Optional message)");
    if (message === null) return;

    try {
        const response = await fetch(`${API_BASE}/team/request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                idea: { id: ideaId },
                requester: { id: user.id },
                message: message
            })
        });

        if (response.ok) {
            alert('Request Sent Successfully! 🤝');
            document.getElementById('joinTeamBtn').classList.add('hidden'); // Hide after request
        } else {
            alert('Failed to send request: ' + await response.text());
        }
    } catch (e) {
        console.error(e);
        alert('Error sending request.');
    }
}

async function loadComments() {
    try {
        const response = await fetch(`${API_BASE}/comments/idea/${ideaId}`);
        if (response.ok) {
            const comments = await response.json();
            const container = document.getElementById('comments-list');
            container.innerHTML = comments.map(c => renderComment(c)).join('');
        }
    } catch (e) {
        console.error(e);
    }
}

function renderComment(comment, isReply = false) {
    const repliesHtml = comment.replies && comment.replies.length > 0
        ? `<div class="ml-8 mt-4 space-y-4 border-l-2 border-white/10 pl-4">${comment.replies.map(r => renderComment(r, true)).join('')}</div>`
        : '';

    return `
        <div class="flex space-x-3">
            <div class="flex-shrink-0">
                <span class="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-gray-300 text-xs font-bold border border-white/10">
                    ${comment.postedBy ? comment.postedBy.username.charAt(0).toUpperCase() : 'U'}
                </span>
            </div>
            <div class="flex-grow">
                <div class="bg-white/5 rounded-lg p-3 border border-white/5 hover:bg-white/10 transition">
                    <div class="flex items-center justify-between mb-1">
                        <span class="text-sm font-bold text-gray-200">${comment.postedBy ? comment.postedBy.username : 'Unknown'}</span>
                        <span class="text-xs text-gray-500">${new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p class="text-sm text-gray-300">${comment.content}</p>
                </div>
                <div class="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                    <button onclick="replyTo(${comment.id})" class="hover:text-primary transition">Reply</button>
                    ${comment.useful ? '<span class="text-green-400 font-bold">✓ Useful</span>' : ''}
                </div>
                ${repliesHtml}
            </div>
        </div>
    `;
}

async function upvote() {
    await fetch(`${API_BASE}/ideas/${ideaId}/upvote`, { method: 'POST' });
    loadIdea(); // Refresh
}

async function downvote() {
    await fetch(`${API_BASE}/ideas/${ideaId}/downvote`, { method: 'POST' });
    loadIdea(); // Refresh
}

async function reportIdea() {
    if (!confirm("Report this idea to admins?")) return;
    try {
        await fetch(`${API_BASE}/admin/report/idea/${ideaId}`, { method: 'POST' });
        alert('Idea reported.');
    } catch (e) { console.error(e); }
}

// Comment Form
document.getElementById('commentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user'));
    const content = document.getElementById('commentContent').value;

    try {
        const payload = {
            content,
            postedBy: { id: user.id },
            idea: { id: ideaId }
        };

        if (window.replyingToId) {
            payload.parentComment = { id: window.replyingToId };
        }

        const response = await fetch(`${API_BASE}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            document.getElementById('commentContent').value = '';
            window.replyingToId = null;
            document.getElementById('commentContent').placeholder = "Add to the discussion..."; // Reset placeholder
            loadComments();
        } else {
            alert('Failed to post comment');
        }
    } catch (e) {
        console.error(e);
    }
});

function replyTo(commentId) {
    window.replyingToId = commentId;
    const input = document.getElementById('commentContent');
    input.focus();
    input.placeholder = `Replying to comment #${commentId}...`;
    input.scrollIntoView({ behavior: 'smooth' });
}

// Init
window.addEventListener('DOMContentLoaded', () => {
    loadIdea();
    loadComments();
});
