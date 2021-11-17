import Vue from 'vue'
import Router from 'vue-router'
import StockMiniWinPage from "../components/LeeksPages/StockMiniWinPage";
import LeeksIndexPage from "../components/LeeksPages/LeeksIndexPage";

Vue.use(Router)

export default new Router({
    routes: [{
        path: '/',
        name: 'leeks-index-page',
        component: LeeksIndexPage
    }, {
        path: '/StockMiniWinPage',
        name: 'StockMiniWinPage',
        component: StockMiniWinPage
    },
        // {
        //   path: '/',
        //   name: 'landing-page',
        //   component: require('@/components/LandingPage').default
        // },
        {
            path: '*',
            redirect: '/'
        }
    ]
})