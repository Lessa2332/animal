AFRAME.registerComponent('tap-place', {
  init() {
    const scene = this.el.sceneEl;

    scene.addEventListener('click', (event) => {
      // 1. Перевірка: чи активовано режим AR через код?
      if (!window.isARReady) return;

      // 2. Якщо клікнули по вже існуючій планеті — вона реагує на тап
      if (event.target.classList.contains('planet-planted')) {
        this.interactWithArtifact(event.target);
        return;
      }

      if (!event.detail || !event.detail.intersection) return;

      // Приховати інструкцію після першого тапу
      const instruction = document.getElementById('ar-instruction');
      if (instruction) instruction.style.opacity = '0';

      const point = event.detail.intersection.point;
      const existing = document.querySelector('.artifact-group');
      if (existing) existing.remove();

      // Створюємо групу Артефакту
      const group = document.createElement('a-entity');
      group.classList.add('artifact-group');
      group.setAttribute('position', {x: point.x, y: point.y, z: point.z});
      scene.appendChild(group);

      // Планета (Артефакт)
      const planet = document.createElement('a-entity');
      planet.classList.add('planet-planted', 'cantap');
      planet.setAttribute('gltf-model', '#planetModel');
      planet.setAttribute('scale', '0.001 0.001 0.001');
      
      planet.setAttribute('animation__grow', {
        property: 'scale', to: '0.5 0.5 0.5', dur: 1500, easing: 'easeOutElastic'
      });
      planet.setAttribute('animation__rotation', {
        property: 'rotation', to: '0 360 0', dur: 20000, loop: true, easing: 'linear'
      });
      group.appendChild(planet);

      // Пояснювальна панель для дитини
      this.drawArtifactInfo();
      const info = document.createElement('a-plane');
      info.setAttribute('width', '1.5');
      info.setAttribute('height', '1.5');
      info.setAttribute('position', '0 1.2 -0.8'); // Панель над планетою
      info.setAttribute('material', {src: '#infoCanvas', transparent: true, opacity: 0});
      info.setAttribute('animation__fade', {property: 'material.opacity', to: 1, dur: 1000, delay: 1000});
      group.appendChild(info);
    });
  },

  drawArtifactInfo() {
    const canvas = document.getElementById('infoCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 512, 512);
    
    // Стиль панелі "Артефакт"
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.beginPath();
    ctx.roundRect(0, 0, 512, 512, 60);
    ctx.fill();
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 12;
    ctx.stroke();

    // Текст для дитини
    ctx.fillStyle = '#4ade80';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('🌍 АРТЕФАКТ ЗНАЙДЕНО!', 50, 80);
    
    ctx.fillStyle = '#fff';
    ctx.font = '24px sans-serif';
    const lines = [
      "Це — голограма нашої Біосфери.",
      "Вона жива і тендітна. Ти щойно",
      "розблокував доступ до знань!",
      "",
      "Торкнись планети пальцем,",
      "щоб відчути її енергію.",
      "Твоя місія: Берегти цей світ!"
    ];
    lines.forEach((l, i) => ctx.fillText(l, 50, 160 + (i * 45)));
  },

  interactWithArtifact(el) {
    // Реакція планети на тап: вона підстрибує та випускає зірки
    el.setAttribute('animation__tap', {
      property: 'position', 
      to: `${el.object3D.position.x} ${el.object3D.position.y + 0.3} ${el.object3D.position.z}`, 
      dir: 'alternate', 
      dur: 300, 
      loop: 1
    });
    
    if (window.spawnStars) window.spawnStars();
  }
});

// Ефект "енергії" при тапі
window.spawnStars = function() {
  const scene = document.querySelector('a-scene');
  const planet = document.querySelector('.planet-planted');
  if (!planet) return;
  const p = planet.getAttribute('position');

  for (let i = 0; i < 10; i++) {
    const s = document.createElement('a-text');
    s.setAttribute('value', '✨');
    s.setAttribute('position', `${p.x} ${p.y + 0.5} ${p.z}`);
    s.setAttribute('animation', {
      property: 'position', 
      to: `${p.x + (Math.random()-0.5)*4} ${p.y + 3} ${p.z + (Math.random()-0.5)*4}`,
      dur: 1500, easing: 'easeOutExpo'
    });
    scene.appendChild(s);
    setTimeout(() => s.remove(), 1500);
  }
};
