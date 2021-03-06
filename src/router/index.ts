import Vue from 'vue';
import VueRouter, {RouteConfig} from 'vue-router';

import Labels from '@/views/Labels.vue';
import Statistics from '@/views/Statistics.vue';
import Money from '@/views/Money.vue';
import NotFound from '@/views/NotFound.vue';
import EditLabel from '@/views/EditLabel.vue';

Vue.use(VueRouter);

//一般只改这部分，其他默认

const routes: Array<RouteConfig> = [

  //如果是根路径就重定向到 /money
  {
    path: '/',
    redirect: '/money'
  },

  {
    path: '/money',
    component: Money
  },
  {
    path: '/labels',
    component: Labels
  },
  {
    path: '/statistics',
    component: Statistics
  },
  {
    path: '/labels/edit/:id',  //:id占位，this.$route.params 得到 {id: xxx}
    component: EditLabel
  },

  //router的判断是自上而下的，像if一样，所以最后的是 *，指除了前面的之外
  {
    path: '*',
    component: NotFound
  }

  // {
  //   path: '/',
  //   name: 'Home',
  //   component: Home
  // },
  // {
  //   path: '/about',
  //   name: 'About',
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  // }
];

const router = new VueRouter({
  routes
});

export default router;
