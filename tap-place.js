/* globals AFRAME, THREE */

// Поліфіл roundRect (без змін)
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
  };
}

AFRAME.registerComponent('tap-place', {
  init() {
    this.el.sceneEl.addEventListener('click', (ev) => this.onClick(ev));
  },

  onClick(event) {
    if (!window.isARReady) return;

    // Отримуємо перетин та елемент, на який клікнули
    const intersection = event.detail.intersection;
    if (!intersection) return;

    const targetEl = intersection.object.el;

    // Якщо клікнули по вже розміщеній планеті – збираємо артефакт
    if (targetEl && targetEl.classList && targetEl.classList.contains('planet-planted')) {
      this.collectArtifact(targetEl);
      return;
    }

    // Розміщення нової планети (тільки один раз)
    if (document.querySelector('.artifact-group')) return;

    const { point } = intersection;
    const group = document.createElement('a-entity');
    group.classList.add('artifact-group');
    group.setAttribute('position', point);
    this.el.sceneEl.appendChild(group);

    // Модель планети
    const planet = document.createElement('a-entity');
    planet.classList.add('planet-planted', 'cantap');
    planet.setAttribute('gltf-model', '#planetModel');
    planet.setAttribute('scale', '0.5 0.5 0.5');
    planet.setAttribute('animation', 'property: rotation; to: 0 360 0; dur: 15000; loop: true; easing: linear');
    group.appendChild(planet);

    // Інформаційна панель
    const infoPlane = document.createElement('a-plane');
    infoPlane.setAttribute('width', '1.5');
    infoPlane.setAttribute('height', '1.2');
    infoPlane.setAttribute('position', '0 1.2 -0.5');
    infoPlane.setAttribute('material', 'src: #infoCanvas; transparent: true; side: double');
    group.appendChild(infoPlane);

    // 🔧 ВИПРАВЛЕНО: чекаємо, поки площина завантажиться, і тільки тоді малюємо текст
    infoPlane.addEventListener('loaded', () => {
      this.drawInfoOnPlane(infoPlane);
    });

    document.getElementById('ar-instruction').style.display = 'none';
  },

  // 🔧 НОВИЙ МЕТОД – малює на канвасі та оновлює текстуру конкретної площини
  drawInfoOnPlane(planeEl) {
    const canvas = document.getElementById('infoCanvas');
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.roundRect(0, 0, 512, 512, 40);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 10;
    ctx.stroke();

    ctx.fillStyle = 'white';
    ctx.font = 'bold 40px sans-serif';
    ctx.fillText('🌍 ОБ\'ЄКТ: БІОСФЕРА', 40, 80);
    ctx.font = '30px sans-serif';
    ctx.fillText('● Стан: Стабільний', 40, 160);
    ctx.fillText('● Місія: Виконана', 40, 210);
    ctx.fillStyle = '#4ade80';
    ctx.fillText('👉 ТОРКНИСЬ ПЛАНЕТИ', 40, 350);

    // Оновлюємо текстуру саме цієї площини
    const mesh = planeEl.getObject3D('mesh');
    if (mesh && mesh.material) {
      mesh.material.map.needsUpdate = true;
    }
  },

  collectArtifact(el) {
    el.setAttribute('animation__shrink', 'property: scale; to: 0 0 0; dur: 600; easing: easeInBack');
    
    const pos = el.object3D.position;
    for (let i = 0; i < 10; i++) {
      const star = document.createElement('a-text');
      star.setAttribute('value', '⭐');
      star.setAttribute('position', `${pos.x} ${pos.y + 0.5} ${pos.z}`);
      star.setAttribute('animation', `property: position; to: ${pos.x + (Math.random()-0.5)*3} ${pos.y+3} ${pos.z + (Math.random()-0.5)*3}; dur: 1000`);
      this.el.sceneEl.appendChild(star);
      setTimeout(() => star.remove(), 1000);
    }

    setTimeout(() => {
      alert("🏆 Артефакт Біосфери отримано!");
      location.reload();
    }, 800);
  }
});
