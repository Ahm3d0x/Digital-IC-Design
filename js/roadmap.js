

        // Creates a resource link (clickable or disabled)
        function createResourceLink(resource) {
            const baseClasses = "block p-4 rounded-lg transition-all duration-300 ease-out shadow-sm"; 
            const iconMap = { 'video': 'play-circle', 'website': 'link', 'book': 'book', 'paper': 'file-text', 'tool': 'tool', 'notes': 'edit-3', 'file': 'file', 'diploma': 'award', 'internship': 'briefcase', 'advice': 'message-circle', 'default': 'external-link' };
            const iconName = iconMap[resource.type] || iconMap['default'];
            const authorLinkHTML = resource.authorLink ? `<a href="${resource.authorLink}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-semibold">${resource.author}</a>` : `<strong class="text-white font-semibold">${resource.author}</strong>`;

            if (resource.link) {
                // Using Tailwind classes from config or global.css
                return `
                    <a href="${resource.link}" target="_blank" rel="noopener noreferrer" class="${baseClasses} bg-gray-800 hover:bg-gray-700 glow-on-hover group">
                        <div class="flex items-start gap-3">
                            <i data-feather="${iconName}" class="w-5 h-5 text-primary mt-1 flex-shrink-0"></i>
                            <div class="flex-grow">
                                ${authorLinkHTML}
                                <p class="text-sm text-gray-400 block mt-1">${resource.note || ''}</p>
                            </div>
                            <span class="ml-auto text-primary text-xs opacity-70 group-hover:opacity-100 transition-opacity flex-shrink-0 pt-1"> (افتح المصدر)</span>
                        </div>
                    </a>`;
            } else {
                 // Using Tailwind classes
                return `
                    <div class="${baseClasses} bg-gray-800 opacity-60 cursor-not-allowed">
                        <div class="flex items-start gap-3">
                            <i data-feather="${iconName}" class="w-5 h-5 text-gray-600 mt-1 flex-shrink-0"></i>
                            <div class="flex-grow">
                                ${authorLinkHTML}
                                <p class="text-sm text-gray-500 block mt-1">${resource.note || ''}</p>
                            </div>
                            <span class="ml-auto text-highlight-4 text-xs flex-shrink-0 pt-1"> (ابحث بالاسم)</span>
                        </div>
                    </div>`;
            }
        }

        // Creates guidance notes section
        function createGuidanceNotes(guidance, title = "نصيحة البوصلة", iconName = "navigation", iconColorClass = "text-highlight-2", borderColorClass = "border-highlight-2") {
            if (!guidance || guidance.length === 0) return '';
            const guidanceArray = Array.isArray(guidance) ? guidance : [guidance];

            // Using Tailwind classes
            let guidanceHTML = `
                <div class="my-6 p-5 bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-lg border-l-4 ${borderColorClass} shadow-md"> 
                    <h4 class="text-lg font-semibold ${iconColorClass} mb-4 flex items-center">
                        <i data-feather="${iconName}" class="w-5 h-5 inline-block ml-2 flex-shrink-0"></i>
                        ${title}
                    </h4>
                    <ul class="space-y-3 mr-1 text-gray-300">`; 
            guidanceArray.forEach(note => {
                const formattedNote = note.replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-100 font-semibold">$1</strong>');
                guidanceHTML += `
                    <li class="flex items-start gap-3"> 
                         <i data-feather="check-circle" class="w-4 h-4 text-primary mt-1 flex-shrink-0"></i>
                        <span>${formattedNote}</span>
                    </li>`;
            });
            guidanceHTML += '</ul></div>';
            return guidanceHTML;
        }

        // Creates modules within a track
        function createModules(modules) {
            if (!modules || modules.length === 0) return '<p class="text-gray-500 ml-10">لا توجد وحدات محددة لهذا المسار بعد.</p>';
             // Using Tailwind classes
            let modulesHTML = '<div class="space-y-10">'; 
            modules.forEach(module => {
                modulesHTML += `
                    <div class="border-b border-gray-800 pb-10 last:border-b-0 last:pb-0"> 
                        <h4 class="text-xl font-bold text-highlight-1 mb-4 flex items-center"><i data-feather="book-open" class="w-5 h-5 ml-3 text-primary"></i>${module.title}</h4> 
                        ${module.time ? `
                        <div class="flex items-center text-sm text-gray-400 mb-4 ml-10"> 
                            <i data-feather="clock" class="w-4 h-4 ml-2"></i>
                            <span>المدة التقريبية: ${module.time}</span>
                        </div>` : ''}
                        ${module.topics ? `<div class="ml-10 mb-5"><strong class="text-gray-100 block mb-1">المواضيع الرئيسية:</strong><p class="text-gray-300 leading-relaxed">${module.topics}</p></div>` : ''} 
                        
                        ${createGuidanceNotes(module.guidance, "إرشادات الوحدة", "alert-circle", "text-primary", "border-primary")}

                        ${module.resources && module.resources.length > 0 ? `
                        <h5 class="text-lg font-semibold text-gray-200 mb-4 mt-6 ml-10"><i data-feather="link" class="w-5 h-5 ml-2 inline-block -mt-1"></i>المصادر الموصى بها:</h5> 
                        <div class="space-y-4 ml-10"> 
                            ${module.resources.map(createResourceLink).join('')}
                        </div>` : ''}
                    </div>
                `;
            });
            modulesHTML += '</div>';
            return modulesHTML;
        }
        
        // Creates tracks within a phase
        function createTracks(tracks) {
             if (!tracks || tracks.length === 0) return '<p class="text-gray-500">لا توجد مسارات محددة لهذه المرحلة بعد.</p>';
            // Using Tailwind classes
            let tracksHTML = '<div class="space-y-12">'; 
            tracks.forEach((track, index) => {
                const parallelText = track.parallelWith ? `<span class="text-sm text-gray-500 font-normal ml-2">(بالتوازي مع ${track.parallelWith})</span>` : '';
                 tracksHTML += `
                    <div class="border border-gray-700 rounded-xl p-6 md:p-8 bg-black bg-opacity-30 shadow-lg card-hover-effect glow-on-hover"> 
                         <h3 class="text-2xl font-bold text-highlight-3 mb-6 flex items-center"><i data-feather="git-branch" class="w-6 h-6 ml-3 text-highlight-3"></i>${track.title} ${parallelText}</h3>
                         ${createModules(track.modules)}
                    </div>
                `;
            });
            tracksHTML += '</div>';
            return tracksHTML;
        }

        // Fetches data and renders the roadmap
        async function renderRoadmap() {
            const container = document.getElementById('roadmap-container');
            const loadingIndicator = document.getElementById('loading-indicator');
            if (!container || !loadingIndicator) return;

            try {
                // Adjust the path if roadmap-data.json is in a different directory
                const response = await fetch('../data/roadmap-data.json'); 
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const roadmapData = await response.json();

                loadingIndicator.remove(); 

                roadmapData.forEach((phase, index) => {
                    const staggerClass = `stagger-${index + 1}`;
                     // Using Tailwind classes
                    const phaseHTML = `
                        <div class="bg-panel border border-panel rounded-xl shadow-lg overflow-hidden animate-slide-in-up ${staggerClass} card-hover-effect glow-on-hover">
                            <button class="accordion-button w-full flex justify-between items-center p-6 text-right cursor-pointer hover:bg-gray-800 transition-colors duration-300" data-target="#content-${phase.id}">
                                <div class="flex-grow">
                                    <h3 class="text-2xl font-bold text-white">${phase.title}</h3>
                                    <p class="text-sm text-primary font-semibold mt-1">${phase.duration}</p>
                                </div>
                                <span class="accordion-icon ml-4 text-gray-400"> 
                                    <i data-feather="chevron-down" class="w-6 h-6 transition-transform duration-400"></i>
                                </span>
                            </button>
                            <div id="content-${phase.id}" class="accordion-content px-6 md:px-8"> 
                                <div class="border-t border-gray-700 pt-8"> 
                                    <p class="text-lg text-gray-300 mb-8 leading-relaxed">${phase.description}</p>
                                    ${createGuidanceNotes(phase.guidance)}
                                    ${createTracks(phase.tracks)}
                                </div>
                            </div>
                        </div>`;
                    container.innerHTML += phaseHTML;
                });

                feather.replace(); 
                initAccordion(roadmapData.length > 0 ? `content-${roadmapData[0].id}` : null); 

            } catch (error) {
                console.error("Failed to load or render roadmap data:", error);
                 if (loadingIndicator) loadingIndicator.remove();
                 // Using Tailwind classes
                container.innerHTML = `<div class="text-center py-10 px-4"><p class="text-lg text-red-400">⛔ حدث خطأ أثناء تحميل خريطة الطريق.</p><p class="text-sm text-gray-500 mt-2">الرجاء التأكد من وجود ملف <code class="bg-gray-700 px-1 rounded text-xs">roadmap-data.json</code> في المسار الصحيح والمحاولة مرة أخرى.</p></div>`;
            }
        }

        // Initializes accordion functionality
        function initAccordion(firstContentId = null) {
            const buttons = document.querySelectorAll('.accordion-button');
            buttons.forEach(button => {
                const iconElement = button.querySelector('.accordion-icon i'); 
                const targetID = button.getAttribute('data-target');
                const content = document.querySelector(targetID);

                if (!content) return; 

                button.addEventListener('click', () => {
                    const isOpen = content.classList.contains('open');
                    
                    document.querySelectorAll('.accordion-content.open').forEach(openContent => {
                        if (`#${openContent.id}` !== targetID) {
                            openContent.classList.remove('open');
                            const correspondingButton = document.querySelector(`[data-target="#${openContent.id}"]`);
                            if (correspondingButton) {
                                correspondingButton.classList.remove('open');
                                const correspondingIcon = correspondingButton.querySelector('.accordion-icon i');
                                if(correspondingIcon) correspondingIcon.style.transform = 'rotate(0deg)';
                            }
                        }
                    });

                    button.classList.toggle('open', !isOpen);
                    content.classList.toggle('open', !isOpen);
                    if(iconElement) iconElement.style.transform = !isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
                });
                
                if(iconElement) iconElement.style.transform = 'rotate(0deg)';
            });

            if (firstContentId) {
                const firstButton = document.querySelector(`[data-target="#${firstContentId}"]`);
                const firstContent = document.getElementById(firstContentId);
                const firstIcon = firstButton ? firstButton.querySelector('.accordion-icon i') : null;

                if (firstButton && firstContent) {
                    setTimeout(() => { 
                        if (!firstContent.classList.contains('open')) { 
                             firstButton.classList.add('open');
                            firstContent.classList.add('open');
                            if(firstIcon) firstIcon.style.transform = 'rotate(180deg)';
                         }
                     }, 200); 
                 }
             }
        }

         // Mobile Menu Toggle Logic
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

        // --- Run on DOMContentLoaded ---
        document.addEventListener('DOMContentLoaded', () => {
             feather.replace(); 
             initMobileMenu(); 
             renderRoadmap(); 
        });
