// 游戏常量
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const GROUND_Y = 350;
const GRAVITY = 0.8;
const JUMP_FORCE = -15;
const MOVE_SPEED = 5;

// 游戏状态
let gameRunning = false;
let gameTime = 60;
let gameTimer = null;
let particles = [];

// 获取画布和上下文
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 粒子类
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = (Math.random() - 0.5) * 8 - 3;
        this.color = color;
        this.life = 1;
        this.decay = 0.02;
        this.size = Math.random() * 3 + 2;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.3;
        this.life -= this.decay;
        this.size *= 0.98;
    }
    
    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// 角色类
class Fighter {
    constructor(x, y, width, height, color, name, controls) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.name = name;
        this.controls = controls;
        
        // 物理属性
        this.velocityX = 0;
        this.velocityY = 0;
        this.onGround = false;
        
        // 战斗属性
        this.health = 100;
        this.maxHealth = 100;
        this.attackPower = 20;
        this.defense = 0;
        this.isAttacking = false;
        this.isDefending = false;
        this.attackCooldown = 0;
        this.invincible = false;
        this.invincibleTime = 0;
        
        // 动画属性
        this.facingRight = name === '奥特曼';
        this.idleAnimation = 0;
        
        // 攻击框
        this.attackBox = {
            x: 0,
            y: 0,
            width: 60,
            height: 40
        };
    }
    
    update() {
        this.velocityY += GRAVITY;
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        if (this.y + this.height >= GROUND_Y) {
            this.y = GROUND_Y - this.height;
            this.velocityY = 0;
            this.onGround = true;
            
            if (Math.abs(this.velocityX) > 2) {
                for (let i = 0; i < 3; i++) {
                    particles.push(new Particle(
                        this.x + Math.random() * this.width,
                        this.y + this.height,
                        '#8B4513'
                    ));
                }
            }
        } else {
            this.onGround = false;
        }
        
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > CANVAS_WIDTH) this.x = CANVAS_WIDTH - this.width;
        
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
        }
        
        if (this.invincibleTime > 0) {
            this.invincibleTime--;
            if (this.invincibleTime === 0) {
                this.invincible = false;
            }
        }
        
        this.idleAnimation += 0.05;
        this.updateAttackBox();
    }
    
    updateAttackBox() {
        if (this.facingRight) {
            this.attackBox.x = this.x + this.width;
        } else {
            this.attackBox.x = this.x - this.attackBox.width;
        }
        this.attackBox.y = this.y + this.height / 2 - this.attackBox.height / 2;
    }
    
    attack() {
        if (this.attackCooldown === 0 && !this.isDefending) {
            this.isAttacking = true;
            this.attackCooldown = 30;
            
            const attackX = this.facingRight ? this.x + this.width : this.x;
            for (let i = 0; i < 6; i++) {
                particles.push(new Particle(
                    attackX,
                    this.y + this.height / 2,
                    '#ff6b6b'
                ));
            }
            
            setTimeout(() => {
                this.isAttacking = false;
            }, 200);
        }
    }
    
    defend() {
        this.isDefending = true;
        this.defense = 0.5;
    }
    
    stopDefend() {
        this.isDefending = false;
        this.defense = 0;
    }
    
    takeDamage(damage) {
        if (!this.invincible) {
            const actualDamage = Math.floor(damage * (1 - this.defense));
            this.health -= actualDamage;
            this.health = Math.max(0, this.health);
            
            this.invincible = true;
            this.invincibleTime = 30;
            
            this.velocityX = this.facingRight ? -8 : 8;
            this.velocityY = -5;
            
            for (let i = 0; i < 8; i++) {
                particles.push(new Particle(
                    this.x + this.width / 2,
                    this.y + this.height / 2,
                    '#ff0000'
                ));
            }
        }
    }
    
    handleInput(keys) {
        this.stopDefend();
        
        if (keys[this.controls.left]) {
            this.velocityX = -MOVE_SPEED;
            this.facingRight = false;
        } else if (keys[this.controls.right]) {
            this.velocityX = MOVE_SPEED;
            this.facingRight = true;
        } else {
            this.velocityX = 0;
        }
        
        if (keys[this.controls.up] && this.onGround) {
            this.velocityY = JUMP_FORCE;
            
            for (let i = 0; i < 4; i++) {
                particles.push(new Particle(
                    this.x + this.width / 2,
                    this.y + this.height,
                    this.color
                ));
            }
        }
        
        if (keys[this.controls.attack]) {
            this.attack();
        }
        
        if (keys[this.controls.defend]) {
            this.defend();
        }
    }
    
    draw() {
        if (this.invincible && Math.floor(this.invincibleTime / 3) % 2 === 0) {
            return;
        }
        
        ctx.save();
        
        // 阴影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(this.x + 2, this.y + this.height + 2, this.width, 8);
        
        // 主体
        if (this.isDefending) {
            ctx.fillStyle = '#4ecdc4';
            ctx.globalAlpha = 0.7;
        } else if (this.isAttacking) {
            ctx.fillStyle = '#ff6b6b';
        } else {
            ctx.fillStyle = this.color;
        }
        
        const idleOffset = Math.sin(this.idleAnimation) * 2;
        ctx.fillRect(this.x, this.y + idleOffset, this.width, this.height);
        
        // 细节
        if (this.name === '奥特曼') {
            // 眼睛
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(this.x + 8, this.y + 8, 6, 6);
            ctx.fillRect(this.x + this.width - 14, this.y + 8, 6, 6);
            
            // 计时器
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(this.x + this.width/2 - 6, this.y + 18, 12, 6);
            
            // 胸灯
            ctx.fillStyle = '#00ff00';
            ctx.beginPath();
            ctx.arc(this.x + this.width/2, this.y + 35, 4, 0, Math.PI * 2);
            ctx.fill();
            
            // 银色装饰
            ctx.fillStyle = '#C0C0C0';
            ctx.fillRect(this.x + 5, this.y + 25, this.width - 10, 3);
        } else {
            // 眼睛
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(this.x + 5, this.y + 5, 8, 8);
            ctx.fillRect(this.x + this.width - 13, this.y + 5, 8, 8);
            
            // 角
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(this.x + 8, this.y - 12, 6, 12);
            ctx.fillRect(this.x + this.width - 14, this.y - 12, 6, 12);
            
            // 牙齿
            ctx.fillStyle = '#fff';
            ctx.fillRect(this.x + 10, this.y + 20, 3, 6);
            ctx.fillRect(this.x + this.width - 13, this.y + 20, 3, 6);
            
            // 鳞片
            ctx.fillStyle = '#8B0000';
            for (let i = 0; i < 3; i++) {
                ctx.fillRect(this.x + 5 + i * 10, this.y + 30, 8, 4);
            }
        }
        
        // 攻击框
        if (this.isAttacking) {
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(this.attackBox.x, this.attackBox.y, this.attackBox.width, this.attackBox.height);
            ctx.setLineDash([]);
        }
        
        ctx.restore();
    }
}

// 创建角色
const ultraman = new Fighter(100, GROUND_Y - 60, 40, 60, '#4ecdc4', '奥特曼', {
    left: 'KeyA',
    right: 'KeyD',
    up: 'KeyW',
    attack: 'Space',
    defend: 'KeyS'
});

const monster = new Fighter(660, GROUND_Y - 60, 40, 60, '#ff6b6b', '怪兽', {
    left: 'ArrowLeft',
    right: 'ArrowRight',
    up: 'ArrowUp',
    attack: 'Enter',
    defend: 'ArrowDown'
});

// 键盘输入
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// 碰撞检测
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// 绘制背景
function drawBackground() {
    // 天空
    const gradient = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.5, '#98FB98');
    gradient.addColorStop(1, '#F0E68C');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, GROUND_Y);
    
    // 地面
    const groundGradient = ctx.createLinearGradient(0, GROUND_Y, 0, CANVAS_HEIGHT);
    groundGradient.addColorStop(0, '#8B4513');
    groundGradient.addColorStop(1, '#654321');
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);
    
    // 建筑
    ctx.fillStyle = '#696969';
    ctx.fillRect(50, GROUND_Y - 100, 40, 100);
    ctx.fillRect(720, GROUND_Y - 120, 40, 120);
    
    // 云朵
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(200, 80, 25, 0, Math.PI * 2);
    ctx.arc(225, 80, 30, 0, Math.PI * 2);
    ctx.arc(250, 80, 25, 0, Math.PI * 2);
    ctx.fill();
    
    // 太阳
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(700, 50, 20, 0, Math.PI * 2);
    ctx.fill();
}

// 更新血条
function updateHealthBars() {
    const player1Health = document.getElementById('player1-health');
    const player2Health = document.getElementById('player2-health');
    
    player1Health.style.width = (ultraman.health / ultraman.maxHealth * 100) + '%';
    player2Health.style.width = (monster.health / monster.maxHealth * 100) + '%';
    
    if (ultraman.health < 30) {
        player1Health.style.background = 'linear-gradient(90deg, #ff0000, #ff4444, #ff6666)';
    }
    if (monster.health < 30) {
        player2Health.style.background = 'linear-gradient(90deg, #ff0000, #ff4444, #ff6666)';
    }
}

// 游戏主循环
function gameLoop() {
    if (!gameRunning) return;
    
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    drawBackground();
    
    ultraman.handleInput(keys);
    monster.handleInput(keys);
    
    ultraman.update();
    monster.update();
    
    // 更新粒子
    particles = particles.filter(particle => {
        particle.update();
        return particle.life > 0;
    });
    
    particles.forEach(particle => particle.draw());
    
    // 战斗
    if (ultraman.isAttacking && checkCollision(ultraman.attackBox, monster)) {
        monster.takeDamage(ultraman.attackPower);
        updateHealthBars();
    }
    
    if (monster.isAttacking && checkCollision(monster.attackBox, ultraman)) {
        ultraman.takeDamage(monster.attackPower);
        updateHealthBars();
    }
    
    ultraman.draw();
    monster.draw();
    
    // 检查结束
    if (ultraman.health <= 0) {
        endGame('怪兽获胜！');
    } else if (monster.health <= 0) {
        endGame('奥特曼获胜！');
    } else if (gameTime <= 0) {
        if (ultraman.health > monster.health) {
            endGame('奥特曼获胜！');
        } else if (monster.health > ultraman.health) {
            endGame('怪兽获胜！');
        } else {
            endGame('平局！');
        }
    }
    
    requestAnimationFrame(gameLoop);
}

// 结束游戏
function endGame(message) {
    gameRunning = false;
    clearInterval(gameTimer);
    
    for (let i = 0; i < 30; i++) {
        particles.push(new Particle(
            Math.random() * CANVAS_WIDTH,
            Math.random() * CANVAS_HEIGHT,
            '#ffd700'
        ));
    }
    
    setTimeout(() => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(message, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.fillText('按"重新开始"按钮再玩一次', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
    }, 1000);
}

// 开始游戏
function startGame() {
    if (gameRunning) return;
    
    gameRunning = true;
    gameTime = 60;
    
    ultraman.health = ultraman.maxHealth;
    monster.health = monster.maxHealth;
    ultraman.x = 100;
    monster.x = 660;
    ultraman.y = GROUND_Y - 60;
    monster.y = GROUND_Y - 60;
    
    updateHealthBars();
    
    gameTimer = setInterval(() => {
        gameTime--;
        document.querySelector('.timer').textContent = gameTime;
        if (gameTime <= 0) {
            clearInterval(gameTimer);
        }
    }, 1000);
    
    gameLoop();
}

// 重置游戏
function resetGame() {
    gameRunning = false;
    clearInterval(gameTimer);
    gameTime = 60;
    document.querySelector('.timer').textContent = gameTime;
    
    const player1Health = document.getElementById('player1-health');
    const player2Health = document.getElementById('player2-health');
    player1Health.style.width = '100%';
    player2Health.style.width = '100%';
    player1Health.style.background = 'linear-gradient(90deg, #ff6b6b, #ff8e8e, #ffb3b3)';
    player2Health.style.background = 'linear-gradient(90deg, #ff6b6b, #ff8e8e, #ffb3b3)';
    
    particles = [];
    
    drawBackground();
    ultraman.draw();
    monster.draw();
}

// 事件监听器
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('resetBtn').addEventListener('click', resetGame);

// 初始化游戏
resetGame(); 