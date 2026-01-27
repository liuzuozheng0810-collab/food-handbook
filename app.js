import { dataList } from './data.js';

// State
let searchTerm = '';
let activeCategory = '全部';
const categories = ['全部', '蔬菜', '水果', '肉类', '海鲜', '豆制品', '菌菇', '内脏'];

// DOM Elements
const searchInput = document.getElementById('searchInput');
const categoryContainer = document.getElementById('categoryContainer');
const foodGrid = document.getElementById('foodGrid');
const emptyState = document.getElementById('emptyState');
const countDisplay = document.getElementById('countDisplay');
const currentCategoryTitle = document.getElementById('currentCategoryTitle');

// Modal Elements
const foodModal = document.getElementById('foodModal');
const modalContent = document.getElementById('modalContent');
const modalBackdrop = document.getElementById('modalBackdrop');
const closeModalBtn = document.getElementById('closeModalBtn');
const confirmBtn = document.getElementById('confirmBtn');

const modalTitle = document.getElementById('modalTitle');
const modalEmoji = document.getElementById('modalEmoji');
const modalCategoryBadge = document.getElementById('modalCategoryBadge');
const modalSeason = document.getElementById('modalSeason');
const modalOrigin = document.getElementById('modalOrigin');
const modalRecipe = document.getElementById('modalRecipe');

// Initialize
function init() {
    renderCategories();
    renderCards();
    setupEventListeners();
}

function renderCategories() {
    categoryContainer.innerHTML = categories.map(cat => `
        <button
            data-category="${cat}"
            class="whitespace-nowrap px-5 py-2 rounded-full text-xs font-medium transition-all ${
                activeCategory === cat
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 active:bg-gray-200'
            }"
        >
            ${cat}
        </button>
    `).join('');
}

function renderCards() {
    const filteredData = dataList.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === '全部' || item.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    countDisplay.textContent = `共 ${filteredData.length} 种`;
    currentCategoryTitle.textContent = activeCategory === '全部' ? '全部食材' : activeCategory;

    if (filteredData.length === 0) {
        foodGrid.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }

    foodGrid.classList.remove('hidden');
    emptyState.classList.add('hidden');

    foodGrid.innerHTML = filteredData.map(item => {
        const colors = {
            '蔬菜': 'bg-green-50 text-green-700 border-green-200',
            '水果': 'bg-red-50 text-red-700 border-red-200',
            '肉类': 'bg-orange-50 text-orange-700 border-orange-200',
            '海鲜': 'bg-blue-50 text-blue-700 border-blue-200',
            '豆制品': 'bg-yellow-50 text-yellow-700 border-yellow-200',
            '菌菇': 'bg-emerald-50 text-emerald-700 border-emerald-200',
            '内脏': 'bg-amber-50 text-amber-700 border-amber-200',
        };
        const badgeClass = colors[item.category] || 'bg-gray-50 text-gray-700 border-gray-200';

        return `
        <div 
            class="food-card bg-white border border-gray-100 rounded-xl px-3 py-2 flex items-center justify-between active:scale-95"
            onclick="window.openModal(${JSON.stringify(item).replace(/"/g, '&quot;')})"
        >
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                    <span class="font-semibold text-sm truncate">${item.name}</span>
                    <span class="text-[10px] px-1.5 py-0.5 rounded border ${badgeClass}">
                        ${item.category}
                    </span>
                </div>
                <div class="text-[11px] text-gray-500 truncate">
                    上市：${item.season}
                </div>
            </div>
            <div class="text-gray-300 text-sm pl-2">›</div>
        </div>
        `;
    }).join('');
}


function setupEventListeners() {
    searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        renderCards();
    });

    categoryContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (btn) {
            activeCategory = btn.dataset.category;
            renderCategories();
            renderCards();
        }
    });

    // Modal Close
    const closeActions = [modalBackdrop, closeModalBtn, confirmBtn];
    closeActions.forEach(el => el.addEventListener('click', closeModal));
}

function openModal(item) {
    const categoryEmojis = {
        '蔬菜': '🥬',
        '水果': '🍎',
        '肉类': '🥩',
        '海鲜': '🦐',
        '豆制品': '🫘',
        '菌菇': '🍄',
        '内脏': '💔',
    };
    
    modalTitle.textContent = item.name;
    modalCategoryBadge.textContent = item.category;
    modalSeason.textContent = item.season;
    modalOrigin.textContent = item.origin;
    modalRecipe.textContent = item.recipe;
    modalEmoji.textContent = categoryEmojis[item.category] || '📦';
    
    foodModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent scroll
}

function closeModal() {
    foodModal.classList.add('hidden');
    document.body.style.overflow = '';
}

// Expose openModal to global for inline onclick
window.openModal = openModal;

init();