// 诗歌数据
let poemsData = [];
let filteredPoems = [];
let currentPage = 1;
const poemsPerPage = 12;

// DOM元素
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const authorFilter = document.getElementById('authorFilter');
const categoryFilter = document.getElementById('categoryFilter');
const sortFilter = document.getElementById('sortFilter');
const poemsList = document.getElementById('poemsList');
const pagination = document.getElementById('pagination');

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    // 加载诗歌数据
    loadPoemsData();
    
    // 绑定事件监听器
    bindEventListeners();
    
    // 初始化页面显示
    initializePage();
});

// 加载诗歌数据
function loadPoemsData() {
    console.log('开始加载诗歌数据...');
    console.log('poemsDatabase是否存在:', typeof poemsDatabase !== 'undefined');
    
    // 从poemsDatabase中提取数据
    if (typeof poemsDatabase !== 'undefined') {
        console.log('poemsDatabase内容:', poemsDatabase);
        console.log('poemsDatabase键的数量:', Object.keys(poemsDatabase).length);
        
        poemsData = Object.values(poemsDatabase).map(poem => ({
            id: poem.title,
            title: poem.title,
            author: poem.author,
            dynasty: poem.dynasty,
            content: poem.content,
            preview: poem.preview,
            tags: poem.tags,
            difficulty: poem.difficulty
        }));
        
        console.log('处理后的poemsData:', poemsData);
        console.log('poemsData长度:', poemsData.length);
    } else {
        console.error('poemsDatabase未定义！');
    }
    
    // 初始化筛选后的数据
    filteredPoems = [...poemsData];
    console.log('filteredPoems长度:', filteredPoems.length);
    
    // 填充作者筛选选项
    populateAuthorFilter();
}

// 填充作者筛选选项
function populateAuthorFilter() {
    const authors = [...new Set(poemsData.map(poem => poem.author))].sort();
    authors.forEach(author => {
        const option = document.createElement('option');
        option.value = author;
        option.textContent = author;
        authorFilter.appendChild(option);
    });
}

// 绑定事件监听器
function bindEventListeners() {
    // 搜索按钮点击事件
    searchBtn.addEventListener('click', performSearch);
    
    // 回车键搜索
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // 筛选器变化事件
    authorFilter.addEventListener('change', applyFilters);
    categoryFilter.addEventListener('change', applyFilters);
    sortFilter.addEventListener('change', applyFilters);
}

// 执行搜索
function performSearch() {
    const query = searchInput.value.trim();
    if (!query) {
        // 如果搜索框为空，重置为所有诗歌
        filteredPoems = [...poemsData];
    } else {
        // 执行搜索
        filteredPoems = searchPoems(query);
    }
    
    currentPage = 1;
    applyFilters();
}

// 搜索诗歌
function searchPoems(query) {
    const results = [];
    const lowerQuery = query.toLowerCase();
    
    poemsData.forEach(poem => {
        // 搜索诗名
        if (poem.title.toLowerCase().includes(lowerQuery)) {
            results.push(poem);
        }
        // 搜索作者
        else if (poem.author.toLowerCase().includes(lowerQuery)) {
            results.push(poem);
        }
        // 搜索内容
        else if (poem.content.toLowerCase().includes(lowerQuery)) {
            results.push(poem);
        }
        // 搜索标签
        else if (poem.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) {
            results.push(poem);
        }
    });
    
    return results;
}

// 应用筛选器
function applyFilters() {
    let filtered = [...filteredPoems];
    
    // 作者筛选
    const selectedAuthor = authorFilter.value;
    if (selectedAuthor) {
        filtered = filtered.filter(poem => poem.author === selectedAuthor);
    }
    
    // 分类筛选
    const selectedCategory = categoryFilter.value;
    if (selectedCategory) {
        filtered = filtered.filter(poem => 
            poem.tags.some(tag => tag.includes(selectedCategory))
        );
    }
    
    // 排序
    const sortBy = sortFilter.value;
    filtered.sort((a, b) => {
        switch (sortBy) {
            case 'title':
                return a.title.localeCompare(b.title, 'zh-CN');
            case 'author':
                return a.author.localeCompare(b.author, 'zh-CN');
            case 'category':
                return a.tags[0].localeCompare(b.tags[0], 'zh-CN');
            default:
                return 0;
        }
    });
    
    // 更新显示
    displayPoems(filtered);
    updatePagination(filtered.length);
}

// 显示诗歌列表
function displayPoems(poems) {
    const startIndex = (currentPage - 1) * poemsPerPage;
    const endIndex = startIndex + poemsPerPage;
    const pagePoems = poems.slice(startIndex, endIndex);
    
    if (pagePoems.length === 0) {
        poemsList.innerHTML = `
            <div class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666;">
                <p>没有找到符合条件的诗歌</p>
                <p>请尝试调整搜索条件或筛选器</p>
            </div>
        `;
        return;
    }
    
    const poemsHTML = pagePoems.map(poem => `
        <div class="poem-card" onclick="showPoemDetail('${poem.id}')">
            <div class="poem-title">${poem.title}</div>
            <div class="poem-author">${poem.author} · ${poem.dynasty}</div>
            <div class="poem-preview">${poem.preview}</div>
        </div>
    `).join('');
    
    poemsList.innerHTML = poemsHTML;
}

// 更新分页
function updatePagination(totalPoems) {
    const totalPages = Math.ceil(totalPoems / poemsPerPage);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // 上一页按钮
    paginationHTML += `
        <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            上一页
        </button>
    `;
    
    // 页码按钮
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button onclick="changePage(${i})" class="${i === currentPage ? 'active' : ''}">
                ${i}
            </button>
        `;
    }
    
    // 下一页按钮
    paginationHTML += `
        <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
            下一页
        </button>
    `;
    
    pagination.innerHTML = paginationHTML;
}

// 切换页面
function changePage(page) {
    const totalPages = Math.ceil(filteredPoems.length / poemsPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    displayPoems(filteredPoems);
    updatePagination(filteredPoems.length);
    
    // 滚动到页面顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 显示诗歌详情
function showPoemDetail(poemId) {
    const poem = poemsData.find(p => p.id === poemId);
    if (!poem) return;
    
    // 将诗歌数据存储到localStorage，供详情页使用
    localStorage.setItem('currentPoem', JSON.stringify(poem));
    // 跳转到详情页
    window.location.href = 'poem-detail.html';
}

// 初始化页面
function initializePage() {
    console.log('开始初始化页面...');
    console.log('当前poemsData长度:', poemsData.length);
    console.log('当前filteredPoems长度:', filteredPoems.length);
    
    // 重置所有筛选器
    searchInput.value = '';
    authorFilter.value = '';
    categoryFilter.value = '';
    sortFilter.value = 'title';
    
    // 显示所有诗歌
    filteredPoems = [...poemsData];
    console.log('重置后filteredPoems长度:', filteredPoems.length);
    
    displayPoems(filteredPoems);
    updatePagination(filteredPoems.length);
    
    console.log('页面初始化完成');
} 