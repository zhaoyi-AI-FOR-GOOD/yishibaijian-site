class UltramanGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameRunning = false;
        this.gamePaused = false;
        
        // 奥特曼角色
        this.ultraman = {
            x: 50,
            y: 300,
            width: 32,
            height: 48,
            velocityX: 0,
            velocityY: 0,
            onGround: false,
            facingRight: true,
            isJumping: false,
            powerUp: 'normal',
            invincible: false,
            invincibleTimer: 0,
            energy: 100
        };
        
        // 城市平台
        this.platforms = [
            { x: 0, y: 350, width: 800, height: 50, color: '#696969', type: 'ground' },
            { x: 150, y: 280, width: 80, height: 70, color: '#4169E1', type: 'building' },
            { x: 300, y: 250, width: 80, height: 100, color: '#4682B4', type: 'building' },
            { x: 450, y: 220, width: 80, height: 130, color: '#5F9EA0', type: 'building' },
            { x: 600, y: 190, width: 80, height: 160, color: '#6495ED', type: 'building' },
            { x: 200, y: 180, width: 60, height: 20, color: '#32CD32', type: 'platform' },
            { x: 350, y: 150, width: 60, height: 20, color: '#32CD32', type: 'platform' },
            { x: 500, y: 120, width: 60, height: 20, color: '#32CD32', type: 'platform' },
            { x: 100, y: 200, width: 60, height: 15, color: '#FF6347', type: 'moving', moveRange: 100, moveSpeed: 0.5, startX: 100 }
        ];
        
        // 怪兽敌人
        this.monsters = [
            { x: 300, y: 310, width: 30, height: 30, velocityX: -1, color: '#228B22', type: 'small', health: 1, name: '小怪兽' },
            { x: 500, y: 310, width: 30, height: 30, velocityX: 1, color: '#228B22', type: 'small', health: 1, name: '小怪兽' },
            { x: 400, y: 310, width: 35, height: 35, velocityX: -0.5, color: '#8B0000', type: 'large', health: 2, name: '大怪兽' },
            { x: 200, y: 150, width: 28, height: 28, velocityX: 0.8, velocityY: 0, color: '#FF4500', type: 'flying', health: 1, name: '飞行怪兽' }
        ];
        
        // 能量水晶
        this.crystals = [
            { x: 180, y: 240, width: 16, height: 16, collected: false, animation: 0, color: '#00BFFF' },
            { x: 330, y: 210, width: 16, height: 16, collected: false, animation: 0, color: '#00BFFF' },
            { x: 480, y: 180, width: 16, height: 16, collected: false, animation: 0, color: '#00BFFF' },
            { x: 630, y: 150, width: 16, height: 16, collected: false, animation: 0, color: '#00BFFF' },
            { x: 230, y: 140, width: 16, height: 16, collected: false, animation: 0, color: '#00BFFF' },
            { x: 380, y: 110, width: 16, height: 16, collected: false, animation: 0, color: '#00BFFF' }
        ];
        
        // 道具
        this.powerUps = [
            { x: 250, y: 230, width: 20, height: 20, type: 'energy', collected: false, color: '#FFD700' },
            { x: 400, y: 160, width: 20, height: 20, type: 'star', collected: false, color: '#FFD700' }
        ];
        
        // 火焰陷阱
        this.traps = [
            { x: 350, y: 310, width: 30, height: 40, type: 'fire', color: '#FF4500' },
            { x: 550, y: 310, width: 30, height: 40, type: 'fire', color: '#FF4500' }
        ];
        
        this.keys = {};
        this.gravity = 0.6;
        this.jumpPower = -13;
        this.moveSpeed = 4;
        this.maxSpeed = 6;
        this.particles = [];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateDisplay();
        this.showOverlay('奥特曼出击', '按空格键开始战斗');
    }
    
    setupEventListeners() {
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
        
        this.ultraman.x = 50;
        this.ultraman.y = 300;
        this.ultraman.velocityX = 0;
        this.ultraman.velocityY = 0;
        this.ultraman.powerUp = 'normal';
        this.ultraman.invincible = false;
        this.ultraman.invincibleTimer = 0;
        this.ultraman.energy = 100;
        
        this.monsters = [
            { x: 300, y: 310, width: 30, height: 30, velocityX: -1, color: '#228B22', type: 'small', health: 1, name: '小怪兽' },
            { x: 500, y: 310, width: 30, height: 30, velocityX: 1, color: '#228B22', type: 'small', health: 1, name: '小怪兽' },
            { x: 400, y: 310, width: 35, height: 35, velocityX: -0.5, color: '#8B0000', type: 'large', health: 2, name: '大怪兽' },
            { x: 200, y: 150, width: 28, height: 28, velocityX: 0.8, velocityY: 0, color: '#FF4500', type: 'flying', health: 1, name: '飞行怪兽' }
        ];
        
        this.crystals.forEach(crystal => crystal.collected = false);
        this.powerUps.forEach(powerUp => powerUp.collected = false);
        
        this.updateDisplay();
        this.showOverlay('奥特曼出击', '按空格键开始战斗');
    }
    
    gameLoop() {
        if (!this.gameRunning || this.gamePaused) return;
        
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        this.handleInput();
        this.updateUltraman();
        this.updateMonsters();
        this.updatePlatforms();
        this.updateParticles();
        this.checkCollisions();
        this.checkWinCondition();
    }
    
    handleInput() {
        if (this.keys['ArrowLeft']) {
            this.ultraman.velocityX = Math.max(-this.maxSpeed, this.ultraman.velocityX - 0.5);
            this.ultraman.facingRight = false;
        } else if (this.keys['ArrowRight']) {
            this.ultraman.velocityX = Math.min(this.maxSpeed, this.ultraman.velocityX + 0.5);
            this.ultraman.facingRight = true;
        } else {
            this.ultraman.velocityX *= 0.8;
            if (Math.abs(this.ultraman.velocityX) < 0.1) this.ultraman.velocityX = 0;
        }
        
        if (this.keys['Space'] && this.ultraman.onGround) {
            this.ultraman.velocityY = this.jumpPower;
            this.ultraman.onGround = false;
            this.ultraman.isJumping = true;
            this.createParticles(this.ultraman.x + this.ultraman.width/2, this.ultraman.y + this.ultraman.height, '#FFD700', 5);
        }
    }
    
    updateUltraman() {
        if (this.ultraman.invincible) {
            this.ultraman.invincibleTimer--;
            if (this.ultraman.invincibleTimer <= 0) {
                this.ultraman.invincible = false;
            }
        }
        
        this.ultraman.velocityY += this.gravity;
        this.ultraman.x += this.ultraman.velocityX;
        this.ultraman.y += this.ultraman.velocityY;
        
        if (this.ultraman.x < 0) this.ultraman.x = 0;
        if (this.ultraman.x + this.ultraman.width > this.canvas.width) {
            this.ultraman.x = this.canvas.width - this.ultraman.width;
        }
        
        if (this.ultraman.y > this.canvas.height) {
            this.loseLife();
        }
        
        this.ultraman.onGround = false;
        for (let platform of this.platforms) {
            if (this.checkCollision(this.ultraman, platform)) {
                if (this.ultraman.velocityY > 0) {
                    this.ultraman.y = platform.y - this.ultraman.height;
                    this.ultraman.velocityY = 0;
                    this.ultraman.onGround = true;
                    this.ultraman.isJumping = false;
                }
            }
        }
    }
    
    updateMonsters() {
        this.monsters.forEach(monster => {
            monster.x += monster.velocityX;
            
            if (monster.x <= 0 || monster.x + monster.width >= this.canvas.width) {
                monster.velocityX *= -1;
            }
            
            if (monster.type === 'flying') {
                monster.y += monster.velocityY || 0;
                if (monster.y < 100 || monster.y > 200) {
                    monster.velocityY = -monster.velocityY;
                }
            } else {
                if (monster.y + monster.height < this.canvas.height - 50) {
                    monster.velocityY = monster.velocityY || 0;
                    monster.velocityY += this.gravity;
                    monster.y += monster.velocityY;
                }
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
            particle.vy += 0.1;
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
        this.crystals.forEach(crystal => {
            if (!crystal.collected && this.checkCollision(this.ultraman, crystal)) {
                crystal.collected = true;
                this.score += 100;
                this.ultraman.energy += 10;
                this.createParticles(crystal.x + crystal.width/2, crystal.y + crystal.height/2, '#00BFFF', 8);
                this.updateDisplay();
            }
            crystal.animation += 0.1;
        });
        
        this.powerUps.forEach(powerUp => {
            if (!powerUp.collected && this.checkCollision(this.ultraman, powerUp)) {
                powerUp.collected = true;
                this.collectPowerUp(powerUp.type);
                this.createParticles(powerUp.x + powerUp.width/2, powerUp.y + powerUp.height/2, powerUp.color, 10);
            }
        });
        
        this.traps.forEach(trap => {
            if (this.checkCollision(this.ultraman, trap)) {
                this.loseLife();
            }
        });
        
        this.monsters.forEach(monster => {
            if (this.checkCollision(this.ultraman, monster)) {
                if (this.ultraman.velocityY > 0 && this.ultraman.y < monster.y && !this.ultraman.invincible) {
                    monster.health--;
                    if (monster.health <= 0) {
                        this.monsters = this.monsters.filter(m => m !== monster);
                        this.score += monster.type === 'large' ? 300 : 200;
                        this.createParticles(monster.x + monster.width/2, monster.y + monster.height/2, '#FF0000', 12);
                    }
                    this.ultraman.velocityY = this.jumpPower / 2;
                } else if (!this.ultraman.invincible) {
                    this.loseLife();
                }
            }
        });
    }
    
    collectPowerUp(type) {
        switch(type) {
            case 'energy':
                this.ultraman.energy = Math.min(100, this.ultraman.energy + 30);
                this.ultraman.powerUp = 'super';
                this.score += 500;
                break;
            case 'star':
                this.ultraman.invincible = true;
                this.ultraman.invincibleTimer = 300;
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
        if (this.ultraman.invincible) return;
        
        this.lives--;
        this.updateDisplay();
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            this.ultraman.x = 50;
            this.ultraman.y = 300;
            this.ultraman.velocityX = 0;
            this.ultraman.velocityY = 0;
            this.ultraman.powerUp = 'normal';
            this.ultraman.invincible = true;
            this.ultraman.invincibleTimer = 120;
        }
    }
    
    checkWinCondition() {
        if (this.crystals.every(crystal => crystal.collected)) {
            this.completeLevel();
        }
    }
    
    completeLevel() {
        this.score += 500;
        this.updateDisplay();
        this.showOverlay('关卡完成', `奥特曼成功保护了地球！\n最终分数: ${this.score}`);
    }
    
    gameOver() {
        this.gameRunning = false;
        this.showOverlay('任务失败', `奥特曼能量耗尽！\n最终分数: ${this.score}`);
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawBackground();
        
        this.platforms.forEach(platform => {
            this.drawPlatform(platform);
        });
        
        this.traps.forEach(trap => {
            this.drawTrap(trap);
        });
        
        this.crystals.forEach(crystal => {
            if (!crystal.collected) {
                this.drawCrystal(crystal);
            }
        });
        
        this.powerUps.forEach(powerUp => {
            if (!powerUp.collected) {
                this.drawPowerUp(powerUp);
            }
        });
        
        this.monsters.forEach(monster => {
            this.drawMonster(monster);
        });
        
        this.particles.forEach(particle => {
            this.drawParticle(particle);
        });
        
        this.drawUltraman();
    }
    
    drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98FB98');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.drawCloud(100, 80);
        this.drawCloud(500, 60);
        this.drawCloud(700, 100);
        
        this.ctx.fillStyle = 'rgba(105, 105, 105, 0.3)';
        for (let i = 0; i < 5; i++) {
            const x = i * 150 + 50;
            const height = 80 + Math.random() * 60;
            this.ctx.fillRect(x, this.canvas.height - height - 50, 60, height);
        }
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
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fillRect(platform.x, platform.y + platform.height - 2, platform.width, 2);
        
        if (platform.type === 'building') {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 2; j++) {
                    this.ctx.fillRect(platform.x + 10 + i * 20, platform.y + 10 + j * 25, 15, 15);
                }
            }
        }
    }
    
    drawTrap(trap) {
        this.ctx.fillStyle = trap.color;
        this.ctx.beginPath();
        this.ctx.moveTo(trap.x + trap.width/2, trap.y);
        this.ctx.lineTo(trap.x, trap.y + trap.height);
        this.ctx.lineTo(trap.x + trap.width, trap.y + trap.height);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        this.ctx.arc(trap.x + trap.width/2, trap.y + 10, 5, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawCrystal(crystal) {
        const centerX = crystal.x + crystal.width/2;
        const centerY = crystal.y + crystal.height/2;
        const radius = crystal.width/2;
        const rotation = crystal.animation;
        
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(rotation);
        
        this.ctx.fillStyle = crystal.color;
        this.ctx.beginPath();
        this.ctx.moveTo(0, -radius);
        this.ctx.lineTo(radius * 0.7, -radius * 0.3);
        this.ctx.lineTo(radius * 0.7, radius * 0.3);
        this.ctx.lineTo(0, radius);
        this.ctx.lineTo(-radius * 0.7, radius * 0.3);
        this.ctx.lineTo(-radius * 0.7, -radius * 0.3);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.moveTo(0, -radius * 0.5);
        this.ctx.lineTo(radius * 0.3, -radius * 0.1);
        this.ctx.lineTo(radius * 0.3, radius * 0.1);
        this.ctx.lineTo(0, radius * 0.5);
        this.ctx.lineTo(-radius * 0.3, radius * 0.1);
        this.ctx.lineTo(-radius * 0.3, -radius * 0.1);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    drawPowerUp(powerUp) {
        this.ctx.fillStyle = powerUp.color;
        if (powerUp.type === 'energy') {
            this.ctx.beginPath();
            this.ctx.arc(powerUp.x + powerUp.width/2, powerUp.y + powerUp.height/2, powerUp.width/2, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.fillStyle = '#FF4500';
            this.ctx.beginPath();
            this.ctx.arc(powerUp.x + powerUp.width/2, powerUp.y + powerUp.height/2, powerUp.width/3, 0, Math.PI * 2);
            this.ctx.fill();
        } else if (powerUp.type === 'star') {
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
    
    drawMonster(monster) {
        if (monster.type === 'small') {
            this.ctx.fillStyle = monster.color;
            this.ctx.fillRect(monster.x, monster.y, monster.width, monster.height);
            
            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(monster.x + 5, monster.y + 5, 4, 4);
            this.ctx.fillRect(monster.x + 21, monster.y + 5, 4, 4);
            
            this.ctx.fillStyle = 'black';
            this.ctx.fillRect(monster.x + 6, monster.y + 6, 2, 2);
            this.ctx.fillRect(monster.x + 22, monster.y + 6, 2, 2);
            
            this.ctx.fillStyle = '#654321';
            this.ctx.fillRect(monster.x + 8, monster.y - 3, 3, 6);
            this.ctx.fillRect(monster.x + 19, monster.y - 3, 3, 6);
        } else if (monster.type === 'large') {
            this.ctx.fillStyle = monster.color;
            this.ctx.fillRect(monster.x, monster.y, monster.width, monster.height);
            
            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(monster.x + 6, monster.y + 6, 5, 5);
            this.ctx.fillRect(monster.x + 24, monster.y + 6, 5, 5);
            
            this.ctx.fillStyle = 'black';
            this.ctx.fillRect(monster.x + 7, monster.y + 7, 3, 3);
            this.ctx.fillRect(monster.x + 25, monster.y + 7, 3, 3);
            
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.fillRect(monster.x + 10, monster.y + 20, 3, 8);
            this.ctx.fillRect(monster.x + 22, monster.y + 20, 3, 8);
        } else if (monster.type === 'flying') {
            this.ctx.fillStyle = monster.color;
            this.ctx.fillRect(monster.x, monster.y, monster.width, monster.height);
            
            this.ctx.fillStyle = '#FF6347';
            this.ctx.fillRect(monster.x - 5, monster.y + 5, 8, 12);
            this.ctx.fillRect(monster.x + monster.width - 3, monster.y + 5, 8, 12);
            
            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(monster.x + 5, monster.y + 5, 4, 4);
            this.ctx.fillRect(monster.x + 19, monster.y + 5, 4, 4);
            
            this.ctx.fillStyle = 'black';
            this.ctx.fillRect(monster.x + 6, monster.y + 6, 2, 2);
            this.ctx.fillRect(monster.x + 20, monster.y + 6, 2, 2);
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
    
    // 经典奥特曼形象设计
    drawUltraman() {
        if (this.ultraman.invincible && Math.floor(this.ultraman.invincibleTimer / 5) % 2 === 0) {
            return;
        }
        
        const x = this.ultraman.x;
        const y = this.ultraman.y;
        const width = this.ultraman.width;
        const height = this.ultraman.height;
        
        // 绘制奥特曼身体 - 银色
        this.ctx.fillStyle = '#C0C0C0';
        this.ctx.fillRect(x, y, width, height);
        
        // 绘制红色胸甲
        this.ctx.fillStyle = '#FF0000';
        this.ctx.fillRect(x + 4, y + 15, width - 8, 15);
        
        // 绘制蓝色计时器
        this.ctx.fillStyle = '#00BFFF';
        this.ctx.fillRect(x + 12, y + 18, 8, 8);
        
        // 绘制头部 - 银色
        this.ctx.fillStyle = '#C0C0C0';
        this.ctx.fillRect(x + 2, y, width - 4, 15);
        
        // 绘制眼睛 - 白色
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(x + 6, y + 3, 5, 5);
        this.ctx.fillRect(x + 21, y + 3, 5, 5);
        
        // 绘制眼睛 - 黄色
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillRect(x + 7, y + 4, 3, 3);
        this.ctx.fillRect(x + 22, y + 4, 3, 3);
        
        // 绘制手臂 - 银色
        this.ctx.fillStyle = '#C0C0C0';
        this.ctx.fillRect(x - 2, y + 15, 4, 20);
        this.ctx.fillRect(x + width - 2, y + 15, 4, 20);
        
        // 绘制腿部 - 银色
        this.ctx.fillStyle = '#C0C0C0';
        this.ctx.fillRect(x + 4, y + height - 15, 8, 15);
        this.ctx.fillRect(x + width - 12, y + height - 15, 8, 15);
        
        // 绘制红色条纹
        this.ctx.fillStyle = '#FF0000';
        this.ctx.fillRect(x + 2, y + 8, width - 4, 2);
        this.ctx.fillRect(x + 2, y + 12, width - 4, 2);
        
        // 无敌状态特效
        if (this.ultraman.invincible) {
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
    new UltramanGame();
}); 