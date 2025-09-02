document.addEventListener('DOMContentLoaded', function() {
    const header = document.getElementById('header');
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    const enquiryModal = document.getElementById('enquiry-modal');
    const enquiryForm = document.getElementById('enquiry-form');
    const dealModal = document.getElementById('deal-modal');
    const dealTitle = document.getElementById('deal-title');
    const dealContent = document.getElementById('deal-content');
    const messageBox = document.getElementById('message-box');
    const animatedElements = document.querySelectorAll('.animate');
    const heroContainer = document.querySelector('.hero .container');

    let searchResults = null;
    if (heroContainer) {
        searchResults = document.createElement('div');
        searchResults.className = 'search-results';
        heroContainer.appendChild(searchResults);
    }

    const cards = Array.from(document.querySelectorAll('.destination-card'));
    const searchIndex = cards.map(card => {
        const title = (card.querySelector('.card-content h3')?.textContent || '').trim();
        const desc = (card.querySelector('.card-content p')?.textContent || '').trim();
        const section = card.closest('section')?.id || '';
        const sectionName = document.querySelector(`section#${section} .section-title h2`)?.textContent || section || 'Results';
        return { card, title, desc, section, sectionName };
    });

    const API_BASE = (() => {
        if (location.hostname === 'vacationvisits.in' || location.hostname === 'www.vacationvisits.in') {
            return '';
        }
        if (location.hostname === 'localhost' && location.port === '3000') {
            return '';
        }
        if (location.hostname === 'localhost') {
            return 'http://localhost:3000';
        }
        return '';
    })();

    function showMessage(message, duration = 3000) {
        messageBox.textContent = message;
        messageBox.classList.add('show');
        setTimeout(() => {
            messageBox.classList.remove('show');
        }, duration);
    }

    function openModal(modal) {
        modal.classList.add('active');
    }

    function closeModal(modal) {
        modal.classList.remove('active');
    }

    function clearSearchResults() {
        if (!searchResults) return;
        searchResults.innerHTML = '';
        searchResults.classList.remove('visible');
    }

    function renderSearchResults(items) {
        if (!searchResults) return;
        if (!items.length) {
            searchResults.innerHTML = '<div class="search-item"><span class="meta">No matches found</span></div>';
        } else {
            searchResults.innerHTML = items.map(it => `
                <div class="search-item" data-idx="${it.idx}">
                    <div class="title">${it.title}</div>
                    <div class="meta">${it.sectionName}</div>
                </div>
            `).join('');
        }
        searchResults.classList.add('visible');
        searchResults.querySelectorAll('.search-item').forEach(el => {
            el.addEventListener('click', () => {
                const idx = parseInt(el.getAttribute('data-idx'));
                const it = items[idx] || items[0];
                if (it && it.card) {
                    const y = it.card.getBoundingClientRect().top + window.scrollY - 80;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                    clearSearchResults();
                }
            });
        });
    }

    function performSearch(term) {
        const q = term.trim().toLowerCase();
        if (!q) {
            clearSearchResults();
            return [];
        }
        const results = [];
        for (let i = 0; i < searchIndex.length; i++) {
            const it = searchIndex[i];
            const hay = `${it.title} ${it.desc} ${it.sectionName}`.toLowerCase();
            if (hay.includes(q)) {
                results.push({ idx: results.length, card: it.card, title: it.title, sectionName: it.sectionName });
            }
        }
        renderSearchResults(results.slice(0, 10));
        return results;
    }

    const mobileQuery = window.matchMedia('(max-width: 768px)');
    let lastScrollY = window.scrollY;
    let ticking = false;

    function handleScroll() {
        const currentY = window.scrollY;
        const isScrollingDown = currentY > lastScrollY && currentY > 10;

        header.classList.toggle('scrolled', currentY > 100);

        if (mobileQuery.matches) {
            if (isScrollingDown && currentY > 50) {
                header.classList.add('hide');
                header.classList.add('absolute');
            } else if (currentY <= lastScrollY) {
                header.classList.remove('hide');
                header.classList.remove('absolute');
            }
        } else {
            header.classList.remove('hide');
            header.classList.remove('absolute');
        }

        lastScrollY = currentY <= 0 ? 0 : currentY;
        ticking = false;
    }

    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(handleScroll);
            ticking = true;
        }
    }

    window.addEventListener('scroll', requestTick);

    mobileQuery.addEventListener('change', function() {
        if (!mobileQuery.matches) {
            header.classList.remove('hide');
            header.classList.remove('absolute');
        }
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, { threshold: 0.1 });

    animatedElements.forEach(element => observer.observe(element));

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                if (targetId === '#enquiry') {
                    openModal(enquiryModal);
                } else {
                    window.scrollTo({ top: targetElement.offsetTop - 80, behavior: 'smooth' });
                }
            }
        });
    });

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', async function() {
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                showMessage(`Searching for: ${searchTerm}`);
                try {
                    await fetch(`${API_BASE}/api/searches`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ query: searchTerm })
                    });
                } catch {}
                const results = performSearch(searchTerm);
                if (results.length && results[0].card) {
                    const y = results[0].card.getBoundingClientRect().top + window.scrollY - 80;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }
            } else {
                showMessage('Please enter a search term');
            }
        });
    }

    if (searchInput && searchResults) {
        searchInput.addEventListener('input', function() {
            const term = searchInput.value;
            if (term && term.length >= 2) performSearch(term);
            else clearSearchResults();
        });

        document.addEventListener('click', function(e) {
            if (!searchResults.contains(e.target) && e.target !== searchInput) clearSearchResults();
        });
    }

    document.querySelectorAll('.view-deal-btn, #book-now-btn, .enquiry-link').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const destination = this.getAttribute('data-destination');
            const dealId = this.getAttribute('data-deal');
            if (dealId) {
                (async () => {
                    try {
                        const res = await fetch(`${API_BASE}/api/deals/${dealId}`);
                        if (!res.ok) throw new Error('Deal not found');
                        const deal = await res.json();
                        dealTitle.innerText = deal.title || 'Deal Details';
                        const priceLines = (deal.pricing || []).map(p => `<li><strong>₹${p.price.toLocaleString('en-IN')}/-</strong> ${p.label}</li>`).join('');
                        const incLines = (deal.inclusions || []).map(i => `<li>${i}</li>`).join('');
                        const optional = deal.optional ? `<h4>Optional Cost:</h4><p>${deal.optional.label}: <strong>₹${deal.optional.price.toLocaleString('en-IN')}/-</strong> per person</p>` : '';
                        dealContent.innerHTML = `
                            <h4>Travel Month:</h4>
                            <p><strong>${deal.travelMonth || ''}</strong></p>
                            <h4>Pricing:</h4>
                            <ul>${priceLines}</ul>
                            <h4>Inclusions:</h4>
                            <ul>${incLines}</ul>
                            ${optional}
                        `;
                        openModal(dealModal);
                    } catch (err) {
                        dealTitle.innerText = 'Deal Details';
                        dealContent.innerHTML = '<p>Deal details unavailable right now.</p>';
                        openModal(dealModal);
                    }
                })();
            } else {
                if (destination) {
                    enquiryForm.querySelector('#destination').value = destination;
                }
                openModal(enquiryModal);
            }
        });
    });

    const visaBtn = document.getElementById('visa-info-btn');
    if (visaBtn) {
        visaBtn.addEventListener('click', function() {
            showMessage('Our visa services include documentation, submission, and embassy follow-ups.');
        });
    }

    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.querySelector('.close-modal').addEventListener('click', () => closeModal(modal));
        modal.addEventListener('click', function(e) {
            if (e.target === modal) closeModal(modal);
        });
    });

    enquiryForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(enquiryForm);
        const payload = Object.fromEntries(formData.entries());
        try {
            const res = await fetch(`${API_BASE}/api/enquiries`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error('Failed');
            showMessage('Thank you! We will contact you shortly.');
            enquiryForm.reset();
            setTimeout(() => closeModal(enquiryModal), 500);
        } catch (err) {
            showMessage('Could not submit right now. Please try again.');
        }
    });

    if (location.hash === '#enquiry') {
        openModal(enquiryModal);
    }

    setTimeout(() => openModal(enquiryModal), 5000);
});
