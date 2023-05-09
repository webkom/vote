<script lang="ts">
  import logo from '$lib/assets/Abakule.jpg';
  import Footer from '$lib/components/Footer.svelte';
  import NavBar from '$lib/components/Navbar.svelte';
  import Alerts from '$lib/components/Alerts.svelte';
</script>

<header>
  <div class="container">
    <div class="row header">
      <div class="col-xs-12">
        <img src={logo} alt="abakus logo" /><span>vote</span>
      </div>
    </div>
    <div class="row">
      <NavBar />
    </div>
  </div>
</header>
<Alerts />
<slot />
<Footer />

<style lang="scss">
  @import '../variables.scss';

  :global(html) {
    min-height: 100%;
    position: relative;
  }
  :global(body) {
    font-family: 'Raleway', 'Lucida Grande';
    font-weight: 300;
    word-break: break-word;
    margin-bottom: 30px;
    color: $font-gray;
  }
  header {
    width: 100%;
    border-bottom: 2px solid #e0e0e0;
    margin-bottom: 20px;
  }
  .header {
    text-align: center;
    font-size: 60px;
    font-weight: 100;
    padding-top: 50px;
  }
  .header img {
    margin-right: 15px;
    width: 35px;
  }
  :global(a) {
    color: $abakus-light;
  }
  :global(a:hover, a:focus) {
    color: $abakus-dark;
    text-decoration: none;
  }
  :global(.alert) {
    margin: 15px auto;
    max-width: 90%;
  }
  :global(h2, h3, .btn) {
    font-weight: 300;
  }

  :global(.btn) {
    font-size: 20px;
    margin: 20px;
  }
  :global(.btn:active:focus) {
    outline: none;
  }
  :global(.btn:focus) {
    outline: none;
  }

  :global(label) {
    font-weight: 300;
    font-size: 20px;
    letter-spacing: 0.1em;
  }

  :global(.center) {
    max-width: 750px;
    margin: 0 auto;
    font-size: 21px;
  }
  :global(.form-control) {
    font-size: 18px;
    height: 40px;
  }

  /* 
  hr {
    margin: 10px 0;
  }
  .text-danger {
    font-size: 18px;
  }
  .container {
    width: 100%;
  }
  .mono {
    font-family: 'Cutive Mono', monospace;
    font-size: 16px;
  }
  .fade {
    transition: opacity 0.5s;
    opacity: 0;
  }*/
  @media (max-width: 1000px) {
    .header {
      padding-top: 0;
    }
  }
  :global(.usage-flex) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0 10px;
  }
  /* 
  .usage-flex a {
    align-self: flex-end;
  }
  .th-right {
    text-align: right;
    width: 50%;
  }
  .th-left {
    text-align: left;
    width: 50%;
  }
  .cs-tooltip {
    position: relative;
    display: inline-block;
    border-bottom: 1px dotted #000;
  }
  .cs-tooltip .cs-tooltiptext {
    visibility: hidden;
    width: 120px;
    bottom: 130%;
    left: 50%;
    margin-left: -60px;
    background-color: #000;
    color: #fff;
    text-align: center;
    padding: 5px 0;
    border-radius: 6px;
    position: absolute;
    z-index: 1;
  }
  .cs-tooltip .cs-tooltiptext::after {
    content: ' ';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #000 transparent transparent transparent;
  }
  .cs-tooltip:hover .cs-tooltiptext {
    visibility: visible;
  } */
</style>
