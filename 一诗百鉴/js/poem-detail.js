// 诗歌详情页面JavaScript

// 当前诗歌数据
let currentPoem = null;

document.addEventListener('DOMContentLoaded', function() {
    // 加载当前诗歌数据
    loadCurrentPoem();
    
    // 绑定标签切换事件
    bindTabEvents();
    
    // 绑定字符点击事件
    bindCharEvents();
    
    // 绑定相关推荐点击事件
    bindRelatedEvents();
    
    // 加载名家赏析
    loadClassicalAppreciations();
    
    // 绑定赏析筛选事件
    bindAppreciationFilterEvents();
});

// 加载当前诗歌数据
function loadCurrentPoem() {
    // 从localStorage获取诗歌数据
    const poemData = localStorage.getItem('currentPoem');
    if (poemData) {
        currentPoem = JSON.parse(poemData);
        updatePageContent();
    } else {
        // 如果没有数据，使用默认的静夜思
        currentPoem = {
            title: "静夜思",
            author: "李白",
            dynasty: "唐",
            content: "床前明月光，疑是地上霜。举头望明月，低头思故乡。",
            tags: ["思乡", "月夜"],
            difficulty: "初级"
        };
        updatePageContent();
    }
}

// 更新页面内容
function updatePageContent() {
    if (!currentPoem) return;
    
    // 更新页面标题
    document.title = `${currentPoem.title} - 一诗百鉴`;
    
    // 更新面包屑导航
    const breadcrumb = document.querySelector('.breadcrumb');
    if (breadcrumb) {
        breadcrumb.innerHTML = `
            <a href="index.html">首页</a> > 
            <a href="#" onclick="history.back()">搜索结果</a> > 
            <span>${currentPoem.title}</span>
        `;
    }
    
    // 更新诗歌标题和作者
    const poemTitle = document.querySelector('.poem-title');
    if (poemTitle) {
        poemTitle.textContent = currentPoem.title;
    }
    
    const authorName = document.querySelector('.author-name');
    if (authorName) {
        authorName.textContent = currentPoem.author;
    }
    
    // 更新诗歌内容
    updatePoemContent();
    
    // 更新注释
    updateAnnotations();
    
    // 更新背景信息
    updateBackground();
    
    // 更新诗人信息
    updatePoetInfo();
}

// 更新诗歌内容
function updatePoemContent() {
    const poemText = document.querySelector('.poem-text');
    if (!poemText || !currentPoem) return;
    
    // 将诗歌内容分行显示
    const lines = currentPoem.content.split('。').filter(line => line.trim());
    let html = '';
    
    lines.forEach(line => {
        if (line.trim()) {
            const chars = line.split('，').join('，').split('');
            const charHtml = chars.map(char => `<span class="char">${char}</span>`).join('');
            html += `
                <div class="poem-line">
                    ${charHtml}
                    <span class="pinyin">${getPinyinForLine(line)}</span>
                </div>
            `;
        }
    });
    
    poemText.innerHTML = html;
}

// 获取拼音（简化版）
function getPinyinForLine(line) {
    // 这里可以扩展为完整的拼音映射
    const pinyinMap = {
        '床前明月光': 'chuáng qián míng yuè guāng',
        '疑是地上霜': 'yí shì dì shàng shuāng',
        '举头望明月': 'jǔ tóu wàng míng yuè',
        '低头思故乡': 'dī tóu sī gù xiāng',
        '春眠不觉晓': 'chūn mián bù jué xiǎo',
        '处处闻啼鸟': 'chù chù wén tí niǎo',
        '夜来风雨声': 'yè lái fēng yǔ shēng',
        '花落知多少': 'huā luò zhī duō shǎo'
    };
    
    return pinyinMap[line] || '';
}

// 更新注释
function updateAnnotations() {
    const annotationList = document.querySelector('.annotation-list');
    if (!annotationList || !currentPoem) return;
    
    // 从poemsDatabase中获取注释数据
    const poemData = typeof poemsDatabase !== 'undefined' ? poemsDatabase[currentPoem.title] : null;
    const annotations = poemData && poemData.annotations ? poemData.annotations : {};
    
    let html = '';
    Object.keys(annotations).forEach(word => {
        html += `
            <div class="annotation-item">
                <span class="word">${word}</span>
                <span class="meaning">${annotations[word]}</span>
            </div>
        `;
    });
    
    annotationList.innerHTML = html;
}

// 更新背景信息
function updateBackground() {
    const backgroundSection = document.querySelector('.background-section p');
    if (!backgroundSection || !currentPoem) return;
    
    // 从poemsDatabase中获取背景数据
    const poemData = typeof poemsDatabase !== 'undefined' ? poemsDatabase[currentPoem.title] : null;
    const background = poemData && poemData.background ? poemData.background : '暂无背景信息';
    
    backgroundSection.textContent = background;
}

// 更新诗人信息
function updatePoetInfo() {
    const poetAvatar = document.querySelector('.poet-avatar');
    const poetName = document.querySelector('.poet-details h4');
    const poetBio = document.querySelector('.poet-details p');
    
    if (!poetAvatar || !poetName || !poetBio || !currentPoem) return;
    
    // 从poemsDatabase中获取诗人信息
    const poemData = typeof poemsDatabase !== 'undefined' ? poemsDatabase[currentPoem.title] : null;
    const poetInfo = poemData && poemData.poetInfo ? poemData.poetInfo : {
        name: currentPoem.author,
        bio: '暂无诗人简介',
        avatar: currentPoem.author.charAt(0)
    };
    
    poetAvatar.textContent = poetInfo.avatar;
    poetName.textContent = poetInfo.name;
    poetBio.textContent = poetInfo.bio;
}

// 绑定标签切换事件
function bindTabEvents() {
    // 现在只有一个标签页，不需要切换功能
    // 保持默认的active状态即可
}

// 绑定字符点击事件
function bindCharEvents() {
    const chars = document.querySelectorAll('.char');
    
    chars.forEach(char => {
        char.addEventListener('click', function() {
            // 显示字符的详细信息
            showCharDetail(this.textContent);
        });
    });
}

// 显示字符详情
function showCharDetail(char) {
    // 创建字符详情弹窗
    const modal = document.createElement('div');
    modal.className = 'char-modal';
    modal.innerHTML = `
        <div class="char-modal-content">
            <div class="char-modal-header">
                <h3>${char}</h3>
                <span class="char-modal-close">&times;</span>
            </div>
            <div class="char-modal-body">
                <div class="char-info">
                    <div class="char-pinyin">拼音：${getCharPinyin(char)}</div>
                    <div class="char-meaning">含义：${getCharMeaning(char)}</div>
                    <div class="char-radical">部首：${getCharRadical(char)}</div>
                </div>
                <div class="char-usage">
                    <h4>在诗中的用法：</h4>
                    <p>${getCharUsage(char)}</p>
                </div>
            </div>
        </div>
    `;
    
    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
        .char-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 3000;
        }
        
        .char-modal-content {
            background: white;
            border-radius: 15px;
            width: 90%;
            max-width: 500px;
            max-height: 80vh;
            overflow-y: auto;
        }
        
        .char-modal-header {
            padding: 20px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .char-modal-header h3 {
            font-size: 2rem;
            color: #8B4513;
            margin: 0;
        }
        
        .char-modal-close {
            font-size: 24px;
            cursor: pointer;
            color: #666;
        }
        
        .char-modal-body {
            padding: 20px;
        }
        
        .char-info {
            margin-bottom: 20px;
        }
        
        .char-info > div {
            margin-bottom: 10px;
            padding: 8px;
            background: #f8f9fa;
            border-radius: 5px;
        }
        
        .char-usage h4 {
            color: #8B4513;
            margin-bottom: 10px;
        }
        
        .char-usage p {
            line-height: 1.6;
            color: #333;
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(modal);
    
    // 绑定关闭事件
    modal.querySelector('.char-modal-close').addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// 获取字符拼音
function getCharPinyin(char) {
    const pinyinMap = {
        '床': 'chuáng',
        '前': 'qián',
        '明': 'míng',
        '月': 'yuè',
        '光': 'guāng',
        '疑': 'yí',
        '是': 'shì',
        '地': 'dì',
        '上': 'shàng',
        '霜': 'shuāng',
        '举': 'jǔ',
        '头': 'tóu',
        '望': 'wàng',
        '低': 'dī',
        '思': 'sī',
        '故': 'gù',
        '乡': 'xiāng'
    };
    return pinyinMap[char] || '未知';
}

// 获取字符含义
function getCharMeaning(char) {
    const meaningMap = {
        '床': '睡觉的家具',
        '前': '前面，前方',
        '明': '明亮，光明',
        '月': '月亮',
        '光': '光线，光芒',
        '疑': '怀疑，以为',
        '是': '是，表示判断',
        '地': '地面，土地',
        '上': '上面，上方',
        '霜': '霜，霜冻',
        '举': '举起，抬起',
        '头': '头部',
        '望': '看，望见',
        '低': '低下，降低',
        '思': '思念，想念',
        '故': '故乡，家乡',
        '乡': '乡村，家乡'
    };
    return meaningMap[char] || '暂无释义';
}

// 获取字符部首
function getCharRadical(char) {
    const radicalMap = {
        '床': '广',
        '前': '刂',
        '明': '日',
        '月': '月',
        '光': '儿',
        '疑': '疋',
        '是': '日',
        '地': '土',
        '上': '一',
        '霜': '雨',
        '举': '手',
        '头': '页',
        '望': '月',
        '低': '亻',
        '思': '心',
        '故': '攵',
        '乡': '纟'
    };
    return radicalMap[char] || '未知';
}

// 获取字符用法
function getCharUsage(char) {
    const usageMap = {
        '床': '在诗中指床榻，是诗人夜晚休息的地方，也是观察月光的视角。',
        '前': '表示位置关系，指床的前方，是月光照射的位置。',
        '明': '形容月光的明亮，与"霜"形成对比，突出月光的皎洁。',
        '月': '诗中的核心意象，象征着思乡之情，是诗人情感的寄托。',
        '光': '指月光，是诗人思乡的触发点，也是全诗的线索。',
        '疑': '表示诗人的错觉，将月光误认为是地上的霜，体现了诗人的思乡心切。',
        '是': '表示判断，连接"疑"和"地上霜"，构成完整的错觉描述。',
        '地': '与"上"组合，指地面，是月光照射的对象。',
        '上': '表示位置，指地面之上，是霜所在的位置。',
        '霜': '与月光形成对比，突出月光的明亮，也暗示了夜晚的寒冷。',
        '举': '表示动作，指抬起头，是诗人寻找月亮的动作。',
        '头': '指头部，是"举"的对象，表示诗人抬头的动作。',
        '望': '表示看的动作，是诗人寻找月亮的行为。',
        '低': '表示动作，指低下头，与"举头"形成对比。',
        '思': '表示思念，是诗人的情感表达，也是全诗的主题。',
        '故': '指故乡，是诗人思念的对象。',
        '乡': '指家乡，与"故"同义，强调思乡之情。'
    };
    return usageMap[char] || '暂无用法说明';
}

// 绑定相关推荐点击事件
function bindRelatedEvents() {
    const relatedPoems = document.querySelectorAll('.related-poem');
    
    relatedPoems.forEach(poem => {
        poem.addEventListener('click', function() {
            const title = this.querySelector('h4').textContent;
            // 这里可以跳转到对应的诗歌详情页
            alert(`即将跳转到《${title}》的详情页面`);
        });
    });
}

// 添加一些额外的交互效果
document.addEventListener('DOMContentLoaded', function() {
    // 为注释项添加点击效果
    const annotationItems = document.querySelectorAll('.annotation-item');
    annotationItems.forEach(item => {
        item.addEventListener('click', function() {
            // 高亮对应的字符
            const word = this.querySelector('.word').textContent;
            highlightChar(word);
        });
    });
    
    // 为标签添加点击效果
    const tags = document.querySelectorAll('.tag');
    tags.forEach(tag => {
        tag.addEventListener('click', function() {
            // 可以跳转到对应分类的页面
            const tagText = this.textContent;
            console.log(`点击了标签：${tagText}`);
        });
    });
});

// 高亮字符
function highlightChar(char) {
    const chars = document.querySelectorAll('.char');
    chars.forEach(c => {
        if (c.textContent === char) {
            c.style.color = '#8B4513';
            c.style.transform = 'scale(1.2)';
            setTimeout(() => {
                c.style.color = '#333';
                c.style.transform = 'scale(1)';
            }, 1000);
        }
    });
}

// 添加页面滚动效果
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }
});

// 添加页面加载动画
window.addEventListener('load', function() {
    const poemMain = document.querySelector('.poem-main');
    const poemSidebar = document.querySelector('.poem-sidebar');
    const analysisSection = document.querySelector('.analysis-section');
    
    // 添加淡入动画
    poemMain.style.opacity = '0';
    poemMain.style.transform = 'translateY(20px)';
    poemSidebar.style.opacity = '0';
    poemSidebar.style.transform = 'translateY(20px)';
    analysisSection.style.opacity = '0';
    analysisSection.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        poemMain.style.transition = 'all 0.6s ease';
        poemMain.style.opacity = '1';
        poemMain.style.transform = 'translateY(0)';
    }, 200);
    
    setTimeout(() => {
        poemSidebar.style.transition = 'all 0.6s ease';
        poemSidebar.style.opacity = '1';
        poemSidebar.style.transform = 'translateY(0)';
    }, 400);
    
    setTimeout(() => {
        analysisSection.style.transition = 'all 0.6s ease';
        analysisSection.style.opacity = '1';
        analysisSection.style.transform = 'translateY(0)';
    }, 600);
});

// 加载名家赏析
function loadClassicalAppreciations() {
    const poemTitle = currentPoem ? currentPoem.title : document.querySelector('.poem-title').textContent;
    const appreciationList = document.getElementById('appreciationList');
    
    console.log('开始加载名家赏析...');
    console.log('诗歌标题:', poemTitle);
    console.log('poemsDatabase是否存在:', typeof poemsDatabase !== 'undefined');
    
    if (typeof poemsDatabase !== 'undefined') {
        console.log('poemsDatabase内容:', poemsDatabase);
        console.log('当前诗歌数据:', poemsDatabase[poemTitle]);
    }
    
    // 从poemsDatabase中获取赏析数据
    if (typeof poemsDatabase !== 'undefined' && poemsDatabase[poemTitle] && poemsDatabase[poemTitle].appreciations) {
        const appreciations = poemsDatabase[poemTitle].appreciations;
        console.log('找到赏析数据:', appreciations);
        console.log('赏析数量:', Object.keys(appreciations).length);
        
        let html = '';
        
        Object.keys(appreciations).forEach(bookName => {
            const appreciation = appreciations[bookName];
            html += `
                <div class="appreciation-item" data-period="${appreciation.period}">
                    <div class="appreciation-header">
                        <h4 class="book-title">《${bookName}》</h4>
                        <div class="appreciation-meta">
                            <span class="author">${appreciation.author}</span>
                            <span class="period">${appreciation.period}</span>
                        </div>
                    </div>
                    <div class="appreciation-content">
                        <p>${appreciation.content}</p>
                    </div>
                </div>
            `;
        });
        
        appreciationList.innerHTML = html;
        console.log('赏析HTML已生成，长度:', html.length);
    } else {
        console.log('未找到赏析数据');
        appreciationList.innerHTML = '<p class="no-appreciation">暂无名家赏析数据</p>';
    }
}

// 绑定赏析筛选事件
function bindAppreciationFilterEvents() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const period = this.getAttribute('data-period');
            const appreciationItems = document.querySelectorAll('.appreciation-item');
            
            // 更新按钮状态
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // 筛选内容
            appreciationItems.forEach(item => {
                if (period === 'all' || item.getAttribute('data-period') === period) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
} 