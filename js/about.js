document.addEventListener('DOMContentLoaded', () => {
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
        const cardSizeClasses = isExpert 
            ? 'w-full' // الكروت في قسم الخبراء تأخذ عرضاً كاملاً في شبكتهم
            : 'w-full max-w-sm mx-auto'; // كروت المساهمين والمنشئ

        return `
            <div class="contributor-card ${cardSizeClasses} rounded-xl overflow-hidden shadow-lg cursor-pointer p-6 text-center" data-person-id="${person.id}">
                <img class="w-32 h-32 md:w-40 md:h-40 rounded-full mx-auto object-cover border-4 border-[#333] shadow-md" src="${person.imageUrl}" alt="${person.name}">
                <div class="py-4">
                    <h3 class="font-bold text-xl md:text-2xl mb-1 text-[#F6F6F6]">${person.name}</h3>
                    <p class="text-base text-[#A2D5C6]">${person.title}</p>
                </div>
            </div>
        `;
    }

    // دالة لملء النافذة العائمة ببيانات الشخص
    function populateModal(person) {
        let socialsHtml = person.socials.length > 0 
            ? '<div class="flex flex-wrap gap-3 justify-center mt-6">' +
              person.socials.map(social => `
                <a href="${social.url}" target="_blank" rel="noopener noreferrer" class="bg-[#006A67] text-white py-2 px-5 rounded-lg font-semibold hover:bg-[#CFFFE2] hover:text-black transition-colors duration-200">
                    ${social.name}
                </a>
              `).join('') +
              '</div>'
            : '';

        modalBody.innerHTML = `
            <img class="w-40 h-40 rounded-full mx-auto object-cover border-4 border-gray-700 shadow-lg" src="${person.imageUrl}" alt="${person.name}">
            <h2 class="text-3xl font-bold text-center mt-6 mb-2 text-[#CFFFE2]">${person.name}</h2>
            <p class="text-lg text-center text-[#A2D5C6] mb-6">${person.title}</p>
            
            <div class="text-right text-gray-300 space-y-4">
                <p class="leading-relaxed"><strong class="text-[#E6FF94]">نبذة:</strong> ${person.bio}</p>
                <p class="leading-relaxed"><strong class="text-[#E6FF94]">دوره في الموقع:</strong> ${person.role}</p>
            </div>
            
            ${socialsHtml}
        `;
    }

    // دالة لفتح النافذة
    function openModal() {
        modalOverlay.classList.remove('hidden');
        modalOverlay.classList.add('flex');
    }

    // دالة لإغلاق النافذة
    function closeModal() {
        modalOverlay.classList.add('hidden');
        modalOverlay.classList.remove('flex');
        modalBody.innerHTML = ''; // تفريغ المحتوى عند الإغلاق
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
            creatorContainer.innerHTML = '<p class="text-center text-red-400">حدث خطأ أثناء تحميل البيانات.</p>';
        }
    }

    // إضافة مستمعي أحداث إغلاق النافذة
    modalCloseBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        // الإغلاق عند الضغط على الخلفية فقط
        if (e.target === modalOverlay) {
            closeModal();
        }
    });

    // بدء تحميل الصفحة
    initPage();
});
