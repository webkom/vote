<script lang="ts">
  let showLogout = true;
</script>

<footer>
  <div class="container text-center">
    {#if showLogout}
      <span id="logoutSpan">
        <a href="#top" tabindex="-1">Logg ut</a>
        | Laget av
      </span>
    {/if}
    <a href="http://github.com/webkom/vote">Webkom</a>
    | For <a href="https://abakus.no">Abakus</a>
    | Se <a href="/usage" tabindex="-1" target="_blank">bruk</a>
    | vote:
    <!-- <a
        href={'https://hub.docker.com/r/abakus/vote/tags?page=1&ordering=last_updated&name=' +
          process.env.RELEASE}>{process.env.RELEASE}</a
      > -->
  </div>
</footer>

<style type="text/css">
  footer {
    position: absolute;
    height: 30px;
    width: 100%;
    margin: 0 auto;
    bottom: 0;
  }
  footer a {
    color: var(--abakus-light);
  }
  footer a:hover {
    color: var(--abakus-dark);
  }

  @media (max-width: 1000px) {
    footer {
      padding-top: 20px;
    }
  }
</style>
