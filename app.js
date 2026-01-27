import { dataList } from './data.js';

// State
let searchTerm = '';
let activeCategory = '全部';
let activeSort = 'default';
let activeMonth = 'all';
const categories = ['全部', '蔬菜', '水果', '肉类', '海鲜', '豆制品', '菌菇', '内脏'];

// DOM Elements
const searchInput = document.getElementById('searchInput');
const categoryContainer = document.getElementById('categoryContainer');
const foodGrid = document.getElementById('foodGrid');
const emptyState = document.getElementById('emptyState');
const countDisplay = document.getElementById('countDisplay');
const currentCategoryTitle = document.getElementById('currentCategoryTitle');
const monthDisplay = document.getElementById('monthDisplay');

// Sort & Month Elements
const sortButtons = document.querySelectorAll('[data-sort]');
const monthButtons = document.querySelectorAll('[data-month]');

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

// ========== 核心函数：季节字符串转月份数组 ==========
function seasonToMonths(seasonStr) {
    if (!seasonStr) return [];
    if (seasonStr.includes('全年')) return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    let months = new Set();
    const monthMap = { '春': [3, 4, 5], '夏': [6, 7, 8], '秋': [9, 10, 11], '冬': [12, 1, 2] };

    // 1. 处理季节词 (春夏/秋冬等)
    Object.keys(monthMap).forEach(key => {
        if (seasonStr.includes(key)) monthMap[key].forEach(m => months.add(m));
    });

    // 2. 处理数字范围 (如 3–5月, 10–12月)
    // 匹配类似 3-5, 10-翌年2, 9-11 等格式
    const ranges = seasonStr.match(/(\d+)[–-](?:翌年)?(\d+)/g);
    if (ranges) {
        ranges.forEach(range => {
            const [start, end] = range.match(/\d+/g).map(Number);
            if (start <= end) {
                for (let i = start; i <= end; i++) months.add(i);
            } else {
                // 处理跨年，如 10-2月
                for (let i = start; i <= 12; i++) months.add(i);
                for (let i = 1; i <= end; i++) months.add(i);
            }
        });
    }
    
    // 3. 处理单个月份 (如 4月, 6月)
    const singles = seasonStr.match(/(\d+)月/g);
    if (singles && !ranges) {
        singles.forEach(s => months.add(parseInt(s)));
    }

    return Array.from(months);
}

// ========== 渲染分类 ==========
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

// ========== 渲染食材卡片 ==========
function renderCards() {
    // 1. 过滤
    let filteredData = dataList.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === '全部' || item.category === activeCategory;
        
        // 月份筛选逻辑
        let matchesMonth = true;
        if (activeMonth !== 'all') {
            const availableMonths = seasonToMonths(item.season);
            matchesMonth = availableMonths.includes(parseInt(activeMonth));
        }
        
        return matchesSearch && matchesCategory && matchesMonth;
    });

    // 2. 排序
    if (activeSort === 'season') {
        filteredData.sort((a, b) => {
            const monthA = seasonToMonths(a.season)[0] || 13;
            const monthB = seasonToMonths(b.season)[0] || 13;
            return monthA - monthB;
        });
    } else if (activeSort === 'category') {
        const order = ['蔬菜', '水果', '肉类', '海鲜', '豆制品', '菌菇', '内脏'];
        filteredData.sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category));
    }

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

// ========== 设置事件监听器 ==========
function setupEventListeners() {
    // 搜索
    searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        renderCards();
    });

    // 分类
    categoryContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (btn) {
            activeCategory = btn.dataset.category;
            renderCategories();
            renderCards();
        }
    });

    // 排序
    sortButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            activeSort = e.target.dataset.sort;
            
            // 更新按钮样式
            sortButtons.forEach(b => {
                b.classList.remove('bg-green-600', 'text-white');
                b.classList.add('bg-gray-100', 'text-gray-600');
            });
            e.target.classList.add('bg-green-600', 'text-white');
            e.target.classList.remove('bg-gray-100', 'text-gray-600');
            
            renderCards();
        });
    });

    // 月份筛选
    monthButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            activeMonth = e.target.dataset.month;
            
            // 更新按钮样式
            monthButtons.forEach(b => {
                b.classList.remove('bg-green-600', 'text-white');
                b.classList.add('bg-gray-100', 'text-gray-600');
            });
            e.target.classList.add('bg-green-600', 'text-white');
            e.target.classList.remove('bg-gray-100', 'text-gray-600');
            
            // 更新月份显示文本
            if (activeMonth === 'all') {
                monthDisplay.textContent = '';
            } else {
                monthDisplay.textContent = `（${activeMonth}月已选）`;
            }
            
            renderCards();
        });
    });

    // Modal Close
    const closeActions = [modalBackdrop, closeModalBtn, confirmBtn];
    closeActions.forEach(el => el.addEventListener('click', closeModal));
}

// ========== 模态框相关函数 ==========
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
