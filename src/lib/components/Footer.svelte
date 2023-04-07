<script lang="ts">
  import { page } from '$app/stores';

  const showLogout = !$page.url.pathname.includes('login');
</script>

<footer>
  <div class="container text-center">
    {#if showLogout}
      <a href="#top" tabindex="-1">Logg ut</a>
      | Laget av
    {/if}
    <a href="http://github.com/webkom/vote">Webkom</a>
    | For <a href="https://abakus.no">Abakus</a>
    | Se <a href="/usage" tabindex="-1" target="_blank">bruk</a>
    | vote:
    <!-- <a
      href={'https://hub.docker.com/r/abakus/vote/tags?page=1&ordering=last_updated&name=' +
        env.RELEASE}>{env.RELEASE}</a
    > -->
  </div>
</footer>

<style lang="scss">
  @import '../../variables.scss';

  footer {
    position: absolute;
    width: 100%;
    margin: 0 auto;
    bottom: 0;
  }
  footer a {
    color: $abakus-light;
  }
  footer a:hover {
    color: $abakus-dark;
  }

  @media (max-width: 1000px) {
    footer {
      padding-top: 20px;
    }
  }
</style>
