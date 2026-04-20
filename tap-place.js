/* globals AFRAME */

AFRAME.registerComponent('tap-place', {
  init() {
    const scene = this.el.sceneEl;

    scene.addEventListener('click', (event) => {
      if (!event.detail || !event.detail.intersection) return;

      const point = event.detail.intersection.point;

      // Видаляємо стару планету, щоб не було купи об'єктів
      const existing = document.querySelectorAll('.planet-planted');
      if (existing.length >= 1) { existing[0].remove(); }

      const newPlanet = document.createElement('a-entity');
      newPlanet.classList.add('planet-planted');

      const startRot = Math.random() * 360;
      
      // Позиція: y + 0.2 (нижче до підлоги)
      newPlanet.setAttribute('position', {x: point.x, y: point.y + 0.2, z: point.z});
      newPlanet.setAttribute('rotation', {x: 0, y: startRot, z: 0});
      newPlanet.setAttribute('scale', '0.001 0.001 0.001');
      newPlanet.setAttribute('visible', 'false');
      
      newPlanet.setAttribute('gltf-model', '#planetModel');

      scene.appendChild(newPlanet);

      newPlanet.addEventListener('model-loaded', () => {
        newPlanet.setAttribute('visible', 'true');
        
        // Анімація росту
        newPlanet.setAttribute('animation__grow', {
          property: 'scale',
          to: '0.5 0.5 0.5', // Оптимальний розмір для дитини
          easing: 'easeOutElastic',
          dur: 1500
        });

        // Постійне обертання
        newPlanet.setAttribute('animation__rotate', {
          property: 'rotation',
          from: `0 ${startRot} 0`,
          to: `0 ${startRot + 360} 0`,
          dur: 30000,
          loop: true,
          easing: 'linear'
        });
        
        // Сховати текст-підказку після першого тапу
        const helper = document.getElementById('helper-text');
        if (helper) helper.setAttribute('visible', 'false');
      });
    });
  }
});

// Функція нагороди (зірки)
window.spawnStars = function() {
  const scene = document.querySelector('a-scene');
  const planet = document.querySelector('.planet-planted');
  
  if (!planet) return;

  const pos = planet.getAttribute('position');

  for (let i = 0; i < 5; i++) {
    const star = document.createElement('a-text');
    star.setAttribute('value', '⭐');
    star.setAttribute('align', 'center');
    star.setAttribute('scale', '3 3 3');
    
    // Позиція зірок навколо планети
    const x = pos.x + (Math.random() - 0.5) * 2.5;
    const y = pos.y + 1.2 + (Math.random() * 0.8);
    const z = pos.z + (Math.random() - 0.5) * 2.5;
    
    star.setAttribute('position', `${x} ${y} ${z}`);
    
    // Анімація "підстрибування"
    star.setAttribute('animation', {
      property: 'position',
      to: `${x} ${y + 0.4} ${z}`,
      dir: 'alternate',
      dur: 800 + (Math.random() * 400),
      loop: true,
      easing: 'easeInOutQuad'
    });

    scene.appendChild(star);
  }
};
