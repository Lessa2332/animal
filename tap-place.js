/* globals AFRAME */

AFRAME.registerComponent('tap-place', {
  init() {
    const scene = this.el.sceneEl;

    scene.addEventListener('click', (event) => {
      if (!event.detail || !event.detail.intersection) return;

      const point = event.detail.intersection.point;

      // Обмеження — максимум 3 планети
      const existingPlanets = document.querySelectorAll('.planet-planted');
      if (existingPlanets.length >= 3) {
        existingPlanets[0].remove();
      }

      const newPlanet = document.createElement('a-entity');
      newPlanet.classList.add('planet-planted');

      // Центр планети трохи вище точки тапу
      const yOffset = 0.5;
      newPlanet.setAttribute('position', `${point.x} ${point.y + yOffset} ${point.z}`);

      // Початковий розмір майже нульовий
      newPlanet.setAttribute('scale', '0.01 0.01 0.01');

      // Примітив планети (радіус 0.5 м → діаметр 1 м)
      newPlanet.setAttribute('geometry', 'primitive: sphere; radius: 0.5');

      // Твоя PNG-текстура
      newPlanet.setAttribute('material', 'src: planet.png; side: double; roughness: 0.8; metalness: 0.2');

      scene.appendChild(newPlanet);

      // Анімація росту
      newPlanet.setAttribute('animation__grow', {
        property: 'scale',
        to: '1 1 1',
        easing: 'easeOutElastic',
        dur: 1400
      });

      // Авто-обертання (30 секунд на повний оберт)
      newPlanet.setAttribute('animation__rotate', {
        property: 'rotation',
        to: '0 360 0',
        dur: 30000,
        loop: true,
        easing: 'linear'
      });
    });
  }
});
