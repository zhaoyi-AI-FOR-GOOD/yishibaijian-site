class MarioGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameRunning = false;
        this.gamePaused = false;
        
        // 游戏对象
        this.mario = {
            x: 50,
            y: 300,
            width: 32,
            height: 48,
            velocityX: 0,
            velocityY: 0,
            onGround: false,
            facingRight: true,
            isJumping: false,
            powerUp: 'normal', // normal, super, fire
            invincible: false,
            invincibleTimer: 0
        };
        
        // 平台配置 - 更复杂的关卡设计
        this.platforms = [
            // 地面
            { x: 0, y: 350, width: 800, height: 50, color: '#8B4513', type: 'ground' },
            // 第一层平台
            { x: 150, y: 280, width: 80, height: 20, color: '#228B22', type: 'platform' },
            { x: 300, y: 250, width: 80, height: 20, color: '#228B22', type: 'platform' },
            { x: 450, y: 220, width: 80, height: 20, color: '#228B22', type: 'platform' },
            { x: 600, y: 190, width: 80, height: 20, color: '#228B22', type: 'platform' },
            // 第二层平台
            { x: 200, y: 180, width: 60, height: 20, color: '#32CD32', type: 'platform' },
            { x: 350, y: 150, width: 60, height: 20, color: '#32CD32', type: 'platform' },
            { x: 500, y: 120, width: 60, height: 20, color: '#32CD32', type: 'platform' },
            // 移动平台
            { x: 100, y: 200, width: 60, height: 15, color: '#FF6347', type: 'moving', moveRange: 100, moveSpeed: 0.5, startX: 100 }
        ];
        
        this.enemies = [
            { x: 300, y: 310, width: 28, height: 28, velocityX: -1, color: '#8B0000', type: 'goomba', health: 1 },
            { x: 500, y: 310, width: 28, height: 28, velocityX: 1, color: '#8B0000', type: 'goomba', health: 1 },
            { x: 400, y: 310, width: 32, height: 32, velocityX: -0.5, color: '#4B0082', type: 'koopa', health: 2 }
        ];
        
        this.coins = [
            { x: 180, y: 240, width: 16, height: 16, collected: false, animation: 0 },
            { x: 330, y: 210, width: 16, height: 16, collected: false, animation: 0 },
            { x: 480, y: 180, width: 16, height: 16, collected: false, animation: 0 },
            { x: 630, y: 150, width: 16, height: 16, collected: false, animation: 0 },
            { x: 230, y: 140, width: 16, height: 16, collected: false, animation: 0 },
            { x: 380, y: 110, width: 16, height: 16, collected: false, animation: 0 }
        ];
        
        // 新增：道具系统
        this.powerUps = [
            { x: 250, y: 230, width: 20, height: 20, type: 'mushroom', collected: false, color: '#FF0000' },
            { x: 400, y: 160, width: 20, height: 20, type: 'star', collected: false, color: '#FFD700' }
        ];
        
        // 新增：障碍物
        this.obstacles = [
            { x: 350, y: 310, width: 30, height: 40, type: 'spike', color: '#696969' },
            { x: 550, y: 310, width: 30, height: 40, type: 'spike', color: '#696969' }
        ];
        
        this.keys = {};
        this.gravity = 0.6;
        this.jumpPower = -13;
        this.moveSpeed = 4;
        this.maxSpeed = 6;
        
        // 新增：粒子效果
        this.particles = [];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateDisplay();
        this.showOverlay('超级马里奥', '按空格键开始游戏');
    }
    
    setupEventListeners() {
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            if (e.code === 'Space' && !this.gameRunning) {
                e.preventDefault();
                this.startGame();
            }
            
            if (e.code === 'KeyR') {
                this.restartGame();
            }
            
            if (e.code === 'KeyP') {
                this.togglePause();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // 开始按钮
        document.getElementById('startButton').addEventListener('click', () => {
            this.startGame();
        });
    }
    
    togglePause() {
        if (this.gameRunning) {
            this.gamePaused = !this.gamePaused;
            if (!this.gamePaused) {
                this.gameLoop();
            }
        }
    }
    
    startGame() {
        this.gameRunning = true;
        this.gamePaused = false;
        this.hideOverlay();
        this.gameLoop();
    }
    
    restartGame() {
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameRunning = false;
        this.gamePaused = false;
        
        // 重置马里奥
        this.mario.x = 50;
        this.mario.y = 300;
        this.mario.velocityX = 0;
        this.mario.velocityY = 0;
        this.mario.powerUp = 'normal';
        this.mario.invincible = false;
        this.mario.invincibleTimer = 0;
        
        // 重置敌人
        this.enemies = [
            { x: 300, y: 310, width: 28, height: 28, velocityX: -1, color: '#8B0000', type: 'goomba', health: 1 },
            { x: 500, y: 310, width: 28, height: 28, velocityX: 1, color: '#8B0000', type: 'goomba', health: 1 },
            { x: 400, y: 310, width: 32, height: 32, velocityX: -0.5, color: '#4B0082', type: 'koopa', health: 2 }
        ];
        
        // 重置金币和道具
        this.coins.forEach(coin => coin.collected = false);
        this.powerUps.forEach(powerUp => powerUp.collected = false);
        
        this.updateDisplay();
        this.showOverlay('游戏重新开始', '按空格键开始游戏');
    }
    
    gameLoop() {
        if (!this.gameRunning || this.gamePaused) return;
        
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        this.handleInput();
        this.updateMario();
        this.updateEnemies();
        this.updatePlatforms();
        this.updateParticles();
        this.checkCollisions();
        this.checkWinCondition();
    }
    
    handleInput() {
        // 左右移动
        if (this.keys['ArrowLeft']) {
            this.mario.velocityX = Math.max(-this.maxSpeed, this.mario.velocityX - 0.5);
            this.mario.facingRight = false;
        } else if (this.keys['ArrowRight']) {
            this.mario.velocityX = Math.min(this.maxSpeed, this.mario.velocityX + 0.5);
            this.mario.facingRight = true;
        } else {
            // 摩擦力
            this.mario.velocityX *= 0.8;
            if (Math.abs(this.mario.velocityX) < 0.1) this.mario.velocityX = 0;
        }
        
        // 跳跃
        if (this.keys['Space'] && this.mario.onGround) {
            this.mario.velocityY = this.jumpPower;
            this.mario.onGround = false;
            this.mario.isJumping = true;
            this.createParticles(this.mario.x + this.mario.width/2, this.mario.y + this.mario.height, '#FFD700', 5);
        }
    }
    
    updateMario() {
        // 无敌时间更新
        if (this.mario.invincible) {
            this.mario.invincibleTimer--;
            if (this.mario.invincibleTimer <= 0) {
                this.mario.invincible = false;
            }
        }
        
        // 应用重力
        this.mario.velocityY += this.gravity;
        
        // 更新位置
        this.mario.x += this.mario.velocityX;
        this.mario.y += this.mario.velocityY;
        
        // 边界检查
        if (this.mario.x < 0) this.mario.x = 0;
        if (this.mario.x + this.mario.width > this.canvas.width) {
            this.mario.x = this.canvas.width - this.mario.width;
        }
        
        // 检查是否掉出屏幕
        if (this.mario.y > this.canvas.height) {
            this.loseLife();
        }
        
        // 平台碰撞检测
        this.mario.onGround = false;
        for (let platform of this.platforms) {
            if (this.checkCollision(this.mario, platform)) {
                if (this.mario.velocityY > 0) {
                    this.mario.y = platform.y - this.mario.height;
                    this.mario.velocityY = 0;
                    this.mario.onGround = true;
                    this.mario.isJumping = false;
                }
            }
        }
    }
    
    updateEnemies() {
        this.enemies.forEach(enemy => {
            enemy.x += enemy.velocityX;
            
            // 敌人边界反弹
            if (enemy.x <= 0 || enemy.x + enemy.width >= this.canvas.width) {
                enemy.velocityX *= -1;
            }
            
            // 敌人AI - 简单的平台检测
            if (enemy.y + enemy.height < this.canvas.height - 50) {
                enemy.velocityY += this.gravity;
                enemy.y += enemy.velocityY;
            }
        });
    }
    
    updatePlatforms() {
        this.platforms.forEach(platform => {
            if (platform.type === 'moving') {
                platform.x = platform.startX + Math.sin(Date.now() * 0.001 * platform.moveSpeed) * platform.moveRange;
            }
        });
    }
    
    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.1; // 重力
            particle.life--;
            return particle.life > 0;
        });
    }
    
    createParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 4,
                vy: -Math.random() * 3,
                color: color,
                life: 30
            });
        }
    }
    
    checkCollisions() {
        // 检查金币收集
        this.coins.forEach(coin => {
            if (!coin.collected && this.checkCollision(this.mario, coin)) {
                coin.collected = true;
                this.score += 100;
                this.createParticles(coin.x + coin.width/2, coin.y + coin.height/2, '#FFD700', 8);
                this.updateDisplay();
            }
            // 金币动画
            coin.animation += 0.1;
        });
        
        // 检查道具收集
        this.powerUps.forEach(powerUp => {
            if (!powerUp.collected && this.checkCollision(this.mario, powerUp)) {
                powerUp.collected = true;
                this.collectPowerUp(powerUp.type);
                this.createParticles(powerUp.x + powerUp.width/2, powerUp.y + powerUp.height/2, powerUp.color, 10);
            }
        });
        
        // 检查障碍物碰撞
        this.obstacles.forEach(obstacle => {
            if (this.checkCollision(this.mario, obstacle)) {
                this.loseLife();
            }
        });
        
        // 检查敌人碰撞
        this.enemies.forEach(enemy => {
            if (this.checkCollision(this.mario, enemy)) {
                if (this.mario.velocityY > 0 && this.mario.y < enemy.y && !this.mario.invincible) {
                    // 踩到敌人
                    enemy.health--;
                    if (enemy.health <= 0) {
                        this.enemies = this.enemies.filter(e => e !== enemy);
                        this.score += enemy.type === 'koopa' ? 300 : 200;
                        this.createParticles(enemy.x + enemy.width/2, enemy.y + enemy.height/2, '#FF0000', 12);
                    }
                    this.mario.velocityY = this.jumpPower / 2;
                } else if (!this.mario.invincible) {
                    // 被敌人撞到
                    this.loseLife();
                }
            }
        });
    }
    
    collectPowerUp(type) {
        switch(type) {
            case 'mushroom':
                this.mario.powerUp = 'super';
                this.mario.width = 36;
                this.mario.height = 52;
                this.score += 500;
                break;
            case 'star':
                this.mario.invincible = true;
                this.mario.invincibleTimer = 300; // 5秒无敌
                this.score += 1000;
                break;
        }
        this.updateDisplay();
    }
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    loseLife() {
        if (this.mario.invincible) return;
        
        this.lives--;
        this.updateDisplay();
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            // 重置马里奥位置
            this.mario.x = 50;
            this.mario.y = 300;
            this.mario.velocityX = 0;
            this.mario.velocityY = 0;
            this.mario.powerUp = 'normal';
            this.mario.width = 32;
            this.mario.height = 48;
            this.mario.invincible = true;
            this.mario.invincibleTimer = 120; // 2秒无敌时间
        }
    }
    
    checkWinCondition() {
        // 如果收集了所有金币，进入下一关
        if (this.coins.every(coin => coin.collected)) {
            this.nextLevel();
        }
    }
    
    nextLevel() {
        this.level++;
        this.score += 500;
        
        // 增加难度
        this.maxSpeed += 0.5;
        this.gravity += 0.05;
        
        // 添加更多敌人
        this.enemies.push({
            x: Math.random() * (this.canvas.width - 32),
            y: 310,
            width: 28,
            height: 28,
            velocityX: Math.random() > 0.5 ? 1 : -1,
            color: '#8B0000',
            type: 'goomba',
            health: 1
        });
        
        // 重置金币和道具
        this.coins.forEach(coin => coin.collected = false);
        this.powerUps.forEach(powerUp => powerUp.collected = false);
        
        this.updateDisplay();
        this.showOverlay(`第 ${this.level} 关`, '准备开始下一关！');
        
        setTimeout(() => {
            this.hideOverlay();
        }, 2000);
    }
    
    gameOver() {
        this.gameRunning = false;
        this.showOverlay('游戏结束', `最终分数: ${this.score}`);
    }
    
    draw() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制背景
        this.drawBackground();
        
        // 绘制平台
        this.platforms.forEach(platform => {
            this.drawPlatform(platform);
        });
        
        // 绘制障碍物
        this.obstacles.forEach(obstacle => {
            this.drawObstacle(obstacle);
        });
        
        // 绘制金币
        this.coins.forEach(coin => {
            if (!coin.collected) {
                this.drawCoin(coin);
            }
        });
        
        // 绘制道具
        this.powerUps.forEach(powerUp => {
            if (!powerUp.collected) {
                this.drawPowerUp(powerUp);
            }
        });
        
        // 绘制敌人
        this.enemies.forEach(enemy => {
            this.drawEnemy(enemy);
        });
        
        // 绘制粒子
        this.particles.forEach(particle => {
            this.drawParticle(particle);
        });
        
        // 绘制马里奥
        this.drawMario();
    }
    
    drawBackground() {
        // 绘制天空渐变
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98FB98');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制云朵
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.drawCloud(100, 80);
        this.drawCloud(500, 60);
        this.drawCloud(700, 100);
    }
    
    drawCloud(x, y) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, 20, 0, Math.PI * 2);
        this.ctx.arc(x + 20, y, 25, 0, Math.PI * 2);
        this.ctx.arc(x + 40, y, 20, 0, Math.PI * 2);
        this.ctx.arc(x + 10, y - 10, 15, 0, Math.PI * 2);
        this.ctx.arc(x + 30, y - 10, 15, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawPlatform(platform) {
        this.ctx.fillStyle = platform.color;
        this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        // 添加阴影效果
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fillRect(platform.x, platform.y + platform.height - 2, platform.width, 2);
    }
    
    drawObstacle(obstacle) {
        this.ctx.fillStyle = obstacle.color;
        this.ctx.beginPath();
        this.ctx.moveTo(obstacle.x + obstacle.width/2, obstacle.y);
        this.ctx.lineTo(obstacle.x, obstacle.y + obstacle.height);
        this.ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    drawCoin(coin) {
        const centerX = coin.x + coin.width/2;
        const centerY = coin.y + coin.height/2;
        const radius = coin.width/2;
        
        // 金币旋转动画
        const rotation = coin.animation;
        
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(rotation);
        
        // 绘制金币
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, radius, radius * 0.3, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#FFA500';
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, radius * 0.7, radius * 0.2, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    drawPowerUp(powerUp) {
        this.ctx.fillStyle = powerUp.color;
        if (powerUp.type === 'mushroom') {
            // 绘制蘑菇
            this.ctx.beginPath();
            this.ctx.arc(powerUp.x + powerUp.width/2, powerUp.y + powerUp.height/2, powerUp.width/2, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.fillStyle = 'white';
            this.ctx.beginPath();
            this.ctx.arc(powerUp.x + powerUp.width/2, powerUp.y + powerUp.height/2, powerUp.width/3, 0, Math.PI * 2);
            this.ctx.fill();
        } else if (powerUp.type === 'star') {
            // 绘制星星
            this.drawStar(powerUp.x + powerUp.width/2, powerUp.y + powerUp.height/2, powerUp.width/2);
        }
    }
    
    drawStar(x, y, radius) {
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            const x1 = x + Math.cos(angle) * radius;
            const y1 = y + Math.sin(angle) * radius;
            if (i === 0) this.ctx.moveTo(x1, y1);
            else this.ctx.lineTo(x1, y1);
        }
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    drawEnemy(enemy) {
        if (enemy.type === 'goomba') {
            // 绘制蘑菇怪
            this.ctx.fillStyle = enemy.color;
            this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            // 眼睛
            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(enemy.x + 5, enemy.y + 5, 4, 4);
            this.ctx.fillRect(enemy.x + 19, enemy.y + 5, 4, 4);
            
            // 瞳孔
            this.ctx.fillStyle = 'black';
            this.ctx.fillRect(enemy.x + 6, enemy.y + 6, 2, 2);
            this.ctx.fillRect(enemy.x + 20, enemy.y + 6, 2, 2);
            
            // 眉毛
            this.ctx.fillStyle = '#654321';
            this.ctx.fillRect(enemy.x + 4, enemy.y + 3, 6, 2);
            this.ctx.fillRect(enemy.x + 18, enemy.y + 3, 6, 2);
        } else if (enemy.type === 'koopa') {
            // 绘制乌龟
            this.ctx.fillStyle = enemy.color;
            this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            // 龟壳纹理
            this.ctx.fillStyle = '#228B22';
            this.ctx.fillRect(enemy.x + 4, enemy.y + 4, enemy.width - 8, enemy.height - 8);
            
            // 眼睛
            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(enemy.x + 6, enemy.y + 6, 3, 3);
            this.ctx.fillRect(enemy.x + 23, enemy.y + 6, 3, 3);
        }
    }
    
    drawParticle(particle) {
        this.ctx.fillStyle = particle.color;
        this.ctx.globalAlpha = particle.life / 30;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
    }
    
    drawMario() {
        // 无敌闪烁效果
        if (this.mario.invincible && Math.floor(this.mario.invincibleTimer / 5) % 2 === 0) {
            return;
        }
        
        const x = this.mario.x;
        const y = this.mario.y;
        const width = this.mario.width;
        const height = this.mario.height;
        
        // 绘制马里奥身体
        this.ctx.fillStyle = this.mario.powerUp === 'super' ? '#FF6B6B' : '#e74c3c';
        this.ctx.fillRect(x, y, width, height);
        
        // 绘制帽子
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.fillRect(x, y, width, 10);
        
        // 绘制帽子装饰
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillRect(x + 2, y + 2, width - 4, 3);
        
        // 绘制眼睛
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(x + 6, y + 12, 5, 5);
        this.ctx.fillRect(x + 21, y + 12, 5, 5);
        
        // 绘制瞳孔
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(x + 7, y + 13, 3, 3);
        this.ctx.fillRect(x + 22, y + 13, 3, 3);
        
        // 绘制鼻子
        this.ctx.fillStyle = '#FFB6C1';
        this.ctx.fillRect(x + 13, y + 18, 6, 4);
        
        // 绘制胡子
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(x + 8, y + 22, 16, 3);
        
        // 绘制嘴巴
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(x + 12, y + 25, 8, 2);
        
        // 绘制工作服
        this.ctx.fillStyle = '#4169E1';
        this.ctx.fillRect(x + 4, y + 30, width - 8, height - 30);
        
        // 绘制工作服装饰
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillRect(x + 6, y + 32, width - 12, 2);
        this.ctx.fillRect(x + 6, y + 36, width - 12, 2);
        
        // 绘制手套
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillRect(x - 2, y + 35, 4, 8);
        this.ctx.fillRect(x + width - 2, y + 35, 4, 8);
        
        // 绘制鞋子
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(x + 2, y + height - 8, 8, 8);
        this.ctx.fillRect(x + width - 10, y + height - 8, 8, 8);
        
        // 无敌状态特效
        if (this.mario.invincible) {
            this.ctx.strokeStyle = '#FFD700';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x - 2, y - 2, width + 4, height + 4);
        }
    }
    
    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('level').textContent = this.level;
    }
    
    showOverlay(title, message) {
        document.getElementById('overlayTitle').textContent = title;
        document.getElementById('overlayMessage').textContent = message;
        document.getElementById('gameOverlay').classList.remove('hidden');
    }
    
    hideOverlay() {
        document.getElementById('gameOverlay').classList.add('hidden');
    }
}

// 启动游戏
window.addEventListener('load', () => {
    new MarioGame();
}); 