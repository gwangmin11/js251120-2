document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        themeToggle.textContent = body.classList.contains('dark-mode') ? '라이트 모드' : '다크 모드';
    });

    // Interactive Canvas Background
    const canvas = document.getElementById('interactive-bg');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particlesArray;

    const mouse = {
        x: null,
        y: null,
        radius: (canvas.height / 100) * (canvas.width / 100)
    };

    window.addEventListener('mousemove', (event) => {
        mouse.x = event.x;
        mouse.y = event.y;
    });

    class Particle {
        constructor(x, y, directionX, directionY, size, color) {
            this.x = x;
            this.y = y;
            this.directionX = directionX;
            this.directionY = directionY;
            this.size = size;
            this.color = color;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = body.classList.contains('dark-mode') ? '#f4f4f9' : '#333';
            ctx.fill();
        }

        update() {
            if (this.x > canvas.width || this.x < 0) {
                this.directionX = -this.directionX;
            }
            if (this.y > canvas.height || this.y < 0) {
                this.directionY = -this.directionY;
            }

            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < mouse.radius + this.size) {
                if (mouse.x < this.x && this.x < canvas.width - this.size * 10) {
                    this.x += 5;
                }
                if (mouse.x > this.x && this.x > this.size * 10) {
                    this.x -= 5;
                }
                if (mouse.y < this.y && this.y < canvas.height - this.size * 10) {
                    this.y += 5;
                }
                if (mouse.y > this.y && this.y > this.size * 10) {
                    this.y -= 5;
                }
            }
            this.x += this.directionX;
            this.y += this.directionY;
            this.draw();
        }
    }

    function init() {
        particlesArray = [];
        let numberOfParticles = (canvas.height * canvas.width) / 9000;
        for (let i = 0; i < numberOfParticles; i++) {
            let size = (Math.random() * 2) + 1;
            let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
            let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
            let directionX = (Math.random() * 0.4) - 0.2;
            let directionY = (Math.random() * 0.4) - 0.2;
            let color = '#333';

            particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, innerWidth, innerHeight);

        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
        }
    }

    init();
    animate();

    window.addEventListener('resize', () => {
        canvas.width = innerWidth;
        canvas.height = innerHeight;
        mouse.radius = (canvas.height / 100) * (canvas.width / 100);
        init();
    });


    // Form Submission and Calculation
    const form = document.getElementById('user-form');
    const resultDiv = document.getElementById('result');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const height = parseFloat(document.getElementById('height').value);
        const gender = document.querySelector('input[name="gender"]:checked').value;
        
        if (!name || isNaN(height)) {
            resultDiv.innerHTML = `<p>유효한 값을 입력해주세요.</p>`;
            return;
        }

        // Simplified percentile calculation based on gender
        // These are just approximate values for demonstration
        let meanHeight;
        let stdDev;

        if (gender === 'male') {
            meanHeight = 176; // Mean height for males in cm
            stdDev = 7;       // Standard deviation for males
        } else { // female
            meanHeight = 163; // Mean height for females in cm
            stdDev = 6.5;     // Standard deviation for females
        }

        const zScore = (height - meanHeight) / stdDev;

        // A simple approximation of the standard normal CDF
        function standardNormalCdf(z) {
            const p = 0.3275911;
            const a1 = 0.254829592;
            const a2 = -0.284496736;
            const a3 = 1.421413741;
            const a4 = -1.453152027;
            const a5 = 1.061405429;

            const sign = (z >= 0) ? 1 : -1;
            z = Math.abs(z) / Math.sqrt(2.0);

            const t = 1.0 / (1.0 + p * z);
            const erf = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);
            const cdf = 0.5 * (1.0 + sign * erf);
            return cdf;
        }
        
        const percentile = standardNormalCdf(zScore) * 100;
        const topPercentile = 100 - percentile;

        const genderText = gender === 'male' ? '남성' : '여성';
        resultDiv.innerHTML = `<p>${name}님, 키 ${height}cm는 ${genderText} 기준 상위 ${topPercentile.toFixed(2)}%에 속합니다.</p>`;
    });
});
