// Inicializa o mapa
var map = L.map('map').setView([-12.2664, -38.9663], 13);

// Adiciona a camada do OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Inicializa o controle de roteamento
var control = L.Routing.control({
  waypoints: [],
  routeWhileDragging: true
}).addTo(map);

// Função para geocodificar um endereço
function geocode(address, callback) {
  var url = 'https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(address);
  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data && data.length > 0) {
        var latLng = L.latLng(data[0].lat, data[0].lon);
        callback(latLng);
      } else {
        alert('Endereço não encontrado: ' + address);
      }
    })
    .catch(error => {
      console.error('Erro na geocodificação:', error);
      alert('Erro na geocodificação: ' + address);
    });
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
  if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
          var lat = position.coords.latitude;
          var lon = position.coords.longitude;
          reverseGeocode(lat, lon, function(address) {
              document.getElementById('start').textContent = JSON.stringify(address);
              L.marker([lat, lon]).addTo(map)
                  .bindPopup('Você está aqui!')
                  .openPopup();
              map.setView([lat, lon], 13);
          });
      }, function(error) {
          console.error('Erro ao obter localização:', error);
          alert('Erro ao obter localização: ' + error.message);
      });
  } else {
      alert('Geolocalização não é suportada pelo seu navegador.');
  }
}

// Função para atualizar a rota
function updateRoute() {
  var startAddress = document.getElementById('start').value;
  var endAddress = document.getElementById('end').value;

  geocode(startAddress, function (startLatLng) {
    geocode(endAddress, function (endLatLng) {
      control.setWaypoints([startLatLng, endLatLng]);
    });
  });
}