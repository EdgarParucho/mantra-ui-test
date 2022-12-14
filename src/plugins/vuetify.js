import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';
import es from 'vuetify/lib/locale/es';

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
      options: {
        customProperties: true,
      },
    themes: {
      light: {
        primary: '#11BD56',
        secondary: '#118D36',
        accent: '#00c0d0',
        error: '#FF5252',
        info: '#1156bD',
        success: '#11CD56',
        warning: '#FFBF00'
      },
      dark: {
        primary: '#11BD56',
        secondary: '#118D36',
        accent: '#00c0d0',
        error: '#FF5252',
        info: '#1156bD',
        success: '#11CD56',
        warning: '#FFBF00'
      }
    },
  },
    lang: {
      locales: { es },
      current: 'es',
    },
});
