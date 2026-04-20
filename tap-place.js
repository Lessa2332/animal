/* globals AFRAME, THREE */

// Поліфіл для roundRect (виправлення критичного бага #1)
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.moveTo(x + r, y);
    this.lineTo(x + w - r, y);
    this.quadraticCurveTo(x + w, y, x + w, y + r);
    this.lineTo(x + w, y + h - r);
    this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    this.lineTo(x + r, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - r);
    this.lineTo(x, y + r);
    this.quadraticCurveTo(x, y, x + r, y);
    return this;
  };
}

AFRAME.registerComponent('tap-place', {
  init() {
    const scene = this.el.sceneEl;
    this.boundHandler = this.onClick.bind(this);
    scene.addEventListener('click', this.boundHandler);
    
    // Для зручності зберігаємо посилання на canvas
    this.infoCanvas = document.getElementById('infoCanvas');
  },

  onClick(event) {
    // Перевіряємо, чи AR активовано через квест
    if (!window.isARReady) return;

    // Якщо клік по планеті – збираємо артефакт
    const targetEl = event.target;
    if (targetEl && targetEl.classList && targetEl.classList.contains('planet-planted')) {
      this.collectArtifact(targetEl);
      return;
    }

    // Інакше – розміщуємо нову планету (тільки якщо ще немає)
    if (document.querySelector('.artifact-group')) return;

    // Отримуємо точку перетину (де клікнули)
    if (!event.detail || !event.detail.intersection) return;
    const point = event.detail.intersection.point;
    
    const scene = this.el.sceneEl;
    
    // Група для всіх елементів артефакту
    const group = document.createElement('a-entity');
    group.classList.add('artifact-group');
    group.setAttribute('position', { x: point.x, y: point.y, z: point.z });
    scene.appendChild(group);

    // Планета (модель GLB)
    const planet = document.createElement('a-entity');
    planet.classList.add('planet-planted', 'cantap');
    planet.setAttribute('gltf-model', '#planetModel');
    planet.setAttribute('scale', '0.5 0.5 0.5');
    planet.setAttribute('animation', 'property: rotation; to: 0 360 0; dur: 15000; loop: true; easing: linear');
    
    // Обробник помилки завантаження моделі (виправлення #3, #10)
    planet.addEventListener('model-error', () => {
      console.warn('Не вдалося завантажити planet.glb');
      const errorText = document.createElement('a-text');
      errorText.setAttribute('value', '⚠️ Планета не завантажилась');
      errorText.setAttribute('color', 'red');
      errorText.setAttribute('position', '0 0.5 0');
      group.appendChild(errorText);
    });
    
    group.appendChild(planet);

    // Текст над планетою (з урахуванням масштабу)
    const poleText = document.createElement('a-text');
    poleText.setAttribute('value', "АРТЕФАКТ ЗНАЙДЕНО!\nТоркнись, щоб забрати");
    poleText.setAttribute('align', 'center');
    poleText.setAttribute('position', '0 0.85 0'); // трохи вище
    poleText.setAttribute('scale', '0.8 0.8 0.8');
    poleText.setAttribute('color', '#4ade80');
    poleText.setAttribute('font', 'mozillavr');
    planet.appendChild(poleText);

    // Інформаційна панель поруч (з виправленим roundRect)
    this.drawInfo();
    const infoPlane = document.createElement('a-plane');
    infoPlane.setAttribute('width', '1.5');
    infoPlane.setAttribute('height', '1.2');
    infoPlane.setAttribute('position', '1.3 0.6 0');
    infoPlane.setAttribute('rotation', '0 -30 0');
    infoPlane.setAttribute('material', { src: '#infoCanvas', transparent: true });
    group.appendChild(infoPlane);

    // Сховати інструкцію після першого розміщення
    const inst = document.getElementById('ar-instruction');
    if (inst) inst.style.display = 'none';
  },

  drawInfo() {
    const canvas = this.infoCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 512;
    ctx.clearRect(0, 0, 512, 512);
    
    // Фон із закругленими кутами (тепер roundRect працює!)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.beginPath();
    ctx.roundRect(0, 0, 512, 512, 50);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.roundRect(0, 0, 512, 512, 50);
    ctx.stroke();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 34px "Segoe UI", system-ui';
    ctx.fillText('🌍 ОБ\'ЄКТ: БІОСФЕРА', 50, 85);
    ctx.font = '26px system-ui';
    const lines = [
      "● Статус: Стабільний",
      "● Рівень: Початковий",
      "● Місія: Зібрати дані",
      "",
      "👉 Натисни на планету,",
      "щоб завершити місію!"
    ];
    lines.forEach((line, idx) => {
      ctx.fillText(line, 50, 170 + idx * 48);
    });
    
    // Оновлюємо текстуру в A-Frame
    canvas.needsUpdate = true;
  },

  collectArtifact(planetEl) {
    // Анімація зникнення
    planetEl.setAttribute('animation__shrink', {
      property: 'scale',
      to: '0 0 0',
      dur: 800,
      easing: 'easeInBack'
    });
    
    // Виклик зірок з правильною позицією (виправлення #2)
    this.spawnStarsAround(planetEl);
    
    // Затримка перед повідомленням та перезавантаженням
    setTimeout(() => {
      alert("🏆 ВІТАЮ! Ти отримав Артефакт Біосфери. Переходь до наступного завдання!");
      // Перезавантаження через 1.5 секунди (щоб анімація завершилась)
      setTimeout(() => location.reload(), 1500);
    }, 900);
  },

  spawnStarsAround(planetEl) {
    const scene = this.el.sceneEl;
    // Отримуємо СВІТОВУ позицію планети (виправлення #2)
    const worldPos = new THREE.Vector3();
    planetEl.object3D.getWorldPosition(worldPos);
    
    for (let i = 0; i < 18; i++) {
      const star = document.createElement('a-text');
      star.setAttribute('value', '⭐');
      star.setAttribute('scale', '0.5 0.5 0.5');
      star.setAttribute('position', `${worldPos.x} ${worldPos.y + 0.6} ${worldPos.z}`);
      star.setAttribute('animation', {
        property: 'position',
        to: `${worldPos.x + (Math.random() - 0.5) * 4} ${worldPos.y + 2 + Math.random() * 2} ${worldPos.z + (Math.random() - 0.5) * 4}`,
        dur: 1200,
        easing: 'easeOutQuad'
      });
      scene.appendChild(star);
      // Видаляємо зірку після анімації (виправлення #11)
      setTimeout(() => star.remove(), 1500);
    }
  },

  remove() {
    // Очищення слухача подій
    const scene = this.el.sceneEl;
    if (scene && this.boundHandler) {
      scene.removeEventListener('click', this.boundHandler);
    }
  }
});
