AFRAME.registerComponent('tap-place', {
  init() {
    const scene = this.el.sceneEl;

    scene.addEventListener('click', (event) => {
      if (event.target.classList.contains('planet-planted')) {
        this.animatePlanet(event.target);
        return;
      }

      if (!event.detail || !event.detail.intersection) return;

      const helper = document.getElementById('helper-text');
      if (helper) helper.setAttribute('visible', 'false');

      const point = event.detail.intersection.point;
      const existing = document.querySelector('.mission-group');
      if (existing) existing.remove();

      // Створюємо групу "Штаб"
      const group = document.createElement('a-entity');
      group.classList.add('mission-group');
      group.setAttribute('position', {x: point.x, y: point.y, z: point.z});
      scene.appendChild(group);

      // Голограма планети
      const planet = document.createElement('a-entity');
      planet.classList.add('planet-planted', 'cantap');
      planet.setAttribute('gltf-model', '#planetModel');
      planet.setAttribute('scale', '0.001 0.001 0.001');
      
      // Анімація розгортання
      planet.setAttribute('animation__grow', {
        property: 'scale', to: '0.45 0.45 0.45', dur: 1200, easing: 'easeOutQuart'
      });
      // Обертання як у радара
      planet.setAttribute('animation__rot', {
        property: 'rotation', to: '0 360 0', dur: 15000, loop: true, easing: 'linear'
      });
      group.appendChild(planet);

      // Інфо-монітор
      this.drawCanvas();
      const info = document.createElement('a-plane');
      info.setAttribute('width', '1.4');
      info.setAttribute('height', '1.4');
      info.setAttribute('position', '1.4 1 -0.3');
      info.setAttribute('rotation', '0 -20 0');
      info.setAttribute('material', {src: '#infoCanvas', transparent: true, opacity: 0});
      
      // Поява монітора
      info.setAttribute('animation__fade', {property: 'material.opacity', to: 1, dur: 800, delay: 1000});
      group.appendChild(info);
    });
  },

  drawCanvas() {
    const canvas = document.getElementById('infoCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 512, 512);
    
    // Дизайн терміналу
    ctx.fillStyle = 'rgba(2, 6, 23, 0.9)';
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, 502, 502);

    // Заголовок
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 30px Courier New';
    ctx.fillText('> ІНСТРУКЦІЯ АГЕНТА', 40, 60);
    
    ctx.fillStyle = '#fff';
    ctx.font = '22px Courier New';
    const lines = [
      "---------------------------",
      "КРОК 1: Пройди синхронізацію (📂)",
      "КРОК 2: Отримай код доступу.",
      "КРОК 3: Активуй карту (📟).",
      "КРОК 4: Знайди перший артефакт",
      "        у реальному класі.",
      "---------------------------",
      "ПАМ'ЯТАЙ: Біосфера - це ми!"
    ];
    lines.forEach((l, i) => ctx.fillText(l, 40, 130 + (i * 45)));
  },

  animatePlanet(el) {
    el.setAttribute('animation__click', {
      property: 'scale', to: '0.5 0.5 0.5', dir: 'alternate', dur: 200, loop: 1
    });
  }
});

// Ефект успіху (зірки)
window.spawnStars = function() {
  const scene = document.querySelector('a-scene');
  const planet = document.querySelector('.planet-planted');
  if (!planet) return;
  const p = planet.getAttribute('position');

  for (let i = 0; i < 15; i++) {
    const s = document.createElement('a-text');
    s.setAttribute('value', '!');
    s.setAttribute('color', '#38bdf8');
    s.setAttribute('position', `${p.x} ${p.y + 0.5} ${p.z}`);
    s.setAttribute('animation', {
      property: 'position', 
      to: `${p.x + (Math.random()-0.5)*4} ${p.y + 3} ${p.z + (Math.random()-0.5)*4}`,
      dur: 1500, easing: 'easeOutExpo'
    });
    scene.appendChild(s);
  }
};
