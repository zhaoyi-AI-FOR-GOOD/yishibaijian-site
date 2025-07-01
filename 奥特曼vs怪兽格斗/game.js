// 游戏常量
const GAME_WIDTH = 1200;
const GAME_HEIGHT = 600;
const GROUND_Y = 550;
const GRAVITY = 0.8;
const JUMP_FORCE = -15;
const MOVE_SPEED = 5;

// 攻击伤害
const LIGHT_PUNCH_DAMAGE = 5;
const HEAVY_PUNCH_DAMAGE = 15;
const SPECIAL_DAMAGE = 30;
const PROJECTILE_DAMAGE = 10;

// 护盾系统
const SHIELD_HEALTH = 50;
const SHIELD_DURATION = 5000; // 5秒
const SHIELD_COOLDOWN = 10000; // 10秒

// 获取画布和上下文
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 游戏状态
let gameState = {
    round: 1,
    timer: 99,
    gameOver: false,
    winner: null
};

// 粒子系统
class Particle {
    constructor(x, y, vx, vy, color, life, size) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.life = life;
        this.maxLife = life;
        this.size = size;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.2; // 重力
        this.life--;
    }

    draw() {
        const alpha = this.life / this.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// 粒子管理器
class ParticleManager {
    constructor() {
        this.particles = [];
    }

    addParticle(x, y, vx, vy, color, life, size) {
        this.particles.push(new Particle(x, y, vx, vy, color, life, size));
    }

    createExplosion(x, y, color) {
        for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 * i) / 20;
            const speed = Math.random() * 5 + 2;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            this.addParticle(x, y, vx, vy, color, 30, Math.random() * 3 + 1);
        }
    }

    createShieldEffect(x, y, color) {
        for (let i = 0; i < 10; i++) {
            const angle = (Math.PI * 2 * i) / 10;
            const radius = 40 + Math.random() * 20;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            this.addParticle(px, py, 0, -1, color, 20, 2);
        }
    }

    update() {
        this.particles = this.particles.filter(particle => particle.life > 0);
        this.particles.forEach(particle => particle.update());
    }

    draw() {
        this.particles.forEach(particle => particle.draw());
    }
}

// 玩家类
class Player {
    constructor(x, y, isPlayer1) {
        this.x = x;
        this.y = y;
        this.width = 60;
        this.height = 100;
        this.vx = 0;
        this.vy = 0;
        this.isPlayer1 = isPlayer1;
        this.facingRight = isPlayer1;
        
        // 状态
        this.health = 100;
        this.maxHealth = 100;
        this.energy = 100;
        this.maxEnergy = 100;
        this.isGrounded = false;
        this.isAttacking = false;
        this.attackType = null;
        this.attackCooldown = 0;
        this.isHit = false;
        this.hitFlash = 0;
        
        // 护盾系统
        this.shield = {
            active: false,
            health: 0,
            duration: 0,
            cooldown: 0
        };
        
        // 动画
        this.animationFrame = 0;
        this.animationSpeed = 0.2;
    }

    update() {
        // 物理更新
        this.vy += GRAVITY;
        this.x += this.vx;
        this.y += this.vy;
        
        // 地面碰撞
        if (this.y + this.height > GROUND_Y) {
            this.y = GROUND_Y - this.height;
            this.vy = 0;
            this.isGrounded = true;
        } else {
            this.isGrounded = false;
        }
        
        // 边界限制
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > GAME_WIDTH) this.x = GAME_WIDTH - this.width;
        
        // 攻击冷却
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
        }
        
        // 受伤闪烁
        if (this.hitFlash > 0) {
            this.hitFlash--;
        }
        
        // 护盾更新
        if (this.shield.active) {
            this.shield.duration--;
            if (this.shield.duration <= 0) {
                this.shield.active = false;
                this.shield.health = 0;
            }
        }
        
        if (this.shield.cooldown > 0) {
            this.shield.cooldown--;
        }
        
        // 能量恢复
        if (this.energy < this.maxEnergy) {
            this.energy += 0.5;
        }
        
        // 动画更新
        this.animationFrame += this.animationSpeed;
    }

    takeDamage(damage) {
        if (this.shield.active) {
            this.shield.health -= damage;
            if (this.shield.health <= 0) {
                this.shield.active = false;
                this.shield.health = 0;
            }
            return;
        }
        
        this.health -= damage;
        this.hitFlash = 10;
        this.isHit = true;
        
        if (this.health < 0) this.health = 0;
    }

    attack(type) {
        if (this.attackCooldown > 0) return false;
        
        this.isAttacking = true;
        this.attackType = type;
        this.attackCooldown = 20;
        
        return true;
    }

    activateShield() {
        if (this.shield.cooldown > 0 || this.shield.active) return false;
        
        this.shield.active = true;
        this.shield.health = SHIELD_HEALTH;
        this.shield.duration = SHIELD_DURATION;
        this.shield.cooldown = SHIELD_COOLDOWN;
        
        return true;
    }

    getAttackBox() {
        if (!this.isAttacking) return null;
        
        const attackRange = this.attackType === 'light' ? 40 : 
                           this.attackType === 'heavy' ? 60 : 80;
        
        return {
            x: this.facingRight ? this.x + this.width : this.x - attackRange,
            y: this.y + 20,
            width: attackRange,
            height: 60
        };
    }

    draw() {
        ctx.save();
        
        // 受伤闪烁效果
        if (this.hitFlash > 0 && this.hitFlash % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }
        
        // 护盾效果
        if (this.shield.active) {
            ctx.strokeStyle = this.isPlayer1 ? '#4ecdc4' : '#ff6b6b';
            ctx.lineWidth = 3;
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            ctx.arc(this.x + this.width/2, this.y + this.height/2, 50, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
        
        // 绘制角色
        const color = this.isPlayer1 ? '#4ecdc4' : '#ff6b6b';
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 绘制眼睛
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x + 10, this.y + 15, 8, 8);
        ctx.fillRect(this.x + 42, this.y + 15, 8, 8);
        
        // 绘制攻击效果
        if (this.isAttacking) {
            const attackBox = this.getAttackBox();
            if (attackBox) {
                ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
                ctx.fillRect(attackBox.x, attackBox.y, attackBox.width, attackBox.height);
            }
        }
        
        ctx.restore();
    }
}

// 投射物类
class Projectile {
    constructor(x, y, vx, color, isPlayer1) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = 0;
        this.color = color;
        this.isPlayer1 = isPlayer1;
        this.width = 20;
        this.height = 20;
        this.life = 60;
    }

    update() {
        this.x += this.vx;
        this.life--;
    }

    draw() {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // 光晕效果
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// 游戏管理器
class GameManager {
    constructor() {
        this.player1 = new Player(100, GROUND_Y - 100, true);
        this.player2 = new Player(GAME_WIDTH - 160, GROUND_Y - 100, false);
        this.projectiles = [];
        this.particleManager = new ParticleManager();
        this.keys = {};
        this.gameStartTime = Date.now();
        
        this.setupEventListeners();
        this.updateUI();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restartGame();
        });
    }

    handleInput() {
        // 玩家1 (奥特曼) 控制
        if (this.keys['q']) {
            this.player1.vx = -MOVE_SPEED;
            this.player1.facingRight = false;
        } else if (this.keys['e']) {
            this.player1.vx = MOVE_SPEED;
            this.player1.facingRight = true;
        } else {
            this.player1.vx = 0;
        }
        
        if (this.keys['w'] && this.player1.isGrounded) {
            this.player1.vy = JUMP_FORCE;
        }
        
        if (this.keys['a'] && this.player1.attack('light')) {
            this.player1.energy -= 5;
        }
        
        if (this.keys['s'] && this.player1.attack('heavy')) {
            this.player1.energy -= 10;
        }
        
        if (this.keys['d'] && this.player1.energy >= 30 && this.player1.attack('special')) {
            this.player1.energy -= 30;
        }
        
        if (this.keys['z'] && this.player1.energy >= 15) {
            this.shootProjectile(this.player1, true);
            this.player1.energy -= 15;
        }
        
        if (this.keys['x']) {
            if (this.player1.activateShield()) {
                this.particleManager.createShieldEffect(
                    this.player1.x + this.player1.width/2,
                    this.player1.y + this.player1.height/2,
                    '#4ecdc4'
                );
            }
        }
        
        // 玩家2 (怪兽) 控制
        if (this.keys['u']) {
            this.player2.vx = -MOVE_SPEED;
            this.player2.facingRight = false;
        } else if (this.keys['o']) {
            this.player2.vx = MOVE_SPEED;
            this.player2.facingRight = true;
        } else {
            this.player2.vx = 0;
        }
        
        if (this.keys['i'] && this.player2.isGrounded) {
            this.player2.vy = JUMP_FORCE;
        }
        
        if (this.keys['j'] && this.player2.attack('light')) {
            this.player2.energy -= 5;
        }
        
        if (this.keys['k'] && this.player2.attack('heavy')) {
            this.player2.energy -= 10;
        }
        
        if (this.keys['l'] && this.player2.energy >= 30 && this.player2.attack('special')) {
            this.player2.energy -= 30;
        }
        
        if (this.keys['m'] && this.player2.energy >= 15) {
            this.shootProjectile(this.player2, false);
            this.player2.energy -= 15;
        }
        
        if (this.keys['n']) {
            if (this.player2.activateShield()) {
                this.particleManager.createShieldEffect(
                    this.player2.x + this.player2.width/2,
                    this.player2.y + this.player2.height/2,
                    '#ff6b6b'
                );
            }
        }
    }

    shootProjectile(player, isPlayer1) {
        const direction = player.facingRight ? 1 : -1;
        const x = player.facingRight ? player.x + player.width : player.x;
        const y = player.y + player.height/2;
        const color = isPlayer1 ? '#4ecdc4' : '#ff6b6b';
        
        this.projectiles.push(new Projectile(x, y, direction * 8, color, isPlayer1));
    }

    checkCollisions() {
        // 玩家之间的攻击碰撞
        const p1AttackBox = this.player1.getAttackBox();
        const p2AttackBox = this.player2.getAttackBox();
        
        if (p1AttackBox && this.isColliding(p1AttackBox, this.player2)) {
            const damage = this.player1.attackType === 'light' ? LIGHT_PUNCH_DAMAGE :
                          this.player1.attackType === 'heavy' ? HEAVY_PUNCH_DAMAGE : SPECIAL_DAMAGE;
            this.player2.takeDamage(damage);
            this.particleManager.createExplosion(
                this.player2.x + this.player2.width/2,
                this.player2.y + this.player2.height/2,
                '#ff6b6b'
            );
        }
        
        if (p2AttackBox && this.isColliding(p2AttackBox, this.player1)) {
            const damage = this.player2.attackType === 'light' ? LIGHT_PUNCH_DAMAGE :
                          this.player2.attackType === 'heavy' ? HEAVY_PUNCH_DAMAGE : SPECIAL_DAMAGE;
            this.player1.takeDamage(damage);
            this.particleManager.createExplosion(
                this.player1.x + this.player1.width/2,
                this.player1.y + this.player1.height/2,
                '#4ecdc4'
            );
        }
        
        // 投射物碰撞
        this.projectiles = this.projectiles.filter(projectile => {
            if (projectile.life <= 0) return false;
            
            const target = projectile.isPlayer1 ? this.player2 : this.player1;
            if (this.isColliding(projectile, target)) {
                target.takeDamage(PROJECTILE_DAMAGE);
                this.particleManager.createExplosion(
                    projectile.x + projectile.width/2,
                    projectile.y + projectile.height/2,
                    projectile.color
                );
                return false;
            }
            
            return true;
        });
    }

    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    update() {
        if (gameState.gameOver) return;
        
        // 更新游戏时间
        const elapsed = Math.floor((Date.now() - this.gameStartTime) / 1000);
        gameState.timer = Math.max(0, 99 - elapsed);
        
        if (gameState.timer <= 0) {
            this.endGame(this.player1.health > this.player2.health ? 'player1' : 'player2');
            return;
        }
        
        this.handleInput();
        
        // 更新玩家
        this.player1.update();
        this.player2.update();
        
        // 更新投射物
        this.projectiles.forEach(projectile => projectile.update());
        this.projectiles = this.projectiles.filter(projectile => projectile.life > 0);
        
        // 更新粒子
        this.particleManager.update();
        
        // 检查碰撞
        this.checkCollisions();
        
        // 检查游戏结束
        if (this.player1.health <= 0) {
            this.endGame('player2');
        } else if (this.player2.health <= 0) {
            this.endGame('player1');
        }
        
        this.updateUI();
    }

    draw() {
        // 清空画布
        ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        
        // 绘制背景
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, GAME_WIDTH, GROUND_Y);
        ctx.fillStyle = '#98FB98';
        ctx.fillRect(0, GROUND_Y, GAME_WIDTH, GAME_HEIGHT - GROUND_Y);
        
        // 绘制地面线
        ctx.strokeStyle = '#228B22';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, GROUND_Y);
        ctx.lineTo(GAME_WIDTH, GROUND_Y);
        ctx.stroke();
        
        // 绘制玩家
        this.player1.draw();
        this.player2.draw();
        
        // 绘制投射物
        this.projectiles.forEach(projectile => projectile.draw());
        
        // 绘制粒子
        this.particleManager.draw();
    }

    updateUI() {
        // 更新血量
        document.getElementById('p1-health').style.width = (this.player1.health / this.player1.maxHealth * 100) + '%';
        document.getElementById('p1-health-text').textContent = Math.ceil(this.player1.health);
        document.getElementById('p2-health').style.width = (this.player2.health / this.player2.maxHealth * 100) + '%';
        document.getElementById('p2-health-text').textContent = Math.ceil(this.player2.health);
        
        // 更新能量
        document.getElementById('p1-energy').style.width = (this.player1.energy / this.player1.maxEnergy * 100) + '%';
        document.getElementById('p1-energy-text').textContent = Math.ceil(this.player1.energy);
        document.getElementById('p2-energy').style.width = (this.player2.energy / this.player2.maxEnergy * 100) + '%';
        document.getElementById('p2-energy-text').textContent = Math.ceil(this.player2.energy);
        
        // 更新护盾冷却
        const p1CooldownPercent = this.player1.shield.cooldown > 0 ? 
            (1 - this.player1.shield.cooldown / SHIELD_COOLDOWN) * 100 : 100;
        const p2CooldownPercent = this.player2.shield.cooldown > 0 ? 
            (1 - this.player2.shield.cooldown / SHIELD_COOLDOWN) * 100 : 100;
        
        document.getElementById('p1-cooldown').style.setProperty('--cooldown-width', p1CooldownPercent + '%');
        document.getElementById('p2-cooldown').style.setProperty('--cooldown-width', p2CooldownPercent + '%');
        
        // 更新护盾图标状态
        document.getElementById('p1-shield-icon').classList.toggle('active', this.player1.shield.active);
        document.getElementById('p2-shield-icon').classList.toggle('active', this.player2.shield.active);
        
        // 更新游戏信息
        document.getElementById('timer').textContent = gameState.timer;
    }

    endGame(winner) {
        gameState.gameOver = true;
        gameState.winner = winner;
        
        const winnerText = winner === 'player1' ? '奥特曼胜利！' : '怪兽胜利！';
        document.getElementById('winner-text').textContent = winnerText;
        document.getElementById('gameOverlay').style.display = 'flex';
    }

    restartGame() {
        this.player1 = new Player(100, GROUND_Y - 100, true);
        this.player2 = new Player(GAME_WIDTH - 160, GROUND_Y - 100, false);
        this.projectiles = [];
        this.particleManager = new ParticleManager();
        this.gameStartTime = Date.now();
        
        gameState.gameOver = false;
        gameState.winner = null;
        gameState.timer = 99;
        
        document.getElementById('gameOverlay').style.display = 'none';
        this.updateUI();
    }
}

// 游戏循环
let gameManager = new GameManager();

function gameLoop() {
    gameManager.update();
    gameManager.draw();
    requestAnimationFrame(gameLoop);
}

// 启动游戏
gameLoop(); 