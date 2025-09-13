// ======================================
// COMPLETE FACULTY WEBSITE IMPLEMENTATION
// University of Eswatini - Faculty of Humanities
// WITH ENHANCED MULTI-CITY WEATHER
// ======================================

// ======================================
// 1. ENHANCED WEATHER API WITH CITY SWITCHING
// ======================================
class WeatherService {
  constructor() {
    this.apiKey = 'e84a3625784ba1efffd530bf5bf93238';
    this.cities = {
      'manzini': { name: 'Manzini', displayName: 'Manzini' },
      'matsapha': { name: 'Matsapha', displayName: 'Matsapha' },
      'mbabane': { name: 'Mbabane', displayName: 'Mbabane' },
      'nhlangano': { name: 'Nhlangano', displayName: 'Nhlangano' },
      'siteki': { name: 'Siteki', displayName: 'Siteki' }
    };
    
    this.currentCity = this.getSavedCity() || 'manzini';
    this.updateInterval = null;
    this.init();
  }

  init() {
    this.createCitySelector();
    this.bindEvents();
  }

  createCitySelector() {
    const checkWeatherContainer = () => {
      const weatherContainer = document.getElementById('weather');
      if (weatherContainer) {
        this.insertCitySelector(weatherContainer);
      } else {
        setTimeout(checkWeatherContainer, 100);
      }
    };
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', checkWeatherContainer);
    } else {
      checkWeatherContainer();
    }
  }

  insertCitySelector(weatherContainer) {
    if (document.getElementById('city-selector')) return;

    const citySelector = document.createElement('select');
    citySelector.id = 'city-selector';
    citySelector.className = 'city-selector';
    
    citySelector.style.cssText = `
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      padding: 5px 8px;
      border-radius: 4px;
      font-size: 0.9em;
      margin-left: 10px;
      cursor: pointer;
      outline: none;
      transition: all 0.3s ease;
      min-width: 90px;
      appearance: none;
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
      background-repeat: no-repeat;
      background-position: right 6px center;
      background-size: 12px;
      padding-right: 25px;
    `;

    citySelector.addEventListener('mouseenter', () => {
      citySelector.style.background = 'rgba(255, 255, 255, 0.2)';
    });
    
    citySelector.addEventListener('mouseleave', () => {
      citySelector.style.background = 'rgba(255, 255, 255, 0.1)';
    });

    Object.entries(this.cities).forEach(([key, city]) => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = city.displayName;
      option.style.cssText = 'color: #333; background: white;';
      
      if (key === this.currentCity) {
        option.selected = true;
      }
      
      citySelector.appendChild(option);
    });

    const cityNameElement = weatherContainer.querySelector('h2');
    if (cityNameElement) {
      cityNameElement.appendChild(citySelector);
    }
  }

  bindEvents() {
    const bindCitySelector = () => {
      const citySelector = document.getElementById('city-selector');
      if (citySelector) {
        citySelector.addEventListener('change', (e) => {
          this.changeCity(e.target.value);
        });
      } else {
        setTimeout(bindCitySelector, 100);
      }
    };
    
    setTimeout(bindCitySelector, 500);
  }

  async changeCity(cityKey) {
    if (!this.cities[cityKey]) {
      console.error('Invalid city key:', cityKey);
      return;
    }

    this.currentCity = cityKey;
    this.saveCity(cityKey);
    this.updateCityDisplay();
    this.showWeatherLoading();
    await this.updateWeatherDisplay();
    this.showCityChangeNotification(this.cities[cityKey].displayName);
  }

  updateCityDisplay() {
    const cityNameElement = document.querySelector('#weather h2');
    if (cityNameElement) {
      const selector = cityNameElement.querySelector('#city-selector');
      cityNameElement.textContent = this.cities[this.currentCity].displayName;
      if (selector) {
        cityNameElement.appendChild(selector);
      }
    }
  }

  showWeatherLoading() {
    const temperatureElement = document.getElementById('temperature');
    const iconElement = document.getElementById('weather-icon');
    
    if (temperatureElement) {
      temperatureElement.textContent = 'Loading...';
      temperatureElement.style.opacity = '0.7';
    }
    
    if (iconElement) {
      iconElement.style.opacity = '0.7';
      iconElement.style.animation = 'spin 1s linear infinite';
    }
  }

  hideWeatherLoading() {
    const temperatureElement = document.getElementById('temperature');
    const iconElement = document.getElementById('weather-icon');
    
    if (temperatureElement) {
      temperatureElement.style.opacity = '1';
    }
    
    if (iconElement) {
      iconElement.style.opacity = '1';
      iconElement.style.animation = 'none';
    }
  }

  showCityChangeNotification(cityName) {
    const notification = document.createElement('div');
    notification.textContent = `Weather updated for ${cityName}`;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #2a5298, #1e3c72);
      color: white;
      padding: 10px 15px;
      border-radius: 5px;
      font-size: 0.9em;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      border-left: 4px solid #ff6b35;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 2000);
  }

  buildApiURL() {
    const cityName = this.cities[this.currentCity].name;
    return `https://api.allorigins.win/get?url=${encodeURIComponent(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${this.apiKey}&units=metric`)}`;
  }

  async fetchWeatherData() {
    try {
      const apiURL = this.buildApiURL();
      const response = await fetch(apiURL);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const proxyData = await response.json();
      const data = JSON.parse(proxyData.contents);
      
      return {
        temperature: data.main.temp,
        description: data.weather[0].description,
        iconCode: data.weather[0].icon,
        iconURL: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
        city: data.name,
        humidity: data.main.humidity,
        windSpeed: data.wind?.speed || 0,
        feelsLike: data.main.feels_like
      };
    } catch (error) {
      console.error('Weather API Error:', error);
      
      return {
        temperature: 22,
        description: 'Pleasant',
        iconCode: '01d',
        iconURL: 'data:image/svg+xml;base64,' + btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFD700"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`),
        city: this.cities[this.currentCity].displayName,
        humidity: 65,
        windSpeed: 5,
        feelsLike: 24
      };
    }
  }

  async updateWeatherDisplay() {
    const weatherData = await this.fetchWeatherData();

    const temperatureElement = document.getElementById('temperature');
    const iconElement = document.getElementById('weather-icon');

    if (temperatureElement) {
      temperatureElement.textContent = `${Math.round(weatherData.temperature)}°C`;
      temperatureElement.title = `Feels like ${Math.round(weatherData.feelsLike)}°C\nHumidity: ${weatherData.humidity}%\nWind: ${weatherData.windSpeed} m/s`;
    }

    if (iconElement) {
      iconElement.src = weatherData.iconURL;
      iconElement.alt = weatherData.description;
      iconElement.style.display = 'block';
      iconElement.title = weatherData.description;
    }

    this.hideWeatherLoading();
  }

  saveCity(cityKey) {
    try {
      localStorage.setItem('selected_city', cityKey);
      
      // Also update session manager if available
      if (sessionManager) {
        const session = sessionManager.getSession();
        if (session) {
          session.preferences.selectedCity = cityKey;
          sessionManager.updateSession(session);
        }
      }
    } catch (error) {
      console.warn('Could not save city preference:', error);
    }
  }

  getSavedCity() {
    try {
      // Try localStorage first
      const saved = localStorage.getItem('selected_city');
      if (saved && this.cities[saved]) {
        return saved;
      }
      
      // Try session manager
      if (sessionManager) {
        const session = sessionManager.getSession();
        if (session && session.preferences.selectedCity && this.cities[session.preferences.selectedCity]) {
          return session.preferences.selectedCity;
        }
      }
      
      return null;
    } catch (error) {
      console.warn('Could not load city preference:', error);
      return null;
    }
  }

  startWeatherUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.updateWeatherDisplay();
      });
    } else {
      this.updateWeatherDisplay();
    }
    
    this.updateInterval = setInterval(() => {
      this.updateWeatherDisplay();
    }, 600000); // 10 minutes
  }

  stopWeatherUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  // Public API methods
  setCityByName(cityName) {
    const cityKey = Object.keys(this.cities).find(
      key => this.cities[key].name.toLowerCase() === cityName.toLowerCase()
    );
    
    if (cityKey) {
      this.changeCity(cityKey);
      const selector = document.getElementById('city-selector');
      if (selector) {
        selector.value = cityKey;
      }
    } else {
      console.warn('City not found:', cityName);
    }
  }

  async getCurrentWeather() {
    return await this.fetchWeatherData();
  }

  getAvailableCities() {
    return Object.entries(this.cities).map(([key, city]) => ({
      key,
      name: city.name,
      displayName: city.displayName
    }));
  }

  getCurrentCityInfo() {
    return {
      key: this.currentCity,
      ...this.cities[this.currentCity]
    };
  }
}

// ======================================
// 2. NAVIGATION SYSTEM WITH ROUTING
// ======================================

class NavigationManager {
    constructor() {
        this.currentPage = 'faculty';
        this.pages = {
            'faculty': { title: 'Faculty of Humanities', breadcrumb: 'Faculty of Humanities' },
            'acs': { title: 'Academic Communication Skills', breadcrumb: 'Faculty of Humanities > Academic Communication Skills' },
            'african-lang': { title: 'African Languages and Literature', breadcrumb: 'Faculty of Humanities > African Languages and Literature' },
            'english': { title: 'English Language and Literature', breadcrumb: 'Faculty of Humanities > English Language and Literature' },
            'history': { title: 'History Department', breadcrumb: 'Faculty of Humanities > History' },
            'journalism': { title: 'Journalism and Mass Communication', breadcrumb: 'Faculty of Humanities > Journalism and Mass Communication' },
            'theology': { title: 'Theology and Religious Studies', breadcrumb: 'Faculty of Humanities > Theology and Religious Studies' }
        };
        
        this.init();
    }

    init() {
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.page) {
                this.loadPage(event.state.page, false);
            }
        });

        this.handleDeepLinking();
    }

    handleDeepLinking() {
        const urlParams = new URLSearchParams(window.location.search);
        const pageParam = urlParams.get('page');
        const hashPage = window.location.hash.substring(1);
        
        let targetPage = pageParam || hashPage || 'faculty';
        
        if (this.pages[targetPage]) {
            this.loadPage(targetPage, false);
        } else {
            this.loadPage('faculty', false);
        }
    }

    async loadPage(pageId, updateHistory = true) {
        if (!this.pages[pageId]) {
            console.error(`Page ${pageId} not found`);
            return;
        }

        try {
            this.showLoadingState();
            
            this.currentPage = pageId;
            const page = this.pages[pageId];

            document.title = `${page.title} - University of Eswatini`;
            this.updateNavigation(pageId);

            await new Promise(resolve => setTimeout(resolve, 500));

            if (updateHistory) {
                const newURL = `${window.location.pathname}?page=${pageId}`;
                window.history.pushState({ page: pageId }, page.title, newURL);
            }

            this.hideLoadingState();
            this.showPageLoadNotification(page.title);

            if (sessionManager) {
                sessionManager.updateCurrentPage(pageId);
            }

        } catch (error) {
            console.error('Error loading page:', error);
            this.hideLoadingState();
        }
    }

    updateNavigation(activePageId) {
        document.querySelectorAll('nav a').forEach(link => {
            link.classList.remove('active');
        });

        const activeLink = document.querySelector(`nav a[data-page="${activePageId}"]`);
        if (activeLink) {
            activeLink.closest('li').classList.add('active');
        }

        document.querySelectorAll('.dropdown-content a').forEach(link => {
            link.classList.remove('current');
        });

        const currentDropdownLink = document.querySelector(`.dropdown-content a[data-page="${activePageId}"]`);
        if (currentDropdownLink) {
            currentDropdownLink.classList.add('current');
        }
    }

    showLoadingState() {
        const loader = document.getElementById('loading-overlay');
        if (loader) {
            loader.style.display = 'flex';
        }
    }

    hideLoadingState() {
        const loader = document.getElementById('loading-overlay');
        if (loader) {
            loader.style.display = 'none';
        }
    }

    showPageLoadNotification(pageTitle) {
        console.log(`Loaded: ${pageTitle}`);
    }
}

// ======================================
// 3. ENHANCED SESSION MANAGEMENT
// ======================================

class SessionManager {
    constructor() {
        this.sessionKey = 'uneswa_faculty_session';
        this.init();
    }

    init() {
        if (!this.getSession()) {
            this.createSession();
        }
        this.updateLastActivity();
    }

    createSession() {
        const session = {
            id: this.generateSessionId(),
            startTime: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            currentPage: 'faculty',
            visitedPages: ['faculty'],
            preferences: { 
                theme: 'default', 
                language: 'en',
                selectedCity: 'manzini'
            }
        };

        localStorage.setItem(this.sessionKey, JSON.stringify(session));
        return session;
    }

    getSession() {
        const sessionData = localStorage.getItem(this.sessionKey);
        return sessionData ? JSON.parse(sessionData) : null;
    }

    updateSession(session) {
        localStorage.setItem(this.sessionKey, JSON.stringify(session));
    }

    updateCurrentPage(pageId) {
        const session = this.getSession();
        if (session) {
            if (!session.visitedPages.includes(pageId)) {
                session.visitedPages.push(pageId);
            }

            session.currentPage = pageId;
            session.lastActivity = new Date().toISOString();
            this.updateSession(session);
        }
    }

    updateLastActivity() {
        const session = this.getSession();
        if (session) {
            session.lastActivity = new Date().toISOString();
            this.updateSession(session);
        }
    }

    generateSessionId() {
        return 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
    }
}

// ======================================
// 4. SEARCH FUNCTIONALITY
// ======================================

class SearchManager {
    constructor() {
        this.searchData = {
            departments: [
                { 
                    id: 'acs', 
                    name: 'Academic Communication Skills', 
                    type: 'Department',
                    description: 'Developing essential communication competencies for academic and professional success.',
                    keywords: ['communication', 'academic writing', 'presentation', 'english', 'writing skills']
                },
                { 
                    id: 'african-lang', 
                    name: 'African Languages and Literature', 
                    type: 'Department',
                    description: 'Preserving and promoting African linguistic heritage and literary scholarship.',
                    keywords: ['siswati', 'african', 'literature', 'languages', 'culture', 'heritage']
                },
                { 
                    id: 'english', 
                    name: 'English Language and Literature', 
                    type: 'Department',
                    description: 'Excellence in English studies, from language proficiency to literary analysis.',
                    keywords: ['english', 'literature', 'language', 'writing', 'poetry', 'novels']
                },
                { 
                    id: 'history', 
                    name: 'History', 
                    type: 'Department',
                    description: 'Exploring African and world history to understand societal developments.',
                    keywords: ['history', 'african history', 'research', 'historical', 'past', 'heritage']
                },
                { 
                    id: 'journalism', 
                    name: 'Journalism and Mass Communication', 
                    type: 'Department',
                    description: 'Training the next generation of media professionals in digital age journalism.',
                    keywords: ['journalism', 'media', 'communication', 'news', 'broadcasting', 'digital media']
                },
                { 
                    id: 'theology', 
                    name: 'Theology and Religious Studies', 
                    type: 'Department',
                    description: 'Interfaith dialogue and theological scholarship across religious traditions.',
                    keywords: ['theology', 'religion', 'religious studies', 'faith', 'spirituality', 'interfaith']
                }
            ]
        };
        
        this.init();
    }

    init() {
        const searchButton = document.querySelector('.search button');
        const searchInput = document.querySelector('.search input');
        
        if (searchButton && searchInput) {
            searchButton.addEventListener('click', () => this.performSearch());
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch();
                }
            });
        }
    }

    performSearch() {
        const searchInput = document.querySelector('.search input');
        const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        
        if (!query) {
            this.showSearchError('Please enter a search term');
            return;
        }

        const results = this.searchData.departments.filter(item => {
            return item.name.toLowerCase().includes(query) ||
                   item.description.toLowerCase().includes(query) ||
                   item.keywords.some(keyword => keyword.toLowerCase().includes(query));
        });

        this.displaySearchResults(query, results);
    }

    displaySearchResults(query, results) {
        const overlay = this.createSearchResultsOverlay(query, results);
        document.body.appendChild(overlay);
    }

    createSearchResultsOverlay(query, results) {
        const overlay = document.createElement('div');
        overlay.className = 'search-results-overlay';
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        };

        const container = document.createElement('div');
        container.className = 'search-results-container';

        const header = document.createElement('h2');
        header.textContent = `Search Results for "${query}" (${results.length} found)`;

        const closeButton = document.createElement('button');
        closeButton.textContent = '×';
        closeButton.style.cssText = 'position: absolute; top: 15px; right: 20px; background: none; border: none; font-size: 24px; cursor: pointer; color: #666;';
        closeButton.onclick = () => overlay.remove();

        container.appendChild(closeButton);
        container.appendChild(header);

        if (results.length === 0) {
            const noResults = document.createElement('p');
            noResults.textContent = 'No results found. Try different keywords or browse our departments directly.';
            noResults.style.color = '#666';
            container.appendChild(noResults);
        } else {
            results.forEach(result => {
                const resultItem = this.createSearchResultItem(result);
                container.appendChild(resultItem);
            });
        }

        overlay.appendChild(container);
        return overlay;
    }

    createSearchResultItem(result) {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        item.onclick = () => {
            if (navigationManager) {
                navigationManager.loadPage(result.id);
            }
            document.querySelector('.search-results-overlay')?.remove();
        };

        const title = document.createElement('h3');
        title.textContent = result.name;

        const type = document.createElement('div');
        type.className = 'result-type';
        type.textContent = result.type;

        const snippet = document.createElement('div');
        snippet.className = 'result-snippet';
        snippet.textContent = result.description;

        item.appendChild(title);
        item.appendChild(type);
        item.appendChild(snippet);

        return item;
    }

    showSearchError(message) {
        alert(message);
    }
}

// ======================================
// 5. INITIALIZATION AND GLOBAL FUNCTIONS
// ======================================

let weatherService;
let navigationManager;
let sessionManager;
let searchManager;

// Global functions
function loadPage(pageId) {
    if (navigationManager) {
        navigationManager.loadPage(pageId);
    }
}

function smoothScrollTo(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

function toggleMobileNav() {
    const nav = document.querySelector('nav ul');
    if (nav) {
        nav.classList.toggle('mobile-active');
    }
}

// Weather utility functions
function changeWeatherCity(cityName) {
    if (weatherService) {
        weatherService.setCityByName(cityName);
    }
}

async function getCurrentWeatherInfo() {
    if (weatherService) {
        return await weatherService.getCurrentWeather();
    }
    return null;
}

function getAvailableWeatherCities() {
    if (weatherService) {
        return weatherService.getAvailableCities();
    }
    return [];
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    try {
        console.log('Initializing Faculty of Humanities website...');
        
        // Initialize core services
        sessionManager = new SessionManager();
        weatherService = new WeatherService();
        navigationManager = new NavigationManager();
        searchManager = new SearchManager();

        // Start weather updates
        weatherService.startWeatherUpdates();

        // Expose services globally for debugging/external access
        window.FacultyWebsite = {
            weather: weatherService,
            navigation: navigationManager,
            session: sessionManager,
            search: searchManager,
            utils: {
                loadPage,
                smoothScrollTo,
                toggleMobileNav,
                changeWeatherCity,
                getCurrentWeatherInfo,
                getAvailableWeatherCities
            }
        };

        console.log('Faculty website fully initialized');
        console.log('Available cities:', weatherService.getAvailableCities());
        console.log('Current city:', weatherService.getCurrentCityInfo());

    } catch (error) {
        console.error('Initialization error:', error);
    }
});
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.menu-toggle');
    const navBar = document.querySelector('nav'); // Select the parent <nav> element

    if (mobileMenuToggle && navBar) {
        mobileMenuToggle.addEventListener('click', function() {
            navBar.classList.toggle('active'); // Toggles the 'active' class on the <nav>
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const audioPlayer = document.getElementById('audioPlayer');
    const playPauseBtn = document.getElementById('playPauseBtn');

    if (audioPlayer && playPauseBtn) {
        playPauseBtn.addEventListener('click', function() {
            if (audioPlayer.paused) {
                audioPlayer.play();
                playPauseBtn.textContent = 'Pause';
            } else {
                audioPlayer.pause();
                playPauseBtn.textContent = 'Listen Live';
            }
        });
    }
});