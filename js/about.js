document.addEventListener('DOMContentLoaded', () => {
    // Initialize Feather Icons
    feather.replace();
    
    // جلب عناصر الحاويات
    const creatorContainer = document.getElementById('creator-container');
    const contributorsContainer = document.getElementById('contributors-container');
    const expertsContainer = document.getElementById('experts-container');

    // جلب عناصر النافذة العائمة (Modal)
    const modalOverlay = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');
    const modalBody = document.getElementById('modal-body');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    let allPeopleData = {};

    // دالة لإنشاء كرت شخص
    function createPersonCard(person, isExpert = false) {
        if (isExpert) {
            // كروت الخبراء - تصميم مصغر
            return `
                <div class="contributor-card group cursor-pointer transform transition-all duration-300 hover:scale-105 animate-fade-in-up" data-person-id="${person.id}">
                    <div class="bg-b-surface border border-b-border rounded-xl p-4 hover:border-b-primary hover:shadow-xl hover:shadow-b-primary/20 transition-all h-full">
                        <img class="w-20 h-20 rounded-full mx-auto object-cover border-3 border-b-border group-hover:border-b-hl-light transition-all shadow-lg" src="${person.imageUrl}" alt="${person.name}">
                        <div class="mt-4 text-center">
                            <h3 class="font-bold text-sm text-white group-hover:text-b-hl-light transition-colors line-clamp-2">${person.name}</h3>
                            <p class="text-xs text-gray-400 mt-2 line-clamp-2">${person.title}</p>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // كروت المنشئ والمساهمين - تصميم كبير
            return `
                <div class="contributor-card group cursor-pointer w-full max-w-sm mx-auto transform transition-all duration-300 hover:scale-105 animate-fade-in-up" data-person-id="${person.id}">
                    <div class="bg-b-surface border border-b-border rounded-2xl overflow-hidden shadow-xl hover:border-b-primary hover:shadow-2xl hover:shadow-b-primary/20 transition-all h-full">
                        <div class="p-8 text-center">
                            <div class="relative inline-block">
                                <img class="w-32 h-32 md:w-40 md:h-40 rounded-full mx-auto object-cover border-4 border-b-border group-hover:border-b-hl-light transition-all shadow-lg" src="${person.imageUrl}" alt="${person.name}">
                                <div class="absolute inset-0 rounded-full bg-b-primary opacity-0 group-hover:opacity-10 transition-opacity"></div>
                            </div>
                            <div class="mt-6">
                                <h3 class="font-bold text-xl md:text-2xl mb-2 text-white group-hover:text-b-hl-light transition-colors">${person.name}</h3>
                                <p class="text-base text-gray-400 group-hover:text-b-hl-medium transition-colors">${person.title}</p>
                            </div>
                            <div class="mt-4 flex justify-center">
                                <span class="inline-flex items-center gap-2 text-sm text-b-primary group-hover:text-b-hl-light transition-colors">
                                    <i data-feather="info" class="w-4 h-4"></i>
                                    اضغط للمزيد
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    // دالة لملء النافذة العائمة ببيانات الشخص
    function populateModal(person) {
        let socialsHtml = person.socials && person.socials.length > 0 
            ? '<div class="flex flex-wrap gap-3 justify-center mt-8">' +
              person.socials.map(social => `
                <a href="${social.url}" target="_blank" rel="noopener noreferrer" 
                   class="inline-flex items-center gap-2 bg-b-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-b-hl-light hover:text-black transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                    <i data-feather="external-link" class="w-4 h-4"></i>
                    ${social.name}
                </a>
              `).join('') +
              '</div>'
            : '';

        modalBody.innerHTML = `
            <div class="relative">
                <div class="absolute top-0 right-0 w-32 h-32 bg-b-primary opacity-5 rounded-full -mr-16 -mt-16"></div>
                <div class="relative z-10">
                    <div class="flex justify-center mb-6">
                        <div class="relative">
                            <img class="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-b-primary shadow-2xl" src="${person.imageUrl}" alt="${person.name}">
                            <div class="absolute inset-0 rounded-full bg-gradient-to-br from-b-primary/20 to-transparent"></div>
                        </div>
                    </div>
                    
                    <h2 class="text-3xl md:text-4xl font-bold text-center mb-3 gradient-text">${person.name}</h2>
                    <p class="text-lg text-center text-b-hl-light mb-8 font-semibold">${person.title}</p>
                    
                    <div class="space-y-6">
                        <div class="bg-b-bg bg-opacity-50 rounded-xl p-6 border border-b-border">
                            <div class="flex items-start gap-3 mb-3">
                                <i data-feather="user" class="w-5 h-5 text-b-hl-green flex-shrink-0 mt-1"></i>
                                <strong class="text-b-hl-green text-lg">نبذة:</strong>
                            </div>
                            <p class="text-gray-300 leading-relaxed mr-8">${person.bio}</p>
                        </div>
                        
                        <div class="bg-b-bg bg-opacity-50 rounded-xl p-6 border border-b-border">
                            <div class="flex items-start gap-3 mb-3">
                                <i data-feather="briefcase" class="w-5 h-5 text-b-hl-yellow flex-shrink-0 mt-1"></i>
                                <strong class="text-b-hl-yellow text-lg">دوره في الموقع:</strong>
                            </div>
                            <p class="text-gray-300 leading-relaxed mr-8">${person.role}</p>
                        </div>
                    </div>
                    
                    ${socialsHtml}
                </div>
            </div>
        `;
        
        // إعادة تهيئة أيقونات Feather بعد إضافة المحتوى
        feather.replace();
    }

    // دالة لفتح النافذة
    function openModal() {
        modalOverlay.classList.remove('hidden');
        modalOverlay.classList.add('flex');
        document.body.style.overflow = 'hidden'; // منع التمرير في الخلفية
        
        // إضافة تأثير الظهور
        setTimeout(() => {
            modalOverlay.classList.add('opacity-100');
            modalContent.classList.add('scale-100');
        }, 10);
    }

    // دالة لإغلاق النافذة
    function closeModal() {
        modalOverlay.classList.remove('opacity-100');
        modalContent.classList.remove('scale-100');
        
        setTimeout(() => {
            modalOverlay.classList.add('hidden');
            modalOverlay.classList.remove('flex');
            document.body.style.overflow = ''; // إعادة التمرير
            modalBody.innerHTML = '';
        }, 300);
    }

    // جلب البيانات وملء الصفحة
    async function initPage() {
        try {
            const response = await fetch('../data/about_data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // تجميع كل البيانات في كائن واحد لسهولة الوصول
            allPeopleData = {
                ...data.creator.reduce((acc, p) => ({ ...acc, [p.id]: p }), {}),
                ...data.mainContributor.reduce((acc, p) => ({ ...acc, [p.id]: p }), {}),
                ...data.contributors.reduce((acc, p) => ({ ...acc, [p.id]: p }), {}),
                ...data.experts.reduce((acc, p) => ({ ...acc, [p.id]: p }), {})
            };
            
            // ملء كارت المنشئ
            if (data.creator && data.creator.length > 0) {
                creatorContainer.innerHTML = data.creator.map(person => createPersonCard(person, false)).join('');
            }

            // ملء كروت المساهمين (الرئيسي + الآخرين)
            const allContributors = [...data.mainContributor, ...data.contributors];
            if (allContributors.length > 0) {
                contributorsContainer.innerHTML = allContributors.map(person => createPersonCard(person, false)).join('');
            }

            // ملء كروت الخبراء
            if (data.experts && data.experts.length > 0) {
                expertsContainer.innerHTML = data.experts.map(person => createPersonCard(person, true)).join('');
            }

            // إعادة تهيئة أيقونات Feather بعد إضافة الكروت
            feather.replace();

            // إضافة مستمعي الأحداث لجميع الكروت
            document.querySelectorAll('.contributor-card').forEach(card => {
                card.addEventListener('click', () => {
                    const personId = card.dataset.personId;
                    const personData = allPeopleData[personId];
                    if (personData) {
                        populateModal(personData);
                        openModal();
                    } else {
                        console.error('لم يتم العثور على بيانات للشخص:', personId);
                    }
                });
            });

        } catch (error) {
            console.error('فشل في جلب أو معالجة بيانات "عن الموقع":', error);
            const errorMessage = `
                <div class="text-center py-10">
                    <i data-feather="alert-circle" class="w-16 h-16 text-red-400 mx-auto mb-4"></i>
                    <p class="text-red-400 text-lg font-semibold">حدث خطأ أثناء تحميل البيانات</p>
                    <p class="text-gray-500 mt-2">الرجاء المحاولة مرة أخرى لاحقاً</p>
                </div>
            `;
            if (creatorContainer) creatorContainer.innerHTML = errorMessage;
            feather.replace();
        }
    }

    // دالة لتهيئة القائمة المحمولة
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

    // إضافة مستمعي أحداث إغلاق النافذة
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
    }
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
    }

    // إضافة دعم مفتاح ESC لإغلاق النافذة
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modalOverlay.classList.contains('hidden')) {
            closeModal();
        }
    });

    // بدء تحميل الصفحة
    initMobileMenu();
    initPage();
});