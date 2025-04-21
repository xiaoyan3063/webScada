import Vue from 'vue';
import Vuex from 'vuex';

import editor from './modules/editor.js';
import animation from './modules/animation.js';

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        editor,
        animation
    },
    // strict: process.env.NODE_ENV !== 'production'
});