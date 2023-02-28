<script lang="ts">
  import logo from '$lib/assets/Abakule.jpg';
  import Footer from '$lib/Footer.svelte';
  import NavBar from '$lib/Navbar.svelte';
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
<slot />
<Footer />

<style type="text/css">
  @import url('https://fonts.googleapis.com/css?family=Raleway:300,200,100');
  @import url('https://fonts.googleapis.com/css2?family=Cutive+Mono&display=swap');

  /*  @import url('https://fonts.googleapis.com/css?family=Oxygen:400,700');
   @media screen {
      /* Thanks Outlook 2013! * /
     * {
       font-family: 'Oxygen', 'Helvetica Neue', 'Arial', 'sans-serif' !important;
     }
   } */

  :global(:root) {
    --font-gray: #666c77;
    --alternative-background: darken(var(--font-gray), 20%);
    --dark-gray: #333;
    --abakus-light: #cc0000;
    --abakus-dark: #bd0005;
    --red: #b11b11;
    --white: #fdfdfd;
  }

  :global(html) {
    min-height: 100%;
    position: relative;
  }
  :global(body) {
    font-family: 'Raleway', 'Lucida Grande';
    font-weight: 300;
    word-break: break-word;
    margin-bottom: 30px;
    color: var(--font-gray);
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
    color: var(--abakus-light);
  }
  :global(a:hover, a:focus) {
    color: var(--abakus-dark);
    text-decoration: none;
  }
  /* h2,
  h3,
  .btn {
    font-weight: 300;
  }
  hr {
    margin: 10px 0;
  }
  .alert {
    margin: 15px auto;
    max-width: 90%;
  }
  .text-danger {
    font-size: 18px;
  }
  .container {
    width: 100%;
  }
  .center {
    max-width: 750px;
    margin: 0 auto;
    font-size: 21px;
  }
  .mono {
    font-family: 'Cutive Mono', monospace;
    font-size: 16px;
  }
  label {
    font-weight: 300;
    font-size: 20px;
    letter-spacing: 0.1em;
  }
  .fade {
    transition: opacity 0.5s;
    opacity: 0;
  }
  .btn {
    font-size: 20px;
  }
  .btn:active:focus {
    outline: none;
  }
  .btn:focus {
    outline: none;
  }
  .vote-result-form {
    margin: 0 auto;
  }
  .vote-result-form input {
    margin: 10px auto;
    text-align: center;
    width: 70%;
  }
  .vote-result-feedback {
    margin-top: 30px;
  }
  .vote-result-feedback p {
    font-size: 18px;
  }
  .form-control {
    font-size: 18px;
    height: 40px;
  }*/
  @media (max-width: 1000px) {
    /* .vote-result-form input {
      width: 100%;
    } */
    .header {
      padding-top: 0;
    }
  }
  /* .usage-flex {
    display: flex;
    justify-content: space-between;
    margin: 0 10px;
  }
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
