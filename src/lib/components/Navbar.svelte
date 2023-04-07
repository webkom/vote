<script>
  import { page } from '$app/stores';
</script>

<nav>
  {#if $page.url.pathname.includes('admin')}
    <ul class="list-unstyled">
      <li>
        <a href="/admin">Avstemninger</a>
      </li>
      <li>
        <a href="/admin/create_election">Lag avstemning</a>
      </li>
    </ul>
  {:else if $page.url.pathname.includes('moderator')}
    <ul class="list-unstyled">
      <li>
        <a href="/moderator/create_user">Registrer bruker</a>
      </li>
      <li>
        <a href="/moderator/generate_user">Generer bruker</a>
      </li>
      <li>
        <a href="/moderator/qr">QR</a>
      </li>
      <li>
        <a href="/moderator/activate_user">Aktiver bruker</a>
      </li>
      <li>
        <a href="/moderator/change_card">Mistet kort</a>
      </li>
      <li>
        <a href="/moderator/manage_register">Register</a>
      </li>
      <li>
        <a href="/moderator/deactivate_users">Deaktiver brukere</a>
      </li>
    </ul>
  {:else if !$page.url.pathname.includes('login')}
    <ul class="list-unstyled">
      <li>
        <a href="/">Stem</a>
      </li>
      <li>
        <a href="/retrieve">Valider stemme</a>
      </li>
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
  nav ul li a:hover {
    color: $abakus-light;
  }
</style>
