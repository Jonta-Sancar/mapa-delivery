// Inicializa o mapa
var map = L.map('map', {
  rotate: true
}).setView([-12.2664, -38.9663], 13);

// Adiciona a camada do OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Definindo ícones personalizados para origem e destino
const customIconOrigin = L.icon({
  iconUrl: './assets/person.svg', // Ícone de origem (exemplo)
  iconSize: [38, 38], // Tamanho do ícone
  iconAnchor: [19, 38], // Âncora (ponto de referência do ícone)
});

// Inicializa o controle de roteamento
var control = L.Routing.control({
  waypoints: [],
  routeWhileDragging: true,
  createMarker: function(i, waypoint, n) {
      if (i === 0) {
          return L.marker(waypoint.latLng, { icon: customIconOrigin }).bindPopup("Origem");
      } else {
          return L.marker(waypoint.latLng);
      }
  }
}).addTo(map);

var markers = [];

// Define o ícone personalizado
var customIcon_for_origin = L.icon({
  iconUrl: 'assets/person.svg', // Caminho para a imagem do ícone
  // shadowUrl: 'shadow.png', // Caminho para a imagem da sombra (opcional)
  iconSize: [50, 125], // Tamanho do ícone
  shadowSize: [50, 64], // Tamanho da sombra
  iconAnchor: [22, 94], // Ponto do ícone que corresponde à localização do marcador
  shadowAnchor: [4, 62], // Ponto da sombra que corresponde à localização do marcador
  popupAnchor: [-3, -76] // Ponto de onde o popup deve abrir em relação ao iconAnchor
});

// Exemplo de rotação - rotaciona 90 graus
function rotateMap(degrees) {
  map.setBearing(degrees);
}

function clearMap() {
  control.setWaypoints([]);
  markers.forEach(marker => map.removeLayer(marker));
  markers = [];
}

// Função para geocodificar um endereço
async function geocode(address, callback) {
  var url = 'https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(address);
  const response = await fetch(url);
  
  try{
    const data = await response.json();
    
    if (data && data.length > 0) {
      var latLng = L.latLng(data[0].lat, data[0].lon);
      
      if(callback){
        callback(latLng);
      }
      return latLng;
    } else {
      alert('Endereço não encontrado: ' + address);
      return null;
    }
  }catch(error){
    console.error('Erro na geocodificação:', error);
    alert('Erro na geocodificação: ' + address);
    return null;
  }
}

function reverseGeocode(lat, lon, callback) {
  var url = 'https://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + lon;
  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data && data.address) {
        callback(data.address);
      } else {
        alert('Endereço não encontrado para as coordenadas: ' + lat + ', ' + lon);
      }
    })
    .catch(error => {
      console.error('Erro na geocodificação reversa:', error);
      alert('Erro na geocodificação reversa: ' + lat + ', ' + lon);
    });
}

function getLocation() {
  toggleSpinner();
  clearMap()
  if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
          var lat = position.coords.latitude;
          var lon = position.coords.longitude;
          reverseGeocode(lat, lon, function(address) {
              document.getElementById('start').value = "Sua localização";
              document.getElementById('start-vetor').value = lat + ',' + lon;
                                  
              let endereco = [[]];
              address.road ? endereco[0].push(address.road): false;
              address.suburb ? endereco[0].push(address.suburb): false;
              address.city ? endereco[0].push(address.city): false;
              endereco[1] = address.state;

              endereco[0] = endereco[0].join(', ');
              endereco = endereco.join(' - ');

              let marker = L.marker([lat, lon], { icon: customIcon_for_origin }).addTo(map)
                  .bindPopup(endereco)
                  .openPopup();

              markers.push(marker);
              map.setView([lat, lon], 13);
              toggleSpinner();
          });
      }, function(error) {
          console.error('Erro ao obter localização:', error);
          alert('Erro ao obter localização: ' + error.message);
          toggleSpinner();
      });
  } else {
      alert('Geolocalização não é suportada pelo seu navegador.');
      toggleSpinner();
  }
}

// Função para atualizar a rota
async function updateRoute() {
  toggleSpinner();
  clearMap()
  var startAddress     = document.getElementById('start').value;
  var startVetor_value = document.getElementById('start-vetor').value;
  var endAddress       = document.getElementById('end').value;
  var endVetor_value   = document.getElementById('end-vetor').value;

  var startVetor = [];
  var endVetor = [];

  if(startVetor_value){
    let startVetor_arr = startVetor_value.split(',');
    
    startVetor = L.latLng(startVetor_arr[0], startVetor_arr[1]);
  } else {
    startVetor = await geocode(startAddress);
  }

  if(endVetor_value){
    let endVetor_arr = endVetor_value.split(',');
    
    endVetor = L.latLng(endVetor_arr[0], endVetor_arr[1]);
  } else {
    endVetor = await geocode(endAddress);
  }

  control.setWaypoints([startVetor, endVetor]);
  toggleSpinner();
  toggleButtonUsage('#run');
}

// Função para habilitar a marcação de local no mapa
function enableMapClick() {
  alert('Clique no local desejado no mapa.');
  clearMap()
  map.on('click', applyMapClick);
}

function applyMapClick(e){
  toggleSpinner();
  var latLng = e.latlng;
  reverseGeocode(latLng.lat, latLng.lng, function(address) {
    let endereco = [[]];
    address.road ? endereco[0].push(address.road): false;
    address.suburb ? endereco[0].push(address.suburb): false;
    address.city ? endereco[0].push(address.city): false;
    endereco[1] = address.state;
    
    endereco[0] = endereco[0].join(', ');
    endereco = endereco.join(' - ');

    document.getElementById('end').value = endereco;

    let marker = L.marker(latLng).addTo(map)
        .bindPopup(endereco)
        .openPopup();

    markers.push(marker);
    toggleSpinner();
  });
  
  document.getElementById('end-vetor').value = latLng.lat + ',' + latLng.lng;
  
  disableMapClick();
}

function disableMapClick(){
  map.off('click', applyMapClick);
}

function clearVetor(vetor){
  document.getElementById(vetor+"-vetor").value = '';
}

function setDirection(){
  // Verifica se o dispositivo suporta a API de orientação
  if (window.DeviceOrientationEvent) {
    // Adiciona um listener para o evento de orientação do dispositivo
    window.addEventListener('deviceorientation', (event) => {
      const alpha = event.alpha;  // O valor "alpha" indica a direção do heading (em graus)
      if (alpha !== null) {
        // Rotaciona o mapa com base no valor alpha
        console.log('alpha:', alpha)
        applyRotation(alpha);
      }
    }, true);
  } else {
    alert("Seu dispositivo não suporta a API de Orientação.");
  }
}

function toggleSpinner(){
  const loading = document.querySelector('.loading');
  loading.style.display = loading.style.display === 'none' ? 'flex' : 'none';
}

function toggleButtonUsage(button_selector, action){
  const button = document.querySelector(button_selector);
  
  if(action){
    if(action == 'disable') {
      button.classList.add('disabled');
    } else {
      button.classList.remove('disabled');
    }
  } else {
    if(button.classList.contains('disabled')){
      button.classList.remove('disabled');
    } else {
      button.classList.add('disabled');
    }
  }
}

// Função para atualizar a posição da origem em tempo real
function run() {
  toggleSpinner();
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(function(position) {
      var lat = position.coords.latitude;
      var lon = position.coords.longitude;
      var latLng = L.latLng(lat, lon);
      //  {lat: -12.2137, lng: -38.9732}

      // Atualiza a origem da rota
      control.spliceWaypoints(0, 1, latLng);

      // Obtenha os waypoints da rota
      var waypoints = control.getWaypoints().map(function(waypoint) {
        return waypoint.latLng;
      });

      const status = document.querySelector('#map').dataset.status;

      if(status != 'free'){
        setDirection();
      }

      // Ajuste o zoom do mapa para caber todos os waypoints
      if (waypoints.length > 1 && status == 'full') {
        var bounds = L.latLngBounds(waypoints);
        map.fitBounds(bounds);
      } else if (status == 'follow') {
        map.setView(latLng, 1000);
      }
      toggleButtonUsage('#tracar-rota', 'disable');
      toggleButtonUsage('#run', 'disable');
    }, function(error) {
      console.error('Erro ao obter localização:', error);
      alert('Erro ao obter localização: ' + error.message);
    }, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000
    });
  } else {
    alert('Geolocalização não é suportada pelo seu navegador.');
  }
  toggleSpinner();
}