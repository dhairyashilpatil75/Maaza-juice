// Configuration
const frameCount = 56;
const imageFolder = 'ezgif-7292cd4c1ecc8586-jpg';
const images = [];
let loadedCount = 0;
let currentFrameIndex = 0;
let targetFrameIndex = 0;

// Elements
const loader = document.getElementById('loader');
const progressBar = document.getElementById('progress-bar');
const progressPercent = document.getElementById('progress-percent');
const canvas = document.getElementById('animation-canvas');
const ctx = canvas.getContext('2d');
const sections = document.querySelectorAll('.scroll-section');

// Image Path Generator
const getFramePath = (index) => {
    const paddedIndex = index.toString().padStart(3, '0');
    return `${imageFolder}/ezgif-frame-${paddedIndex}.jpg`;
};

// Canvas Responsive Sizing
const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    
    // Redraw current frame
    if (images[Math.round(currentFrameIndex)]) {
        drawFrame(Math.round(currentFrameIndex));
    }
};

// Center Cover Drawing helper (like object-fit: cover)
const drawImageProp = (ctx, img, x, y, w, h) => {
    const imgRatio = img.width / img.height;
    const canvasRatio = w / h;
    let sx, sy, sw, sh;

    if (imgRatio > canvasRatio) {
        // Image is wider than canvas
        sh = img.height;
        sw = sh * canvasRatio;
        sx = (img.width - sw) / 2;
        sy = 0;
    } else {
        // Image is taller than canvas
        sw = img.width;
        sh = sw / canvasRatio;
        sx = 0;
        sy = (img.height - sh) / 2;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
};

// Render specific frame
const drawFrame = (index) => {
    const img = images[index];
    if (img && img.complete) {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        drawImageProp(ctx, img, 0, 0, window.innerWidth, window.innerHeight);
    }
};

// Scroll Handler
const handleScroll = () => {
    const scrollTop = window.scrollY;
    // The animated container is 3 viewports long before the static content emerges
    const animationHeight = window.innerHeight * 3;
    const scrollFraction = Math.min(1, Math.max(0, scrollTop / animationHeight));
    
    // Set target frame based on scroll fraction
    targetFrameIndex = Math.floor(scrollFraction * (frameCount - 1));

    // Handle Scroll Section Actives for text animations
    const activeIndex = Math.min(
        sections.length - 1,
        Math.floor((scrollTop + window.innerHeight / 2) / window.innerHeight)
    );
    
    sections.forEach((sec, idx) => {
        if (idx === activeIndex) {
            sec.classList.add('active');
        } else {
            sec.classList.remove('active');
        }
    });
};

// Smooth Animation Loop
const updateAnimation = () => {
    // Smooth frame transitions using lerp (Linear Interpolation)
    // 0.15 factor gives a luxurious momentum feel to scrolling
    const diff = targetFrameIndex - currentFrameIndex;
    if (Math.abs(diff) > 0.01) {
        currentFrameIndex += diff * 0.15;
        drawFrame(Math.round(currentFrameIndex));
    } else if (Math.round(currentFrameIndex) !== targetFrameIndex) {
        currentFrameIndex = targetFrameIndex;
        drawFrame(targetFrameIndex);
    }
    
    requestAnimationFrame(updateAnimation);
};

// Start preloading images
const preloadImages = () => {
    for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        img.onload = () => {
            loadedCount++;
            const progress = Math.round((loadedCount / frameCount) * 100);
            progressBar.style.width = `${progress}%`;
            progressPercent.innerText = `${progress}%`;

            if (loadedCount === frameCount) {
                // Done loading
                setTimeout(() => {
                    loader.classList.add('fade-out');
                    resizeCanvas();
                    requestAnimationFrame(updateAnimation);
                }, 400); // Small delay for visual aesthetic satisfaction
            }
        };
        img.onerror = () => {
            console.error(`Failed to load frame ${i}`);
            // Still count to prevent hanging the loader
            loadedCount++;
            if (loadedCount === frameCount) {
                setTimeout(() => {
                    loader.classList.add('fade-out');
                    resizeCanvas();
                    requestAnimationFrame(updateAnimation);
                }, 400);
            }
        };
        img.src = getFramePath(i);
        images.push(img);
    }
};

// Initial Setup
window.addEventListener('resize', resizeCanvas);
window.addEventListener('scroll', handleScroll);

// Kick off
preloadImages();
resizeCanvas();
