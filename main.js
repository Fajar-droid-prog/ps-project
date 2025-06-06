const API_KEY = '114321c4f23f6a9848047083d43771f9';

let map;
let marker;
let chart;

function initMap() {
  map = L.map('map').setView([-2.5, 118], 5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);
}

function resetWeatherInfo() {
  document.getElementById('cityName').textContent = '';
  document.getElementById('temperature').textContent = '';
  document.getElementById('description').textContent = '';
  document.getElementById('humidity').textContent = '';
  document.getElementById('weatherIcon').src = '';
  if (chart) chart.destroy();
}

document.getElementById('searchBtn').addEventListener('click', async () => {
  const city = document.getElementById('cityInput').value.trim();
  if (!city) {
    alert('City name is required');
    return;
  }

  resetWeatherInfo();

  try {
    const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`);
    const geo = await geoRes.json();

    if (geo.length === 0) {
      document.getElementById('weatherInfo').classList.remove('hidden');
      document.getElementById('cityName').textContent = 'Kota tidak ditemukan';
      document.getElementById('temperature').textContent = '--°C';
      document.getElementById('description').textContent = '-';
      document.getElementById('humidity').textContent = '--%';
      document.getElementById('weatherIcon').src = '';
      return;
    }

    const lat = geo[0].lat;
    const lon = geo[0].lon;

    const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
    const weather = await weatherRes.json();

    const suhu = weather.main.temp;
    const kelembapan = weather.main.humidity;
    const deskripsi = weather.weather[0].description;

    document.getElementById('cityName').textContent = `${city}`;
    document.getElementById('temperature').textContent = `${Math.round(suhu)}°C`;
    document.getElementById('description').textContent = deskripsi;
    document.getElementById('humidity').textContent = `${kelembapan}%`;

    const iconCode = weather.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    document.getElementById('weatherIcon').src = iconUrl;

    document.getElementById('weatherInfo').classList.remove('hidden');

    const resultSection = document.getElementById('resultSection');
    resultSection.classList.remove('hidden');
    setTimeout(() => {
      resultSection.classList.add('show');
      map.invalidateSize(); //  Fix agar peta muncul
    }, 100);

    map.setView([lat, lon], 11);
    if (marker) map.removeLayer(marker);
    marker = L.marker([lat, lon]).addTo(map)
      .bindPopup(`<b>${city}</b><br>${suhu}°C, ${deskripsi}`)
      .openPopup();

    const ctx = document.getElementById('weatherChart').getContext('2d');
    if (chart) chart.destroy();

    chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Temperature (°C)', 'Humidity (%)'],
        datasets: [{
          label: 'Data Cuaca',
          data: [suhu, kelembapan],
          backgroundColor: ['rgba(0, 123, 255, 0.8)', 'rgba(0, 123, 255, 0.8)']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            ticks: {
              color: 'black',
              font: {
                family: 'Fredoka',
                size: 16,
              }
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 10,
              color: 'black',
              font: {
                family: 'Fredoka',
                size: 14,
              }
            }
          }
        }
      }
    });

  } catch (error) {
    resetWeatherInfo();
    document.getElementById('cityName').textContent = 'Terjadi kesalahan mengambil data';
    console.error(error);
  }
});

// Inisialisasi peta setelah halaman dimuat
window.addEventListener('load', initMap);
