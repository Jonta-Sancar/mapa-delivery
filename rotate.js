function enableRotateByHammer(){
  const mapContainer = document.getElementById('map');
  const hammer = new Hammer(mapContainer);
      
  let currentRotation = 0;
  
  // Detecta o gesto de rotação (twist com dois dedos)
  hammer.get('rotate').set({ enable: true });
  
  // Aplica a rotação ao mapa com base no gesto
  hammer.on('rotate', function(event) {
    currentRotation += event.rotation;  // Acumula o valor da rotação
    rotateMap(currentRotation)
  });
  
  hammer.on('rotateend', ()=>{}); // Quando o gesto de rotação terminar, aplica o ângulo final ao mapa
}