function enableRotateByHammer(){
  const circle   = document.querySelector('.circle');

  const mapContainer = document.querySelector('#map');
  const hammer = new Hammer(mapContainer);
      
  let current_rotation = 0;
  let element_rotation = 0;
  let initial_rotation = 0;
  let final_rotation = 0;
  
  // Detecta o gesto de rotação (twist com dois dedos)
  hammer.get('rotate').set({ enable: true });
  
  // Pega a rotação atual do círculo e inicia o ajuste de rotação
  hammer.on('rotatestart', function(event) {
    element_rotation = Number(circle.dataset.rotation);
    initial_rotation = event.rotation; // Armazena a rotação inicial do gesto
  });

  // Aplica a rotação ao mapa com base no gesto
  hammer.on('rotate', function(event) {
    current_rotation   = Number((event.rotation - initial_rotation).toFixed(2));  // pega a parcela de rotação

    final_rotation = current_rotation + element_rotation;
    
    circle.style.transform = `rotate(${final_rotation}deg)`;
    rotateMap(final_rotation);
  });
  
  hammer.on('rotateend', ()=>{
    circle.dataset.rotation = final_rotation;
  }); // Quando o gesto de rotação terminar, aplica o ângulo final ao mapa
}