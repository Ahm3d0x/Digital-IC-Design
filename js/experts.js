// ==================== MOBILE MENU ====================
function initMobileMenu() {
    const menuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const iconOpen = document.getElementById('icon-open');
    const iconClose = document.getElementById('icon-close');

    if (menuButton && mobileMenu && iconOpen && iconClose) {
        menuButton.addEventListener('click', () => {
            const isExpanded = menuButton.getAttribute('aria-expanded') === 'true';
            menuButton.setAttribute('aria-expanded', !isExpanded);
            mobileMenu.classList.toggle('hidden');
            iconOpen.classList.toggle('hidden');
            iconClose.classList.toggle('hidden');
        });
    }
}

// ==================== AI EXPERT BOT CLASS ====================
class ExpertBot {
    constructor(adviceData) {
        this.adviceData = adviceData;
        this.toggleBtn = document.getElementById('ai-toggle-btn');
        this.closeBtn = document.getElementById('ai-close-btn');
        this.chatWindow = document.getElementById('ai-chat-window');
        this.messagesContainer = document.getElementById('chat-messages');
        this.input = document.getElementById('chat-input');
        this.sendBtn = document.getElementById('send-btn');
        this.suggestionsContainer = document.getElementById('chat-suggestions');
        
        this.isOpen = false;
        this.init();
    }

    init() {
        // Toggle Chat
        this.toggleBtn.addEventListener('click', () => this.toggleChat());
        this.closeBtn.addEventListener('click', () => this.toggleChat());

        // Send Message
        this.sendBtn.addEventListener('click', () => this.handleUserMessage());
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleUserMessage();
            }
        });

        // Suggestion Chips
        this.suggestionsContainer.querySelectorAll('.suggestion-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                const text = e.target.textContent.trim().replace(/^[^\s]+\s/, ''); // Remove emoji prefix
                this.input.value = text;
                this.handleUserMessage();
            });
        });
        
        // Auto-resize textarea
        this.input.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.chatWindow.classList.add('active');
            this.toggleBtn.classList.add('hidden');
            setTimeout(() => this.input.focus(), 300);
        } else {
            this.chatWindow.classList.remove('active');
            setTimeout(() => this.toggleBtn.classList.remove('hidden'), 300);
        }
    }

    addMessage(content, sender, isHtml = false) {
        const div = document.createElement('div');
        div.className = `flex gap-3 justify-${sender === 'user' ? 'end' : 'start'} animate-slide-in-up`;
        
        const avatar = sender === 'bot' 
            ? `<div class="w-8 h-8 rounded-full bg-bot-ai flex items-center justify-center flex-shrink-0 text-sm border border-gray-700">🧠</div>`
            : '';

        const bubbleClass = sender === 'user' 
            ? 'bg-bot-user text-white rounded-tl-none' 
            : 'bg-bot-ai text-gray-100 rounded-tr-none border border-gray-700';

        const contentHtml = isHtml ? content : content.replace(/\n/g, '<br>');

        div.innerHTML = `
            ${sender === 'bot' ? avatar : ''}
            <div class="${bubbleClass} p-3 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-md">
                ${contentHtml}
            </div>
        `;

        this.messagesContainer.appendChild(div);
        this.scrollToBottom();
    }

    addTypingIndicator() {
        const div = document.createElement('div');
        div.id = 'typing-indicator';
        div.className = 'flex gap-3 justify-start animate-slide-in-up';
        div.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-bot-ai flex items-center justify-center flex-shrink-0 text-sm border border-gray-700">🧠</div>
            <div class="bg-bot-ai text-gray-100 p-4 rounded-2xl rounded-tr-none border border-gray-700 flex gap-1 items-center h-10">
                <div class="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
            </div>
        `;
        this.messagesContainer.appendChild(div);
        this.scrollToBottom();
    }

    removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) indicator.remove();
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    async handleUserMessage() {
        const text = this.input.value.trim();
        if (!text) return;

        // 1. Add User Message
        this.addMessage(text, 'user');
        this.input.value = '';
        this.input.style.height = 'auto';

        // 2. Show Typing
        this.addTypingIndicator();

        // 3. Simulate Processing Delay (feels more like AI)
        await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 500));

        // 4. Search & Generate Response
        this.removeTypingIndicator();
        const response = this.generateResponse(text);
        this.addMessage(response, 'bot', true);
    }

    // --- THE CORE "AI" LOGIC (Client-Side Search) ---
    generateResponse(query) {
        // A. Normalization (Arabic)
        const normalizedQuery = this.normalizeText(query);
        const terms = normalizedQuery.split(' ').filter(t => t.length > 2); // Ignore short words

        if (terms.length === 0) return "ممكن توضح سؤالك أكتر؟ انا جاهز اساعدك في أي حاجة تخص المجال.";

        // B. Scoring System
        const results = this.adviceData.map(advice => {
            let score = 0;
            const normTitle = this.normalizeText(advice.title);
            const normSummary = this.normalizeText(advice.summary);
            const normTags = advice.tags.map(t => this.normalizeText(t)).join(' ');
            const normContent = this.normalizeText(advice.fullText); // Search in full text too

            terms.forEach(term => {
                if (normTitle.includes(term)) score += 10;      // Title match is best
                if (normTags.includes(term)) score += 8;        // Tag match is strong
                if (normSummary.includes(term)) score += 5;     // Summary match
                if (normContent.includes(term)) score += 1;     // Content match
            });

            return { advice, score };
        });

        // C. Sort & Filter
        const topMatches = results
            .filter(r => r.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 3); // Top 3 matches

        // D. Response Construction
        if (topMatches.length > 0) {
            let reply = `<p class="mb-2">لقيت لك نصايح ممتازة بخصوص سؤالك:</p>`;
            
            topMatches.forEach(match => {
                reply += `
                    <div class="mb-3 bg-black/20 p-3 rounded-lg border border-gray-700 hover:border-b-primary cursor-pointer transition-colors" 
                         onclick="document.dispatchEvent(new CustomEvent('openAdvice', {detail: '${match.advice.id}'}))">
                        <div class="font-bold text-b-hl-light text-sm mb-1">
                            <i class="fas fa-star text-xs ml-1"></i>${match.advice.title}
                        </div>
                        <div class="text-xs text-gray-300 line-clamp-2">${match.advice.summary}</div>
                    </div>
                `;
            });
            
            reply += `<p class="text-xs text-gray-400 mt-2">اضغط على أي كارت عشان تشوف النصيحة كاملة 👆</p>`;
            return reply;
        } else {
            // Fallback / General Chat
            return this.getFallbackResponse(normalizedQuery);
        }
    }

    normalizeText(text) {
        if (!text) return "";
        return text.toLowerCase()
            .replace(/(أ|إ|آ)/g, 'ا')
            .replace(/ى/g, 'ي')
            .replace(/ة/g, 'ه')
            .replace(/[^a-zA-Z0-9\u0600-\u06FF ]/g, ' '); // Keep Arabic & English only
    }

    getFallbackResponse(query) {
        if (query.includes('شكرا') || query.includes('تسلم')) {
            return "العفو يا هندسة! بالتوفيق دايماً ❤️";
        }
        if (query.includes('سلام') || query.includes('باي')) {
            return "مع السلامة! في انتظارك في أي وقت.";
        }
        return `
            للأسف ملقيتش نصيحة مباشرة عن الموضوع ده في قاعدة البيانات الحالية 😔.
            <br>
            جرب تسأل بكلمات مفتاحية زي:
            <span class="text-b-hl-light">MATLAB</span>, 
            <span class="text-b-hl-light">Verification</span>, 
            <span class="text-b-hl-light">مشروع التخرج</span>.
        `;
    }
}

// ==================== EXPERTS PAGE LOGIC ====================
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const grid = document.getElementById('advice-grid');
    const storiesGrid = document.getElementById('stories-grid');
    const faqContainer = document.getElementById('faq-container');
    const noResults = document.getElementById('no-results');
    
    const filterSearch = document.getElementById('filter-search');
    const filterCategory = document.getElementById('filter-category');
    const filterSource = document.getElementById('filter-source');
    const resetFiltersBtn = document.getElementById('reset-filters');
    const clearSearchBtn = document.getElementById('clear-search');
    
    const modal = document.getElementById('advice-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalTitle = document.getElementById('modal-title');
    const modalTags = document.getElementById('modal-tags');
    const modalFullText = document.getElementById('modal-full-text');
    const modalSource = document.getElementById('modal-source');

    const totalAdviceSpan = document.getElementById('total-advice');
    const showingCountSpan = document.getElementById('showing-count');
    const totalCountSpan = document.getElementById('total-count');

    // State
    let allAdvice = [];
    let allData = {};
    let activeTag = 'All';
    let expertBot = null; // Bot Instance

    // ==================== UTILITY FUNCTIONS ====================
    
    function getTagClass(tag) {
        const tagLower = tag.toLowerCase();
        if (tagLower.includes('gp')) {
            return 'bg-blue-500/20 text-blue-400 border-blue-500';
        } else if (tagLower.includes('matlab')) {
            return 'bg-purple-500/20 text-purple-400 border-purple-500';
        } else if (tagLower.includes('verification')) {
            return 'bg-green-500/20 text-green-400 border-green-500';
        } else if (tagLower.includes('fpga')) {
            return 'bg-orange-500/20 text-orange-400 border-orange-500';
        } else if (tagLower.includes('career')) {
            return 'bg-pink-500/20 text-pink-400 border-pink-500';
        } else if (tagLower.includes('presentation')) {
            return 'bg-yellow-500/20 text-yellow-400 border-yellow-500';
        } else if (tagLower.includes('rtl')) {
            return 'bg-cyan-500/20 text-cyan-400 border-cyan-500';
        }
        return 'bg-b-primary/20 text-b-hl-light border-b-primary';
    }

    function getCategoryIcon(tags) {
        if (tags.some(t => t.includes('GP'))) {
            return '<i class="fas fa-graduation-cap fa-lg text-blue-400"></i>';
        } else if (tags.some(t => t.includes('MATLAB'))) {
            return '<i class="fas fa-calculator fa-lg text-purple-400"></i>';
        } else if (tags.some(t => t.includes('Verification'))) {
            return '<i class="fas fa-check-circle fa-lg text-green-400"></i>';
        } else if (tags.some(t => t.includes('FPGA'))) {
            return '<i class="fas fa-microchip fa-lg text-orange-400"></i>';
        } else if (tags.some(t => t.includes('Career'))) {
            return '<i class="fas fa-briefcase fa-lg text-pink-400"></i>';
        } else if (tags.some(t => t.includes('Presentation'))) {
            return '<i class="fas fa-presentation fa-lg text-yellow-400"></i>';
        } else if (tags.some(t => t.includes('RTL'))) {
            return '<i class="fas fa-code fa-lg text-cyan-400"></i>';
        }
        return '<i class="fas fa-lightbulb fa-lg text-b-hl-light"></i>';
    }

    // ==================== RENDER FUNCTIONS ====================

    function renderAdvice(adviceList) {
        grid.innerHTML = '';

        if (adviceList.length === 0) {
            noResults.classList.remove('hidden');
            showingCountSpan.textContent = '0';
            return;
        }

        noResults.classList.add('hidden');
        showingCountSpan.textContent = adviceList.length;
        
        adviceList.forEach((advice, index) => {
            const card = document.createElement('div');
            card.className = 'bg-b-surface p-6 rounded-2xl border border-b-border shadow-lg card-hover-effect cursor-pointer flex flex-col justify-between animate-slide-in-up';
            card.style.animationDelay = `${index * 0.05}s`;

            const tagsHtml = advice.tags.slice(0, 2).map(tag => {
                const tagInfo = allData.filterTags ? allData.filterTags.find(t => t.tag === tag) : null;
                const tagName = tagInfo ? tagInfo.name.replace(/\s*\(GP\)/g, "") : tag.replace('#', '');
                return `<span class="text-xs font-medium rounded-full px-3 py-1 border ${getTagClass(tag)}">${tagName}</span>`;
            }).join(' ');

            const moreTagsHtml = advice.tags.length > 2 
                ? `<span class="text-xs font-medium bg-b-border text-gray-400 rounded-full px-3 py-1">+${advice.tags.length - 2}</span>` 
                : '';

            card.innerHTML = `
                <div>
                    <div class="flex justify-between items-start mb-4">
                        <span class="text-3xl">${getCategoryIcon(advice.tags)}</span>
                        <div class="flex flex-wrap gap-2 justify-end">
                            ${tagsHtml}
                            ${moreTagsHtml}
                        </div>
                    </div>
                    <h3 class="text-xl font-bold text-b-text mb-3 hover:text-b-hl-light transition-colors">${advice.title}</h3>
                    <p class="text-md text-gray-300 line-clamp-3 mb-4">${advice.summary}</p>
                </div>
                <div>
                    <div class="mb-4 pt-4 border-t border-b-border">
                        <p class="text-sm text-b-hl-light truncate" title="${advice.source}">
                            <i class="fas fa-user-graduate ml-1"></i>
                            ${advice.source}
                        </p>
                    </div>
                    <button class="w-full py-2 bg-b-primary text-white rounded-lg hover:bg-b-hl-light hover:text-black transition-all font-semibold">
                        <i class="fas fa-book-open ml-1"></i>
                        اقرأ المزيد
                    </button>
                </div>
            `;
            
            card.addEventListener('click', () => openAdviceModal(advice));
            grid.appendChild(card);
        });
    }
    
    function renderStories(stories) {
        if (!storiesGrid || !stories) return;
        storiesGrid.innerHTML = '';
        
        stories.forEach((story, index) => {
            const card = document.createElement('div');
            card.className = 'bg-b-bg p-6 rounded-2xl border border-b-border shadow-xl hover:shadow-2xl hover:border-b-hl-yellow transition-all duration-300 animate-slide-in-up';
            card.style.animationDelay = `${index * 0.1}s`;
            
            const tagsHtml = story.tags.map(tag => {
                const tagInfo = allData.filterTags ? allData.filterTags.find(t => t.tag === tag) : null;
                const tagName = tagInfo ? tagInfo.name.replace(/\s*\(GP\)/g, "") : tag.replace('#', '');
                return `<span class="text-xs font-medium rounded-full px-3 py-1 border ${getTagClass(tag)}">${tagName}</span>`;
            }).join(' ');

            card.innerHTML = `
                <div class="flex flex-wrap gap-2 mb-4">${tagsHtml}</div>
                <h3 class="text-xl font-bold text-b-hl-yellow mb-4">
                    <i class="fas fa-star ml-2"></i>
                    ${story.title}
                </h3>
                <div class="text-md text-gray-300 leading-7 space-y-3 story-content">${story.story}</div>
                <p class="text-sm font-semibold text-b-hl-light mt-6 pt-4 border-t border-b-border">
                    <i class="fas fa-quote-right ml-2"></i>
                    ${story.source}
                </p>
            `;
            storiesGrid.appendChild(card);
        });
    }

    function renderFAQ(faqs) {
        if (!faqContainer || !faqs) return;
        faqContainer.innerHTML = '';
        
        faqs.forEach((faq, index) => {
            const faqItem = document.createElement('div');
            faqItem.className = 'bg-b-surface border border-b-border rounded-lg overflow-hidden animate-slide-in-up';
            faqItem.style.animationDelay = `${index * 0.05}s`;
            
            faqItem.innerHTML = `
                <h3>
                    <button type="button" class="accordion-button flex justify-between items-center w-full p-5 font-semibold text-b-text text-right hover:bg-b-bg transition-colors duration-200">
                        <span class="text-lg">${faq.question}</span>
                        <span class="accordion-icon flex-shrink-0 mr-3">
                            <i class="fas fa-chevron-down text-b-primary transition-transform duration-300"></i>
                        </span>
                    </button>
                </h3>
                <div class="accordion-content bg-b-bg border-t border-b-border max-h-0 overflow-hidden transition-all duration-300">
                    <div class="p-5 text-gray-300 leading-7 faq-answer">${faq.answer}</div>
                    <p class="px-5 pb-5 text-xs font-semibold text-b-hl-light border-t border-b-border/50 pt-3">
                        <i class="fas fa-info-circle ml-1"></i>
                        المصدر: ${faq.source}
                    </p>
                </div>
            `;
            faqContainer.appendChild(faqItem);
        });
        
        faqContainer.querySelectorAll('.accordion-button').forEach(button => {
            button.addEventListener('click', () => {
                const content = button.parentElement.nextElementSibling;
                const icon = button.querySelector('.accordion-icon i');
                const isOpen = content.style.maxHeight && content.style.maxHeight !== '0px';
                
                faqContainer.querySelectorAll('.accordion-content').forEach(c => {
                    c.style.maxHeight = '0';
                });
                faqContainer.querySelectorAll('.accordion-icon i').forEach(i => {
                    i.style.transform = 'rotate(0deg)';
                });
                
                if (!isOpen) {
                    content.style.maxHeight = content.scrollHeight + 'px';
                    icon.style.transform = 'rotate(180deg)';
                }
            });
        });
    }

    // ==================== MODAL FUNCTIONS ====================

    function openAdviceModal(advice) {
        modalTitle.textContent = advice.title;
        modalSource.textContent = advice.source;
        modalFullText.innerHTML = advice.fullText;

        modalTags.innerHTML = advice.tags.map(tag => {
            const tagInfo = allData.filterTags ? allData.filterTags.find(t => t.tag === tag) : null;
            const tagName = tagInfo ? tagInfo.name : tag.replace('#', '');
            return `<span class="text-sm font-medium rounded-full px-4 py-2 border ${getTagClass(tag)}">${tagName}</span>`;
        }).join(' ');

        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        const modalContent = document.getElementById('modal-content');
        if (modalContent) {
            modalContent.scrollTop = 0;
        }
    }

    function closeAdviceModal() {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }

    // Event to allow bot to open modal
    document.addEventListener('openAdvice', (e) => {
        const adviceId = e.detail;
        const advice = allAdvice.find(a => a.id === adviceId);
        if (advice) openAdviceModal(advice);
    });

    // ==================== FILTER FUNCTIONS ====================

    function applyFilters() {
        const searchTerm = filterSearch.value.toLowerCase().trim();
        const category = filterCategory.value;
        const source = filterSource.value;

        const filteredAdvice = allAdvice.filter(advice => {
            const tagMatch = (activeTag === 'All') || advice.tags.includes(activeTag);
            const categoryMatch = (category === 'All') || advice.tags.includes(category);
            const sourceMatch = (source === 'all') || advice.source.includes(source);
            const searchMatch = (searchTerm === '') ||
                (advice.title.toLowerCase().includes(searchTerm)) ||
                (advice.summary.toLowerCase().includes(searchTerm)) ||
                (advice.source.toLowerCase().includes(searchTerm)) ||
                (advice.tags.some(tag => tag.toLowerCase().includes(searchTerm)));

            return tagMatch && categoryMatch && sourceMatch && searchMatch;
        });

        renderAdvice(filteredAdvice);
    }

    function resetFilters() {
        filterSearch.value = '';
        filterCategory.value = 'All';
        filterSource.value = 'all';
        activeTag = 'All';
        applyFilters();
    }

    // ==================== DATA LOADING ====================

    async function loadAdvice() {
        try {
            const response = await fetch('../data/experts_data.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            allData = await response.json();
            
            // Handle combined data or array
            allAdvice = allData.Advice || (Array.isArray(allData) ? allData : []);
            
            // Filter duplicates
            allAdvice = allAdvice.filter((advice, index, self) =>
                index === self.findIndex(a => a.title === advice.title)
            );
            
            // Populate category filter
            if (allData.filterTags) {
                allData.filterTags.forEach(tagInfo => {
                    if (tagInfo.tag !== 'All') {
                        const option = document.createElement('option');
                        option.value = tagInfo.tag;
                        option.textContent = tagInfo.name;
                        filterCategory.appendChild(option);
                    }
                });
            }
            
            // Populate source filter
            const sources = [...new Set(allAdvice.map(a => a.source))];
            sources.forEach(source => {
                const option = document.createElement('option');
                option.value = source;
                option.textContent = source.length > 40 ? source.substring(0, 40) + '...' : source;
                filterSource.appendChild(option);
            });

            // Render content
            totalAdviceSpan.textContent = allAdvice.length;
            totalCountSpan.textContent = allAdvice.length;
            renderAdvice(allAdvice);
            
            if (allData.expertStories) renderStories(allData.expertStories);
            if (allData.expertFAQ) renderFAQ(allData.expertFAQ);

            // INITIALIZE EXPERT BOT AFTER DATA LOADED
            expertBot = new ExpertBot(allAdvice);
            
        } catch (error) {
            console.error("Fetch error: ", error);
            grid.innerHTML = '<p class="text-red-500 text-center col-span-full">فشل تحميل بيانات النصائح. برجاء المحاولة لاحقاً.</p>';
        }
    }

    // ==================== EVENT LISTENERS ====================

    [filterSearch, filterCategory, filterSource].forEach(element => {
        element.addEventListener('input', applyFilters);
    });

    resetFiltersBtn.addEventListener('click', resetFilters);
    clearSearchBtn.addEventListener('click', resetFilters);
    modalCloseBtn.addEventListener('click', closeAdviceModal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeAdviceModal();
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeAdviceModal();
    });

    // ==================== INITIALIZATION ====================
    initMobileMenu();
    loadAdvice();
});