const IDEA_API_URL = 'http://localhost:8080/api/ideas';

async function fetchIdeas() {
    const container = document.getElementById('ideas-container');
    if (!container) return;

    try {
        const response = await fetch(IDEA_API_URL);
        if (response.ok) {
            const ideas = await response.json();
            container.innerHTML = ideas.map(renderIdeaCard).join('');
        } else {
            container.innerHTML = '<p class="text-center text-gray-500">Failed to load ideas.</p>';
        }

        // Load Recommendations
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            const recResponse = await fetch(`${IDEA_API_URL}/recommendations?userId=${user.id}`);
            if (recResponse.ok) {
                const recs = await recResponse.json();
                const recContainer = document.querySelector('.lg\\:col-span-1 ul'); // Targeting the right sidebar list
                if (recContainer) {
                    recContainer.innerHTML = recs.map(idea => `
                        <li class="pb-3 border-b border-white/5 last:border-0 group">
                            <a href="/idea-details?id=${idea.id}" class="block hover:bg-white/5 rounded-lg p-2 -m-2 transition">
                                <h4 class="font-medium text-gray-200 text-sm group-hover:text-primary transition">${idea.title}</h4>
                                <span class="text-xs text-gray-500">${idea.domain} • ${idea.upvotes} upvotes</span>
                            </a>
                        </li>
                    `).join('');
                }
            }
        }

    } catch (e) {
        console.error(e);
        container.innerHTML = '<p class="text-center text-gray-500">Error loading ideas.</p>';
    }
}

function renderIdeaCard(idea) {
    const tagsHtml = idea.tags ? idea.tags.split(',').map(tag =>
        `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary border border-primary/20 mr-2">#${tag.trim()}</span>`
    ).join('') : '';

    return `
        <div class="glass-panel rounded-xl hover:bg-white/5 transition duration-200 overflow-hidden border border-white/5 group">
            <div class="p-6">
                <div class="flex items-center justify-between mb-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary/10 text-secondary border border-secondary/20">
                        ${idea.domain || 'General'}
                    </span>
                    <span class="text-xs text-gray-400">${new Date(idea.createdAt).toLocaleDateString()}</span>
                </div>
                
                <h2 class="text-xl font-bold text-white mb-2 group-hover:text-primary transition">
                    <a href="/idea-details?id=${idea.id}">${idea.title}</a>
                </h2>
                
                <div class="mb-4">
                    <h5 class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Problem</h5>
                    <p class="text-gray-300 text-sm line-clamp-2">${idea.problemStatement}</p>
                </div>

                <div class="mb-4">
                    <h5 class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Solution</h5>
                    <p class="text-gray-300 text-sm line-clamp-2">${idea.proposedSolution}</p>
                </div>

                <div class="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                    <div class="flex items-center space-x-2">
                        <div class="flex-shrink-0">
                            <span class="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-inner">
                                ${idea.postedBy ? idea.postedBy.username.charAt(0).toUpperCase() : 'U'}
                            </span>
                        </div>
                        <span class="text-sm font-medium text-gray-300">${idea.postedBy ? idea.postedBy.username : 'Unknown'}</span>
                    </div>
                    
                    <div class="flex items-center space-x-4 text-gray-400 text-sm">
                        <button class="flex items-center hover:text-white transition space-x-1 group/btn">
                            <span class="group-hover/btn:scale-110 transition pb-0.5">⬆️</span> 
                            <span>${idea.upvotes}</span>
                        </button>
                        <button class="flex items-center hover:text-white transition space-x-1 group/btn">
                             <span class="group-hover/btn:scale-110 transition pb-0.5">💬</span>
                             <span>${idea.commentCount}</span>
                        </button>
                    </div>
                </div>
                
                <div class="mt-4 pt-2">
                    ${tagsHtml}
                </div>
            </div>
        </div>
    `;
}

// Handler for Post Idea Form
const postIdeaForm = document.getElementById('postIdeaForm');
if (postIdeaForm) {
    postIdeaForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            alert('Please login first');
            return;
        }

        const ideaData = {
            title: document.getElementById('title').value,
            domain: document.getElementById('domain').value,
            problemStatement: document.getElementById('problem').value,
            proposedSolution: document.getElementById('solution').value,
            maturityLevel: document.getElementById('maturity').value,
            uniqueTouch: document.getElementById('unique').value,
            tags: document.getElementById('tags').value
        };

        try {
            const urlParams = new URLSearchParams(window.location.search);
            const communityId = urlParams.get('communityId');
            let url = `${IDEA_API_URL}?userId=${user.id}`;
            if (communityId) url += `&communityId=${communityId}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ideaData)
            });

            if (response.ok) {
                alert('Idea Posted Successfully! 🚀');
                window.location.href = '/dashboard';
            } else {
                alert('Failed to post idea.');
            }
        } catch (error) {
            console.error('Error posting idea:', error);
            alert('Error posting idea.');
        }
    });
}
