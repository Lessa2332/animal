/* globals AFRAME */

AFRAME.registerComponent('tap-place', {
  init() {
    const scene = this.el.sceneEl;

    scene.addEventListener('click', (event) => {
      // Перевірка на перетин з підлогою (клас .cantap)
      if (!event.detail || !event.detail.intersection) return;

      const point = event.detail.intersection.point;

      // Обмеження кількості (як у квітки, але ставимо 3)
      const existing = document.querySelectorAll('.planet-planted');
      if (existing.length >= 3) {
        existing[0].remove();
      }

      const newPlanet = document.createElement('a-entity');
      newPlanet.classList.add('planet-planted');

      // Випадковий поворот навколо осі Y для різноманітності
      const startRot = Math.random() * 360;
      
      // Налаштування позиції (трохи вище точки тапу)
      newPlanet.setAttribute('position', {x: point.x, y: point.y + 0.5, z: point.z});
      newPlanet.setAttribute('rotation', {x: 0, y: startRot, z: 0});
      newPlanet.setAttribute('scale', '0.001 0.001 0.001'); // Стартуємо з мікро-розміру
      newPlanet.setAttribute('visible', 'false');
      
      // Встановлюємо модель GLB (ідентично квіткам)
      newPlanet.setAttribute('gltf-model', '#planetModel');

      scene.appendChild(newPlanet);

      // Очікуємо повного завантаження моделі
      newPlanet.addEventListener('model-loaded', () => {
        newPlanet.setAttribute('visible', 'true');

        // Анімація "росту" (як у квітки)
        newPlanet.setAttribute('animation__grow', {
          property: 'scale',
          to: '1 1 1',
          easing: 'easeOutElastic',
          dur: 1500
        });

        // Анімація постійного обертання (специфічно для планети)
        newPlanet.setAttribute('animation__rotate', {
          property: 'rotation',
          from: `0 ${startRot} 0`,
          to: `0 ${startRot + 360} 0`,
          dur: 25000,
          loop: true,
          easing: 'linear'
        });
      });
    });
  }
});
