import { createApp } from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faGithub,
  faGoogle,
  faYoutube,
  faStackOverflow,
  faNpm,
  faVuejs,
  faDribbble,
  faFigma,
  faUnsplash,
  faCodepen,
} from '@fortawesome/free-brands-svg-icons'
import {
  faEnvelope,
  faLanguage,
  faBook,
  faBolt,
  faPalette,
  faIcons,
  faNoteSticky,
  faRobot,
  faCode,
  faGlobe,
  faSearch,
  faBlog,
  faCloud,
  faWrench,
  faBuilding,
  faFilm,
  faToolbox,
  faLightbulb,
  faUnlock,
  faImages,
  faDatabase,
  faFolder,
  faStar,
  faCopy,
} from '@fortawesome/free-solid-svg-icons'
import App from './App.vue'

library.add(
  faGithub, faGoogle, faYoutube, faStackOverflow, faNpm, faVuejs,
  faDribbble, faFigma, faUnsplash, faCodepen,
  faEnvelope, faLanguage, faBook, faBolt, faPalette,
  faIcons, faNoteSticky, faRobot, faCode, faGlobe, faSearch,
  faBlog, faCloud, faWrench, faBuilding, faFilm, faToolbox,
  faLightbulb, faUnlock, faImages, faDatabase, faFolder, faStar, faCopy,
)

const app = createApp(App)
app.component('font-awesome-icon', FontAwesomeIcon)
app.mount('#app')
