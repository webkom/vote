<script lang="ts">
  import { page } from '$app/stores';

  type NavGroup = {
    path: string;
    name: string;
  };

  const navGroups: Record<string, NavGroup[]> = {
    admin: [
      {
        name: 'Avstemninger',
        path: '/admin',
      },
      {
        name: 'Lag avstemning',
        path: '/admin/create_election',
      },
    ],
    moderator: [
      {
        name: 'Registrer bruker',
        path: '/moderator/create_user',
      },
      {
        name: 'Generer bruker',
        path: '/moderator/generate_user',
      },
      {
        name: 'QR',
        path: '/moderator/qr',
      },
      {
        name: 'Aktiver bruker',
        path: '/moderator/activate_user',
      },
      {
        name: 'Mistet kort',
        path: '/moderator/change_card',
      },
      {
        name: 'Register',
        path: '/moderator/manage_register',
      },
      {
        name: 'Deaktiver brukere',
        path: '/moderator/deactivate_users',
      },
    ],
    usage: [],
    default: [
      { name: 'Stem', path: '/' },
      { name: 'Valider stemme', path: '/retrieve' },
    ],
  };

  $: pathname = $page.url.pathname;
  $: isLogin = pathname.includes('login');

  $: navGroupName =
    Object.keys(navGroups).find((ngId) => pathname.includes(ngId)) ?? 'default';

  $: navGroup = !isLogin ? navGroups[navGroupName] : [];
</script>

<nav>
  {#if !isLogin}
    <ul class="list-unstyled">
      {#each navGroup as nav (nav.name)}
        <li>
          <a
            class:active={pathname === nav.path}
            href="{nav.path}{$page.url.search}">{nav.name}</a
          >
        </li>
      {/each}
    </ul>
  {/if}
</nav>

<style lang="scss">
  @import '../../variables.scss';
  nav ul {
    padding-top: 10px;
    padding-bottom: 20px;
    text-align: center;
    width: 100%;
    margin: 0 auto;
  }
  nav ul li {
    display: inline;
  }
  nav ul li:not(:first-child) {
    padding-left: 20px;
  }
  nav ul li a {
    font-size: 20px;
    color: $font-gray;
    text-decoration: none;
  }
  nav ul li a:hover,
  nav ul li .active {
    color: $abakus-light;
  }
</style>
