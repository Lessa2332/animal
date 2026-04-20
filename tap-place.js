AFRAME.registerComponent('tap-place', {
  init() {
    const scene = this.el.sceneEl;

    scene.addEventListener('click', (event) => {
      if (!window.isARReady) return;

      // ЛОГІКА: ТАП ПО ПЛАНЕТІ (ФІНАЛ)
      if (event.target.classList.contains('planet-planted')) {
        this.collectArtifact(event.target);
        return;
      }

      if (!event.detail || !event.detail.intersection) return;

      // Приховати інструкцію
      const inst = document.getElementById('ar-instruction');
      if (inst) inst.style.display = 'none';

      const point = event.detail.intersection.point;
      if (document.querySelector('.artifact-group')) return;

      const group = document.createElement('a-entity');
      group.classList.add('artifact-group');
      group.setAttribute('position', {x: point.x, y: point.y, z: point.z});
      scene.appendChild(group);

      const planet = document.createElement('a-entity');
      planet.classList.add('planet-planted', 'cantap');
      planet.setAttribute('gltf-model', '#planetModel');
      planet.setAttribute('scale', '0.5 0.5 0.5');
      planet.setAttribute('animation', 'property: rotation; to: 0 360 0; dur: 15000; loop: true; easing: linear');
      group.appendChild(planet);

      // ТЕКСТ НА ПОЛЮСІ (Північ)
      const poleText = document.createElement('a-text');
      poleText.setAttribute('value', "АРТЕФАКТ ЗНАЙДЕНО!\nТоркнись, щоб забрати");
      poleText.setAttribute('align', 'center');
      poleText.setAttribute('position', '0 0.7 0'); // Вище планети
      poleText.setAttribute('scale', '0.8 0.8 0.8');
      poleText.setAttribute('color', '#4ade80');
      planet.appendChild(poleText);

      // Інфо-панель поруч
      this.drawInfo();
      const info = document.createElement('a-plane');
      info.setAttribute('width', '1.5');
      info.setAttribute('height', '1.2');
      info.setAttribute('position', '1.3 0.6 0');
      info.setAttribute('rotation', '0 -30 0');
      info.setAttribute('material', {src: '#infoCanvas', transparent: true});
      group.appendChild(info);
    });
  },

  drawInfo() {
    const ctx = document.getElementById('infoCanvas').getContext('2d');
    ctx.clearRect(0, 0, 512, 512);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.beginPath(); ctx.roundRect(0, 0, 512, 512, 50); ctx.fill();
    ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 10; ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 30px sans-serif';
    ctx.fillText('🌍 ОБ\'ЄКТ: БІОСФЕРА', 50, 80);
    ctx.font = '24px sans-serif';
    const txt = ["● Статус: Стабільний", "● Рівень: Початковий", "● Місія: Зібрати дані", "", "Натисни на планету,", "щоб завершити вступ!"];
    txt.forEach((l, i) => ctx.fillText(l, 50, 160 + (i * 45)));
  },

  collectArtifact(el) {
    // Ефект "забирання": планета стискається і зникає
    el.setAttribute('animation__shrink', {
      property: 'scale', to: '0 0 0', dur: 800, easing: 'easeInBack'
    });
    
    // Зірочки на прощання
    if (window.spawnStars) window.spawnStars();

    setTimeout(() => {
      alert("🏆 ВСТУП ЗАВЕРШЕНО! Ви отримали Артефакт Біосфери. Переходьте до наступної локації у класі!");
      location.reload(); // Скидання для наступного учня або етапу
    }, 1000);
  }
});

window.spawnStars = function() {
  const scene = document.querySelector('a-scene');
  const planet = document.querySelector('.planet-planted');
  const p = planet.getAttribute('position');
  for (let i = 0; i < 15; i++) {
    const s = document.createElement('a-text');
    s.setAttribute('value', '⭐');
    s.setAttribute('position', `${p.x} ${p.y + 0.5} ${p.z}`);
    s.setAttribute('animation', {
      property: 'position', to: `${(Math.random()-0.5)*5} 4 ${(Math.random()-0.5)*5}`, dur: 1500
    });
    scene.appendChild(s);
  }
};
