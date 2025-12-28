const API_BASE = 'http://localhost:8080/api';
const urlParams = new URLSearchParams(window.location.search);
const ideaId = urlParams.get('id');

if (!ideaId) {
    alert('Invalid Idea ID');
    window.location.href = 'profile.html';
}

async function loadIdea() {
    try {
        const response = await fetch(`${API_BASE}/ideas/${ideaId}`);
        if (response.ok) {
            const idea = await response.json();

            // Check ownership
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || (idea.postedBy && idea.postedBy.id !== user.id)) {
                alert('You are not authorized to edit this idea.');
                window.location.href = 'profile.html';
                return;
            }

            // Populate Form
            document.getElementById('title').value = idea.title;
            document.getElementById('domain').value = idea.domain;
            document.getElementById('problem').value = idea.problemStatement;
            document.getElementById('solution').value = idea.proposedSolution;
            document.getElementById('maturity').value = idea.maturityLevel;
            document.getElementById('unique').value = idea.uniqueTouch || '';
            document.getElementById('tags').value = idea.tags || '';
        } else {
            alert('Failed to load idea details.');
            window.location.href = 'profile.html';
        }
    } catch (e) {
        console.error(e);
        alert('Error loading idea.');
    }
}

document.getElementById('editIdeaForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem('user'));

    // Construct Updated Idea Object
    const updatedIdea = {
        title: document.getElementById('title').value,
        domain: document.getElementById('domain').value,
        problemStatement: document.getElementById('problem').value,
        proposedSolution: document.getElementById('solution').value,
        maturityLevel: document.getElementById('maturity').value,
        uniqueTouch: document.getElementById('unique').value,
        tags: document.getElementById('tags').value
    };

    try {
        const response = await fetch(`${API_BASE}/ideas/${ideaId}?userId=${user.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedIdea)
        });

        if (response.ok) {
            alert('Idea updated successfully! 🎉');
            window.location.href = 'profile.html';
        } else {
            const errorMsg = await response.text();
            alert('Failed to update idea: ' + errorMsg);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while updating the idea.');
    }
});

// Init
window.addEventListener('DOMContentLoaded', loadIdea);
